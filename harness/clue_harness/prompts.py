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
