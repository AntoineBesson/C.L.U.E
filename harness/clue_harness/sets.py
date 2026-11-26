"""Daily-set mode: each agent plays cards in sets, in one conversation, like a player's day.

    python -m clue_harness.sets --personas ../agents/personas-phase1.json --items ../items/seed.json \\
        --backend openrouter:qwen/qwen3.8-27b --set-size 4 --guess --out ../runs/sets-pilot/qwen

The default runs (run.py) show every card on its own, with no memory of the
others: the bank gate and the adaptive-policy replays need answers that do not
depend on which cards came before. Real players remember earlier cards, so
this mode measures how much that context moves answers.

For each persona, the playable choice and binary cards are shuffled (seeded
by persona) and cut into sets of ``--set-size``. Within a set, each card is a
new user turn after the agent's earlier answers. With ``--guess``, after each
answer the agent is also asked how 100 people split across the options (the
game's crowd prediction, scored with the truth bonus). The conversation then
carries on to the next card.

With ``--grouped``, the whole set goes in one request and the agent replies
with one line per card ("1: B | A=40, B=30, C=20, D=10"): one request per set
instead of one per card and one per guess, for models limited by requests per
day or minute (free tiers, new-account Mistral). Cards still share a context,
as in a player's day.

One row per (persona, card, backend), as in run.py, plus set_id, position,
guess (option key -> share) and guess_invalid. Cached and resumable like run.py.
"""

from __future__ import annotations

import argparse
import json
import random
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from . import prompts
from .backends import Backend, make_backend
from .personas import system_prompt
from .run import Budget, BudgetExhausted, Cache, _is_rate_limit

GUESS_TOKENS = 24


def make_sets(persona_id: str, items: list[dict], size: int) -> list[list[dict]]:
    cards = [i for i in items if i["answer"]["type"] in ("choice", "binary")]
    random.Random(prompts.stable_seed(persona_id, "sets")).shuffle(cards)
    return [cards[k:k + size] for k in range(0, len(cards), size)]


def _chat(backend: Backend, cache: Cache, system: str, messages: list[dict], context: dict,
          budget: Budget | None) -> dict:
    # A one-message conversation shares run.py's cache key, so isolated answers are reused.
    user = messages[0]["content"] if len(messages) == 1 else json.dumps(messages, ensure_ascii=False)
    key = Cache.key(backend.name, system, user)
    hit = cache.get(key)
    if hit:
        return hit
    for attempt in range(3):
        if budget:
            budget.take()
        try:
            r = backend.chat(system, messages, context)
            break
        except NotImplementedError:
            raise
        except Exception as e:  # network, rate limits
            if _is_rate_limit(e) and budget and attempt == 2:
                budget.stop()
                raise BudgetExhausted(f"provider limit: {e}") from e
            if attempt == 2:
                raise
            print(f"retry after error: {str(e)[:200]}", file=sys.stderr)
            time.sleep(30 * (attempt + 1) if _is_rate_limit(e) else 2 ** attempt * 2)
    value = {"text": r.text, "probs": r.probs, "usage": r.usage, "sampling": r.sampling}
    cache.put(key, value)
    return value


def play_set(backend: Backend, cache: Cache, persona: dict, set_id: int, cards: list[dict],
             guess: bool, budget: Budget | None = None) -> list[dict]:
    system = system_prompt(persona)
    history: list[dict] = []
    rows = []
    for pos, item in enumerate(cards):
        order = prompts.option_order(item, persona["persona_id"])
        context = {"persona": persona, "item": item, "order": order}
        value, raw, attempts, reply = None, "", 0, {}
        for strict in (False, True):
            attempts += 1
            turn = {"role": "user", "content": prompts.render(item, order, strict=strict)}
            reply = _chat(backend, cache, system, history + [turn], context, budget)
            raw = reply["text"]
            value = prompts.parse(item, order, raw)
            if value is not None:
                break
        # Keep the turn the agent actually answered, so later cards see it.
        history += [turn, {"role": "assistant", "content": raw or "(no answer)"}]
        g, g_raw = None, None
        if guess:
            gctx = {**context, "guess": True, "own_key": value, "max_tokens": GUESS_TOKENS}
            for strict in (False, True):
                gturn = {"role": "user", "content": prompts.guess_prompt(order, strict=strict)}
                g_reply = _chat(backend, cache, system, history + [gturn], gctx, budget)
                g_raw = g_reply["text"]
                g = prompts.parse_guess(order, g_raw)
                if g is not None:
                    break
            history += [gturn, {"role": "assistant", "content": g_raw or "(no answer)"}]
        rows.append({
            "agent_id": f"{persona['persona_id']}@{backend.name}",
            "persona_id": persona["persona_id"],
            "archetype": persona["archetype"],
            "model": backend.name,
            "mode": f"set{len(cards)}" if len(cards) > 1 else "isolated",
            "set_id": set_id,
            "position": pos,
            "item_id": item["id"],
            "answer_type": item["answer"]["type"],
            "order": order,
            "chosen_key": value,
            "chosen_position": order.index(value) if value else None,
            "value": None,
            "invalid": value is None,
            "attempts": attempts,
            "raw_text": raw,
            "guess": g,
            "guess_invalid": guess and g is None,
            "guess_raw": g_raw,
        })
    return rows


