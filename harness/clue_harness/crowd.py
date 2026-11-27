"""Simulated crowd for the game: how the AI players answered each item.

    python -m clue_harness.crowd \\
        --run ../runs/phase1-prerun@bb974b5 --run ../runs/phase1-batch01@972140b \\
        --run ../runs/phase1-batch02@e9ae8c5 --guesses ../runs/sets-pilot@2fa28a9 \\
        --guesses '../runs/grouped-check/grouped-separate@e9ae8c5#../runs/grouped-check/seed-phase0.json' \\
        --items ../items/seed.json ../items/drafts/batch-01.json ../items/drafts/batch-02.json \\
        > ../items/crowd/simulated.json

Until real players exist, the game uses these splits as the "crowd" in
guess-the-crowd, labelled as simulated.

Each ``--run`` is a run directory (answers in ``*/answers.jsonl`` or
``answers.jsonl``) with the git commit at which it ran. The item text at that
commit is fingerprinted, so the game can drop a split whose item was reworded
after the run (the fingerprint no longer matches the bank). Later runs
replace earlier ones for the same item. The run's ``gate.json``, when present,
says whether the item passed the Phase 1 gate; the game only plays draft items
that passed.

A run that played its own copy of the bank takes ``dir@commit#items.json``.

``--guesses`` runs (same form) are runs where agents also
guessed how others split (``clue_harness.sets``). They add ``predictedShare``,
the geometric mean of the agents' guesses per option (as the server computes
it for players), to items whose text still matches. That turns the game's
truth bonus back on. They do not replace the answer shares, which come from
the larger isolated runs.
"""

from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

EPS = 0.01  # as the game and server: a guess of 0 counts as 1%
FNV_OFFSET = 0x811C9DC5
FNV_PRIME = 0x01000193


def fingerprint(item: dict) -> str:
    """FNV-1a (32 bit) over the text a player sees. Mirrors game/src/crowd.ts."""
    a = item["answer"]
    parts = [item["scenario"]]
    if a["type"] in ("choice", "binary"):
        parts += [f"{o['key']}:{o['text']}" for o in sorted(a["options"], key=lambda o: o["key"])]
    elif a["type"] == "slider":
        parts += [a["prompt"], a["minLabel"], a["maxLabel"]]
    else:
        parts += [a["prompt"]]
    h = FNV_OFFSET
    for b in "\n".join(parts).encode("utf-8"):
        h ^= b
        h = (h * FNV_PRIME) & 0xFFFFFFFF
    return f"{h:08x}"


def _git_root(path: Path) -> Path:
    out = subprocess.run(["git", "rev-parse", "--show-toplevel"], cwd=path, capture_output=True, text=True, check=True)
    return Path(out.stdout.strip())


def items_at(ref: str | None, files: list[Path]) -> dict[str, dict]:
    """Items from ``files``, read at commit ``ref`` (or from disk when None)."""
    out: dict[str, dict] = {}
    for f in files:
        if ref is None:
            text = f.read_text()
        else:
            root = _git_root(f.resolve().parent)
            rel = f.resolve().relative_to(root).as_posix()
            res = subprocess.run(["git", "show", f"{ref}:{rel}"], cwd=root, capture_output=True, text=True)
            if res.returncode != 0:
                continue  # file did not exist yet at that commit
            text = res.stdout
        for it in json.loads(text):
            out[it["id"]] = it
    return out


def load_answers(run: Path) -> list[dict]:
    files = sorted(run.glob("answers.jsonl")) + sorted(run.glob("*/answers.jsonl"))
    rows = []
    for f in files:
        rows += [json.loads(line) for line in f.read_text().splitlines() if line.strip()]
    return rows


def split(item: dict, rows: list[dict]) -> dict | None:
    rows = [r for r in rows if not r.get("invalid")]
    if not rows:
        return None
    a = item["answer"]
    models = sorted({r["model"] for r in rows})
    if a["type"] in ("choice", "binary"):
        keys = [o["key"] for o in a["options"]]
        c = Counter(r["chosen_key"] for r in rows if r.get("chosen_key") in keys)
        n = sum(c.values())
        if n == 0:
            return None
        return {
            "kind": "shares",
            "source": "agents",
            "n": n,
            "answerShare": {k: round(c[k] / n, 4) for k in keys},
            "models": models,
        }
    if a["type"] == "slider":
        vals = [float(r["value"]) for r in rows if isinstance(r.get("value"), (int, float))]
        if not vals:
            return None
        return {"kind": "mean", "source": "agents", "n": len(vals), "mean": round(sum(vals) / len(vals), 1), "models": models}
    return None


