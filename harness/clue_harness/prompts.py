"""Turning a bank item into a prompt, and an answer back into an option key.

Option order is shuffled with a seed per (persona, item), so every model sees
a persona's item in the same order (paired comparisons across models) while
positions vary across personas and items. Letters shown to the model are
always A, B, C... in display order; they are mapped back to the item's own
option keys before anything is stored.
"""

from __future__ import annotations

import hashlib
import random
import re

LETTERS = "ABCD"

CHOICE_SUFFIX = "Answer with a single letter."
CHOICE_STRICT = "Reply with exactly one letter ({letters}) and nothing else. Do not explain."
SLIDER_SUFFIX = "Answer with a single whole number from 0 to 100."
LIKERT_SUFFIX = "Answer with a single number from {lo} to {hi}."
LIKERT_STRICT = "Reply with exactly one whole number between {lo} and {hi} and nothing else. Do not explain."
SLIDER_STRICT = "Reply with exactly one whole number between 0 and 100 and nothing else. Do not explain."


GUESS_PROMPT = (
    "Now guess how other people answered that last question. Out of 100 people, how many "
    "picked each option? Reply only in the form {example} (the numbers add up to 100)."
)
GUESS_STRICT = "Reply with exactly {example} using your own numbers, adding up to 100, and nothing else."
_EXAMPLES = {2: "A=60, B=40", 3: "A=40, B=35, C=25", 4: "A=40, B=30, C=20, D=10"}


def guess_prompt(order: list[str], strict: bool = False) -> str:
    return (GUESS_STRICT if strict else GUESS_PROMPT).format(example=_EXAMPLES[len(order)])


_GUESS_RE = re.compile(r"\b([A-D])\s*[=:]\s*(\d{1,3})(?:\.\d+)?\s*%?")


def parse_guess(order: list[str], raw: str) -> dict[str, float] | None:
    """Map 'A=40, B=30, ...' to option key -> share (normalised). None unless every shown letter has a number."""
    found: dict[str, float] = {}
    for letter, n in _GUESS_RE.findall((raw or "").upper()):
        found.setdefault(letter, float(n))
    letters = LETTERS[: len(order)]
    if set(found) != set(letters):
        return None
    total = sum(found.values())
    if total <= 0:
        return None
    return {order[LETTERS.index(L)]: found[L] / total for L in letters}


GROUP_HEAD = "Here are {n} situations. Answer each one as yourself."
GROUP_ANSWER = "Reply with one line per situation and nothing else, exactly in this form:\n{lines}"
GROUP_GUESS = ("For each situation, give your own answer, then guess how 100 people split across its options. "
               "Reply with one line per situation and nothing else, exactly in this form:\n{lines}")
GROUP_STRICT = "Every line must start with the situation number, a colon and one letter. Do not explain."


def render_group(cards: list[tuple[dict, list[str]]], guess: bool, strict: bool = False) -> str:
    """Several choice/binary cards in one message, answered (and guessed) in one reply."""
    parts = [GROUP_HEAD.format(n=len(cards)), ""]
    for n, (item, order) in enumerate(cards, 1):
        by_key = {o["key"]: o for o in item["answer"]["options"]}
        parts += [f"Situation {n}", item["scenario"], "What do you do?"]
        parts += [f"{L}. {by_key[k]['text']}" for L, k in zip(LETTERS, order)]
        parts.append("")
    # Placeholders rather than example numbers, so the format does not anchor answers or guesses.
    def line(n: int, order: list[str]) -> str:
        shown = LETTERS[: len(order)]
        base = f"{n}: <{'/'.join(shown)}>"
        return base + " | " + ", ".join(f"{L}=<number>" for L in shown) if guess else base
    lines = "\n".join(line(n, o) for n, (_, o) in enumerate(cards, 1))
    parts.append((GROUP_GUESS if guess else GROUP_ANSWER).format(lines=lines))
    if guess:
        parts.append("The numbers on each line add up to 100.")
    if strict:
        parts.append(GROUP_STRICT)
    return "\n".join(parts)


_GROUP_LINE = re.compile(r"^\W*(?:situation|question|q)?\s*(\d{1,2})\s*[:.)=-]?\**\s*[:.)=-]?\s*\**\s*<?\(?([A-Da-d])\)?>?\**(?![A-Za-z])(.*)$", re.I)


def parse_group(cards: list[tuple[dict, list[str]]], raw: str, guess: bool) -> list[tuple[str | None, dict | None]]:
    """Per card: (option key or None, guess or None). Lines may come in any order; extra text is ignored."""
    out: list[tuple[str | None, dict | None]] = [(None, None)] * len(cards)
    for line in (raw or "").splitlines():
        m = _GROUP_LINE.match(line.strip())
        if not m:
            continue
        n = int(m.group(1)) - 1
        if not 0 <= n < len(cards) or out[n][0] is not None:
            continue
        _, order = cards[n]
        i = LETTERS.index(m.group(2).upper())
        key = order[i] if i < len(order) else None
        g = parse_guess(order, m.group(3)) if guess and key else None
        out[n] = (key, g)
    return out


