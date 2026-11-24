"""Have AI players answer the bank as personas.

    python -m clue_harness.run --personas ../agents/personas.json --items ../items/seed.json \\
        --backend claude-cli:claude-haiku-5-5 --out ../runs/phase0-smoke

One row per (persona, item, backend). Steps follow the spec's harness:
render (persona as system prompt, options shuffled per persona and item),
call, map the letter back to the option key, retry once with a stricter
suffix, then log the answer as invalid. Every call is cached by a hash of
(backend, system, user), so an interrupted run picks up where it stopped.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from . import prompts
from .backends import Backend, make_backend
from .personas import system_prompt


class BudgetExhausted(Exception):
    """The run hit its call budget or the provider's rate limit; rerun later to resume."""


class Budget:
    """Caps new (uncached) backend calls, e.g. to fit a free tier's daily quota,
    and spaces them to stay under a requests-per-minute limit."""

    def __init__(self, max_calls: int | None, rpm: float | None = None):
        self.left = max_calls
        self.lock = threading.Lock()
        self.stopped = False
        self.interval = 60.0 / rpm if rpm else 0.0
        self.next_at = 0.0

    def take(self) -> None:
        if self.interval:
            with self.lock:
                now = time.monotonic()
                wait = max(0.0, self.next_at - now)
                self.next_at = max(now, self.next_at) + self.interval
            time.sleep(wait)
        with self.lock:
            if self.stopped:
                raise BudgetExhausted("stopped")
            if self.left is not None:
                if self.left <= 0:
                    raise BudgetExhausted("call budget used up")
                self.left -= 1

    def stop(self) -> None:
        with self.lock:
            self.stopped = True


class Cache:
    """Append-only JSONL cache keyed by prompt hash; safe to resume."""

    def __init__(self, path: Path):
        self.path = path
        self.lock = threading.Lock()
        self.data: dict[str, dict] = {}
        if path.exists():
            for line in path.read_text().splitlines():
                if line.strip():
                    row = json.loads(line)
                    self.data[row["key"]] = row
        path.parent.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def key(backend: str, system: str, user: str) -> str:
        return hashlib.sha256(f"{backend}\x00{system}\x00{user}".encode()).hexdigest()

    def get(self, key: str) -> dict | None:
        return self.data.get(key)

    def put(self, key: str, value: dict) -> None:
        row = {"key": key, **value}
        with self.lock:
            self.data[key] = row
            with self.path.open("a") as f:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")


def _is_rate_limit(e: Exception) -> bool:
    return getattr(e, "code", None) in (402, 429) or "rate limit" in str(e).lower()


def _call(backend: Backend, cache: Cache, system: str, user: str, context: dict,
          budget: Budget | None = None, retries: int = 3) -> dict:
    key = Cache.key(backend.name, system, user)
    hit = cache.get(key)
    if hit:
        return hit
    for attempt in range(retries):
        if budget:
            budget.take()
        try:
            r = backend.answer(system, user, context)
            break
        except Exception as e:  # network, rate limits, CLI hiccups
            if _is_rate_limit(e) and budget:
                # Per-minute and upstream limits clear quickly; a daily cap does not.
                if attempt < retries - 1:
                    print(f"rate limited, waiting: {str(e)[:200]}", file=sys.stderr)
                    time.sleep(30 * (attempt + 1))
                    continue
                budget.stop()
                raise BudgetExhausted(f"provider limit: {e}") from e
            if attempt == retries - 1:
                raise
            time.sleep(2 ** attempt * 2)
            print(f"retry after error: {e}", file=sys.stderr)
    value = {"text": r.text, "probs": r.probs, "usage": r.usage, "sampling": r.sampling}
    cache.put(key, value)
    return value