def play_group(backend: Backend, cache: Cache, persona: dict, set_id: int, cards: list[dict],
               guess: bool, budget: Budget | None = None, guess_turn: str = "separate") -> list[dict]:
    """The whole set in one request: one reply line per card. Guesses come either on the
    same line as each answer ("same", 1 request per set) or in a second turn after all the
    answers ("separate", 2 requests per set), which keeps the answer from anchoring the guess."""
    system = system_prompt(persona)
    shown = [(item, prompts.option_order(item, persona["persona_id"])) for item in cards]
    want_guess = guess
    guess = guess and guess_turn == "same"
    context = {"persona": persona, "cards": shown, "group_guess": guess,
               "max_tokens": (40 if guess else 8) * len(cards)}
    parsed: list[tuple] = [(None, None)] * len(cards)
    raws, attempts = [], 0
    for strict in (False, True):
        attempts += 1
        user = prompts.render_group(shown, guess, strict=strict)
        raw = _chat(backend, cache, system, [{"role": "user", "content": user}], context, budget)["text"]
        raws.append(raw)
        new = prompts.parse_group(shown, raw, guess)
        # Keep what the first reply got right; fill gaps from the stricter retry.
        parsed = [p if p[0] and (p[1] or not guess) else (n if n[0] else p) for p, n in zip(parsed, new)]
        if all(k and (g or not guess) for k, g in parsed):
            break
    if guess_turn == "separate" and want_guess:
        history = [{"role": "user", "content": prompts.render_group(shown, False)},
                   {"role": "assistant", "content": raws[0]}]
        gctx = {**context, "group_guess": False, "group_guess_turn": True,
                "own_keys": [k for k, _ in parsed], "max_tokens": 32 * len(cards)}
        guesses: list = [None] * len(cards)
        for strict in (False, True):
            turn = {"role": "user", "content": prompts.render_group_guess(shown, strict=strict)}
            graw = _chat(backend, cache, system, history + [turn], gctx, budget)["text"]
            new = prompts.parse_group_guess(shown, graw)
            guesses = [g or n for g, n in zip(guesses, new)]
            if all(guesses):
                break
        parsed = [(k, g) for (k, _), g in zip(parsed, guesses)]
        guess = True
    rows = []
    for pos, ((item, order), (key, g)) in enumerate(zip(shown, parsed)):
        rows.append({
            "agent_id": f"{persona['persona_id']}@{backend.name}",
            "persona_id": persona["persona_id"],
            "archetype": persona["archetype"],
            "model": backend.name,
            "mode": f"grouped{len(cards)}" + ("-guess-separate" if want_guess and guess_turn == "separate" else ""),
            "set_id": set_id,
            "position": pos,
            "item_id": item["id"],
            "answer_type": item["answer"]["type"],
            "order": order,
            "chosen_key": key,
            "chosen_position": order.index(key) if key else None,
            "value": None,
            "invalid": key is None,
            "attempts": attempts,
            "raw_text": raws[-1],
            "guess": g,
            "guess_invalid": guess and g is None,
            "guess_raw": None,
        })
    return rows


def run_sets(personas: list[dict], items: list[dict], backend_specs: list[str], out: Path, set_size: int = 4,
             guess: bool = True, workers: int = 8, max_calls: int | None = None, rpm: float | None = None,
             grouped: bool = False, guess_turn: str = "separate") -> list[dict]:
    out.mkdir(parents=True, exist_ok=True)
    cache = Cache(out / "cache.jsonl")
    rows: list[dict] = []
    for spec in backend_specs:
        backend = make_backend(spec)
        budget = Budget(max_calls, rpm)
        jobs = [(p, n, cards) for p in personas for n, cards in enumerate(make_sets(p["persona_id"], items, set_size))]
        skipped = 0
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures = [pool.submit(play_group, backend, cache, p, n, cards, guess, budget, guess_turn) if grouped
                       else pool.submit(play_set, backend, cache, p, n, cards, guess, budget) for p, n, cards in jobs]
            for done, f in enumerate(as_completed(futures), 1):
                try:
                    rows += f.result()
                except BudgetExhausted:
                    skipped += 1
                if done % 25 == 0 or done == len(jobs):
                    print(f"{backend.name}: {done}/{len(jobs)} sets", file=sys.stderr)
        if skipped:
            print(f"{backend.name}: stopped with {skipped} sets left; rerun to resume", file=sys.stderr)
    rows.sort(key=lambda r: (r["model"], r["persona_id"], r["set_id"], r["position"]))
    with (out / "answers.jsonl").open("w") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    return rows


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--personas", type=Path, required=True)
    p.add_argument("--items", type=Path, nargs="+", required=True)
    p.add_argument("--item-ids", nargs="*")
    p.add_argument("--backend", action="append", required=True)
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--set-size", type=int, default=4, help="cards per conversation; 1 = isolated, as in run.py")
    p.add_argument("--grouped", action="store_true",
                   help="send each set as one request with one reply line per card (fewer requests for rate-limited models)")
    p.add_argument("--guess-turn", choices=["separate", "same"], default="separate",
                   help="with --grouped: guesses in a second turn after all answers (default), or on each answer's line")
    p.add_argument("--no-guess", action="store_true", help="skip the crowd-split guess after each card")
    p.add_argument("--workers", type=int, default=8)
    p.add_argument("--limit-personas", type=int)
    p.add_argument("--max-calls", type=int)
    p.add_argument("--rpm", type=float)
    args = p.parse_args(argv)
    personas = json.loads(args.personas.read_text())[: args.limit_personas]
    items = [i for path in args.items for i in json.loads(path.read_text())]
    if args.item_ids:
        items = [i for i in items if i["id"] in args.item_ids]
    run_sets(personas, items, args.backend, args.out, args.set_size, not args.no_guess, args.workers, args.max_calls, args.rpm,
             args.grouped, args.guess_turn)


if __name__ == "__main__":
    main()
