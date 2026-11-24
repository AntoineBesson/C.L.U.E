"""Compare daily-set answers with isolated answers, and score the crowd guesses.

    python -m clue_harness.sets_report --sets ../runs/sets-pilot/qwen --isolated ../runs/phase1-prerun/qwen \\
        --personas ../agents/personas-phase1.json --items ../items/seed.json > ../runs/sets-pilot/report.md

- Context effect: how often an agent gives the same answer to a card in a set
  as when it saw the card alone. The first card of each set has no context, so
  its agreement is the resampling baseline (the model answers at temperature 1);
  later positions show what earlier cards add on top of that.
- Tracking in both modes (mean alignment, see analyse.py).
- Per card: how far the answer split moves (total variation distance).
- Crowd guesses: mean absolute error of the agents' average guess against the
  actual split among the same agents, and the false-consensus gap (how much
  more agents guess for their own choice than other agents do).
- Writes crowd.json: per card, answerShare and predictedShare from the agents,
  in the shape of the bank's ``crowd`` field.
"""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path

import numpy as np

from .analyse import alignment_rows


def _load(paths: list[Path]) -> list[dict]:
    return [json.loads(line) for p in paths for line in (p / "answers.jsonl").read_text().splitlines() if line.strip()]


def report(sets_rows: list[dict], iso_rows: list[dict], items: dict, personas: dict) -> tuple[str, dict]:
    iso = {(r["model"], r["persona_id"], r["item_id"]): r for r in iso_rows if not r["invalid"] and r.get("chosen_key")}
    sets_rows = [r for r in sets_rows if r["item_id"] in items]
    models = sorted({r["model"] for r in sets_rows})
    L: list[str] = []
    w = L.append
    w("# Daily sets vs isolated cards\n")
    for m in models:
        rs = [r for r in sets_rows if r["model"] == m]
        valid = [r for r in rs if not r["invalid"]]
        size = max(r["position"] for r in rs) + 1
        w(f"## {m}\n")
        w(f"{len({r['persona_id'] for r in rs})} personas, {len(rs)} answers in sets of {size}; "
          f"{len(rs) - len(valid)} invalid answers, {sum(r['guess_invalid'] for r in rs)} invalid guesses.\n")
        # Agreement by position
        w("| Position in set | Same answer as when shown alone | n |")
        w("| --- | --- | --- |")
        for pos in range(size):
            pairs = [(r, iso.get((m, r["persona_id"], r["item_id"]))) for r in valid if r["position"] == pos]
            pairs = [(a, b) for a, b in pairs if b]
            if pairs:
                agree = np.mean([a["chosen_key"] == b["chosen_key"] for a, b in pairs])
                w(f"| {pos + 1}{' (no context: resampling baseline)' if pos == 0 else ''} | {agree:.0%} | {len(pairs)} |")
        w("")
        pairs_iso = [iso[(m, r["persona_id"], r["item_id"])] for r in valid if (m, r["persona_id"], r["item_id"]) in iso]
        a_set = [a for *_, a in alignment_rows(valid, items, personas)]
        a_iso = [a for *_, a in alignment_rows(pairs_iso, items, personas)]
        w(f"Mean alignment: {np.mean(a_set):+.2f} in sets, {np.mean(a_iso):+.2f} alone (same agents and cards).\n")
        # Per item split shift
        shifts = []
        for iid in sorted({r["item_id"] for r in valid}):
            keys = [o["key"] for o in items[iid]["answer"]["options"]]
            s = [r["chosen_key"] for r in valid if r["item_id"] == iid]
            i_ = [iso[(m, r["persona_id"], iid)]["chosen_key"] for r in valid if r["item_id"] == iid and (m, r["persona_id"], iid) in iso]
            if s and i_:
                ps = np.array([s.count(k) / len(s) for k in keys]); pi = np.array([i_.count(k) / len(i_) for k in keys])
                shifts.append((0.5 * np.abs(ps - pi).sum(), iid))
        if shifts:
            shifts.sort(reverse=True)
            w(f"Answer split shift per card (total variation): median {np.median([x for x, _ in shifts]):.2f}; "
              f"largest {', '.join(f'{iid} {x:.2f}' for x, iid in shifts[:5])}.\n")
        # Guesses
        g = [r for r in valid if r.get("guess")]
        if g:
            maes, gaps = [], []
            for iid in sorted({r["item_id"] for r in g}):
                rs_i = [r for r in g if r["item_id"] == iid]
                keys = [o["key"] for o in items[iid]["answer"]["options"]]
                actual = {k: np.mean([r["chosen_key"] == k for r in rs_i]) for k in keys}
                pred = {k: np.mean([r["guess"][k] for r in rs_i]) for k in keys}
                maes.append(np.mean([abs(pred[k] - actual[k]) for k in keys]))
                for k in keys:
                    own = [r["guess"][k] for r in rs_i if r["chosen_key"] == k]
                    other = [r["guess"][k] for r in rs_i if r["chosen_key"] != k]
                    if own and other:
                        gaps.append(np.mean(own) - np.mean(other))
            w(f"Crowd guesses: mean absolute error of the average guess {np.mean(maes) * 100:.1f} points per option; "
              f"false-consensus gap {np.mean(gaps) * 100:+.1f} points (agents guess more for the option they chose).\n")
    crowd = {}
    for iid in sorted({r["item_id"] for r in sets_rows}):
        rs_i = [r for r in sets_rows if r["item_id"] == iid and not r["invalid"]]
        keys = [o["key"] for o in items[iid]["answer"]["options"]]
        gs = [r for r in rs_i if r.get("guess")]
        crowd[iid] = {
            "kind": "shares", "source": "agents", "n": len(rs_i),
            "answerShare": {k: round(float(np.mean([r["chosen_key"] == k for r in rs_i])), 3) for k in keys} if rs_i else {},
            "predictedShare": {k: round(float(np.mean([r["guess"][k] for r in gs])), 3) for k in keys} if gs else {},
        }
    return "\n".join(L), crowd


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--sets", type=Path, nargs="+", required=True)
    p.add_argument("--isolated", type=Path, nargs="+", required=True)
    p.add_argument("--personas", type=Path, required=True)
    p.add_argument("--items", type=Path, nargs="+", required=True)
    p.add_argument("--crowd-out", type=Path, help="write per-card answerShare/predictedShare here")
    args = p.parse_args(argv)
    items = {i["id"]: i for path in args.items for i in json.loads(path.read_text())}
    personas = {x["persona_id"]: x for x in json.loads(args.personas.read_text())}
    text, crowd = report(_load(args.sets), _load(args.isolated), items, personas)
    print(text)
    if args.crowd_out:
        args.crowd_out.write_text(json.dumps(crowd, indent=2) + "\n")


if __name__ == "__main__":
    main()