def answer_one(backend: Backend, cache: Cache, persona: dict, item: dict, budget: Budget | None = None) -> dict:
    order = prompts.option_order(item, persona["persona_id"])
    system = system_prompt(persona)
    context = {"persona": persona, "item": item, "order": order}
    attempts = 0
    value = None
    raw = ""
    reply: dict = {}
    for strict in (False, True):
        attempts += 1
        user = prompts.render(item, order, strict=strict)
        reply = _call(backend, cache, system, user, context, budget)
        raw = reply["text"]
        value = prompts.parse(item, order, raw)
        if value is not None:
            break
    probs = None
    if reply.get("probs") and order:
        shown = {order[prompts.LETTERS.index(L)]: p for L, p in reply["probs"].items() if prompts.LETTERS.index(L) < len(order)}
        total = sum(shown.values())
        probs = {k: v / total for k, v in shown.items()} if total > 0 else None
    return {
        "agent_id": f"{persona['persona_id']}@{backend.name}",
        "persona_id": persona["persona_id"],
        "archetype": persona["archetype"],
        "model": backend.name,
        "item_id": item["id"],
        "answer_type": item["answer"]["type"],
        "order": order,
        "chosen_key": value if isinstance(value, str) else None,
        "chosen_position": order.index(value) if isinstance(value, str) and order else None,
        "value": value if isinstance(value, int) and not isinstance(value, bool) else None,
        "probs": probs,
        "sampling": reply.get("sampling", "sample"),
        "invalid": value is None,
        "attempts": attempts,
        "raw_text": raw,
        "input_tokens": reply.get("usage", {}).get("input_tokens"),
        "output_tokens": reply.get("usage", {}).get("output_tokens"),
    }


def run(personas: list[dict], items: list[dict], backend_specs: list[str], out: Path, workers: int = 8,
        max_calls: int | None = None, rpm: float | None = None) -> list[dict]:
    """Answer every (persona, item) on every backend. With max_calls, stop after that many
    new calls per backend; cached answers are free, so rerunning resumes the run."""
    out.mkdir(parents=True, exist_ok=True)
    cache = Cache(out / "cache.jsonl")
    items = [i for i in items if prompts.playable(i)]
    rows: list[dict] = []
    for spec in backend_specs:
        backend = make_backend(spec)
        budget = Budget(max_calls, rpm)
        jobs = [(p, i) for p in personas for i in items]
        done = skipped = 0
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures = [pool.submit(answer_one, backend, cache, p, i, budget) for p, i in jobs]
            for f in as_completed(futures):
                try:
                    rows.append(f.result())
                except BudgetExhausted:
                    skipped += 1
                    continue
                done += 1
                if done % 50 == 0 or done == len(jobs):
                    print(f"{backend.name}: {done}/{len(jobs)}", file=sys.stderr)
        if skipped:
            print(f"{backend.name}: stopped with {skipped} answers left; rerun to resume", file=sys.stderr)
    rows.sort(key=lambda r: (r["model"], r["persona_id"], r["item_id"]))
    with (out / "answers.jsonl").open("w") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    try:
        import pandas as pd

        df = pd.DataFrame(rows)
        df["order"] = df["order"].map(lambda o: ",".join(o) if o else None)
        df["probs"] = df["probs"].map(lambda p: json.dumps(p) if p else None)
        df.to_parquet(out / "answers.parquet", index=False)
    except ImportError:
        pass
    return rows


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--personas", type=Path, required=True)
    p.add_argument("--items", type=Path, nargs="*", default=[], help="question bank files (items/seed.json, items/drafts/*.json)")
    p.add_argument("--scales", type=Path, nargs="*", default=[], help="questionnaire files (items/scales/*.json)")
    p.add_argument("--backend", action="append", required=True, help="repeat for several models")
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--workers", type=int, default=8)
    p.add_argument("--limit-personas", type=int)
    p.add_argument("--persona-ids", nargs="*", help="only these personas")
    p.add_argument("--item-ids", nargs="*", help="only these items")
    p.add_argument("--max-calls", type=int, help="stop after this many new calls per backend (free tiers)")
    p.add_argument("--rpm", type=float, help="space calls to stay under this many requests per minute")
    args = p.parse_args(argv)
    personas = json.loads(args.personas.read_text())[: args.limit_personas]
    from .scales import load_scale

    items = [i for path in args.items for i in json.loads(path.read_text())]
    items += [i for path in args.scales for i in load_scale(path)]
    if args.persona_ids:
        personas = [p for p in personas if p["persona_id"] in args.persona_ids]
    if args.item_ids:
        # Questionnaire items are kept: they label the agents.
        items = [i for i in items if i["id"] in args.item_ids or i["answer"]["type"] == "likert"]
    run(personas, items, args.backend, args.out, args.workers, args.max_calls, args.rpm)


if __name__ == "__main__":
    main()