GROUP_GUESS_TURN = ("Now guess how other people answered each situation above. Out of 100 people, how many "
                    "picked each option? Reply with one line per situation and nothing else, exactly in this form:\n{lines}\n"
                    "The numbers on each line add up to 100.")


def render_group_guess(cards: list[tuple[dict, list[str]]], strict: bool = False) -> str:
    """Second turn of a grouped set: crowd guesses for every card, asked after the answers."""
    lines = "\n".join(f"{n}: " + ", ".join(f"{L}=<number>" for L in LETTERS[: len(o)])
                      for n, (_, o) in enumerate(cards, 1))
    return GROUP_GUESS_TURN.format(lines=lines) + ("\n" + GROUP_STRICT.replace("one letter", "the numbers") if strict else "")


_GUESS_LINE = re.compile(r"^\W*(?:situation|question|q)?\s*(\d{1,2})\s*[:.)-]+\**\s*(.*)$", re.I)


def parse_group_guess(cards: list[tuple[dict, list[str]]], raw: str) -> list[dict | None]:
    out: list[dict | None] = [None] * len(cards)
    for line in (raw or "").splitlines():
        m = _GUESS_LINE.match(line.strip())
        if m and 0 < int(m.group(1)) <= len(cards) and out[int(m.group(1)) - 1] is None:
            n = int(m.group(1)) - 1
            out[n] = parse_guess(cards[n][1], m.group(2))
    return out


def stable_seed(*parts: str) -> int:
    return int.from_bytes(hashlib.sha256("|".join(parts).encode()).digest()[:8], "big")


def playable(item: dict) -> bool:
    """Items the harness can score: keyed choice, binary and slider items (not free text)."""
    return item["answer"]["type"] in ("choice", "binary", "slider", "likert")


def option_order(item: dict, persona_id: str) -> list[str] | None:
    a = item["answer"]
    if a["type"] not in ("choice", "binary"):
        return None
    keys = [o["key"] for o in a["options"]]
    random.Random(stable_seed(persona_id, item["id"])).shuffle(keys)
    return keys


def render(item: dict, order: list[str] | None, strict: bool = False) -> str:
    """The user message for one item."""
    a = item["answer"]
    lines = [item["scenario"], ""]
    if a["type"] in ("choice", "binary"):
        by_key = {o["key"]: o for o in a["options"]}
        assert order is not None
        lines.append("What do you do?")
        for letter, key in zip(LETTERS, order):
            lines.append(f"{letter}. {by_key[key]['text']}")
        letters = ", ".join(LETTERS[: len(order)])
        lines += ["", CHOICE_STRICT.format(letters=letters) if strict else CHOICE_SUFFIX]
    elif a["type"] == "slider":
        lines.append(a["prompt"])
        lines.append(f"0 = {a['minLabel']}, 100 = {a['maxLabel']}.")
        lines += ["", SLIDER_STRICT if strict else SLIDER_SUFFIX]
    elif a["type"] == "likert":
        lines = [a["instructions"], "", f'"{item["scenario"]}"', ""]
        lines += [f"{a['min'] + i} = {label}" for i, label in enumerate(a["labels"])]
        suffix = LIKERT_STRICT if strict else LIKERT_SUFFIX
        lines += ["", suffix.format(lo=a["min"], hi=a["max"])]
    else:
        raise ValueError(f"{item['id']}: answer type {a['type']} is not played by agents")
    return "\n".join(lines)


_LETTER_RE = re.compile(r"^\W*(?:(?i:answer)\s*:?\s*\W*)?\(?([A-D])\)?(?:[.):*\s]|$)")
_NUMBER_RE = re.compile(r"^\D*?(\d{1,3})(?:\.\d+)?\b")


def parse(item: dict, order: list[str] | None, raw: str) -> str | int | None:
    """Map a raw reply to an option key (choice/binary) or 0-100 value (slider). None if invalid."""
    text = (raw or "").strip()
    a = item["answer"]
    if a["type"] in ("choice", "binary"):
        assert order is not None
        m = _LETTER_RE.match(text)
        if not m:
            return None
        i = LETTERS.index(m.group(1).upper())
        return order[i] if i < len(order) else None
    if a["type"] == "slider":
        m = _NUMBER_RE.match(text)
        if not m:
            return None
        v = int(m.group(1))
        return v if 0 <= v <= 100 else None
    if a["type"] == "likert":
        m = _NUMBER_RE.match(text)
        if not m:
            return None
        v = int(m.group(1))
        return v if a["min"] <= v <= a["max"] else None
    return None