def predicted(item: dict, rows: list[dict]) -> tuple[dict[str, float], int] | None:
    """Geometric mean of the agents' guessed shares per option, and how many guesses."""
    a = item["answer"]
    if a["type"] not in ("choice", "binary"):
        return None
    keys = [o["key"] for o in a["options"]]
    guesses = [r["guess"] for r in rows if isinstance(r.get("guess"), dict) and not r.get("guess_invalid")]
    if not guesses:
        return None
    out = {}
    for k in keys:
        logs = [math.log(max(float(g.get(k, 0)), EPS)) for g in guesses]
        out[k] = round(math.exp(sum(logs) / len(logs)), 4)
    return out, len(guesses)


RunSpec = tuple  # (dir, commit or None[, items file used by that run])


def _run_items(spec: tuple, item_files: list[Path]) -> dict[str, dict]:
    run, ref, *rest = spec
    return items_at(ref, [rest[0]] if rest and rest[0] else item_files)


def build(runs: list[RunSpec], item_files: list[Path], guess_runs: list[RunSpec] = ()) -> dict:
    out: dict[str, dict] = {}
    used = []
    for spec in runs:
        run, ref = spec[0], spec[1]
        items = _run_items(spec, item_files)
        by_item: dict[str, list[dict]] = defaultdict(list)
        for r in load_answers(run):
            by_item[r["item_id"]].append(r)
        gate_path = run / "gate.json"
        gate = {g["id"]: g for g in json.loads(gate_path.read_text())} if gate_path.exists() else {}
        n_items = 0
        for iid, rows in by_item.items():
            item = items.get(iid)
            if item is None:
                continue  # questionnaire items, or unknown
            crowd = split(item, rows)
            if crowd is None:
                continue
            entry = {"fingerprint": fingerprint(item), "run": run.name, "crowd": crowd}
            if iid in gate:
                entry["gate"] = bool(gate[iid]["keep"])
            out[iid] = entry
            n_items += 1
        used.append({"run": run.name, "commit": ref, "items": n_items,
                     "agents": len({r["agent_id"] for r in load_answers(run)})})

    # Guesses from every guess run whose wording matches are pooled per item.
    pooled: dict[str, list[dict]] = defaultdict(list)
    sources: dict[str, list[str]] = defaultdict(list)
    for spec in guess_runs:
        run, ref = spec[0], spec[1]
        items = _run_items(spec, item_files)
        by_item = defaultdict(list)
        for r in load_answers(run):
            by_item[r["item_id"]].append(r)
        n_items = 0
        for iid, rows in by_item.items():
            item, entry = items.get(iid), out.get(iid)
            if item is None or entry is None or entry["fingerprint"] != fingerprint(item):
                continue  # no answer split, or the guesses were about another wording
            if entry["crowd"]["kind"] != "shares" or predicted(item, rows) is None:
                continue
            pooled[iid] += rows
            sources[iid].append(run.name)
            n_items += 1
        used.append({"run": run.name, "commit": ref, "items": n_items, "guesses": True,
                     "agents": len({r["agent_id"] for r in load_answers(run)})})
    for iid, rows in pooled.items():
        entry = out[iid]
        item_like = {"answer": {"type": "choice", "options": [{"key": k} for k in entry["crowd"]["answerShare"]]}}
        entry["crowd"]["predictedShare"], entry["guesses"] = predicted(item_like, rows)
        entry["guessRun"] = "+".join(sources[iid])
    return {
        "generated": date.today().isoformat(),
        "note": "Simulated crowd: AI players (personas x models), not real people.",
        "runs": used,
        "items": dict(sorted(out.items())),
    }


def main(argv: list[str] | None = None) -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--run", action="append", required=True,
                    help="run dir, optionally @<git commit> it ran at and #<items file> it played (default: --items)")
    ap.add_argument("--guesses", action="append", default=[], help="run dir with crowd guesses, same form as --run")
    ap.add_argument("--items", nargs="+", type=Path, required=True)
    args = ap.parse_args(argv)

    def parse(spec: str) -> tuple[Path, str | None, Path | None]:
        spec, _, items_file = spec.partition("#")
        path, _, ref = spec.partition("@")
        return Path(path), ref or None, Path(items_file) if items_file else None

    out = build([parse(s) for s in args.run], args.items, [parse(s) for s in args.guesses])
    json.dump(out, sys.stdout, indent=1, ensure_ascii=False)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
