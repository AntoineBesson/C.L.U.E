"""Phase 1 item gate: which bank items to keep after the 100-agent pre-run.

    python -m clue_harness.gate --run ../runs/phase1-prerun --personas ../agents/personas-phase1.json \\
        --items ../items/seed.json --scales ../items/scales/mfq2.json ../items/scales/ous.json \\
        > ../runs/phase1-prerun/gate.md

An agent is one persona played by one model. Answers are pooled over all
agents. The spec's rules (Phase 1, "Agent statistics"):

- spread: answer entropy above 1.2 bits for a 4-option item (the same 60%
  of the maximum, 0.6 bits, for a binary item); a slider needs a standard
  deviation of at least 10 points;
- no dominant option: no option taken by over 70% of agents, pooled or on
  any one model;
- tracking: agents choose options keyed to their own traits more than
  chance. Mean alignment (see analyse.py) must be above 0, with a
  permutation p below 0.05 (labels shuffled across agents of the same model).

Labels are each agent's measured questionnaire scores, z-scored within its
model, for the traits the scales cover (MFQ-2, OUS); persona targets fill in
the rest (SD3, HEXACO) until those scales land.

Bank gate: at least 250 items keep spread above the entropy bar.
"""

from __future__ import annotations

import argparse
import json
import math
from collections import defaultdict
from pathlib import Path

import numpy as np

from .analyse import entropy_bits, fit

ENTROPY_SHARE = 0.6  # of the maximum: 1.2 of 2 bits for 4 options
TOP_SHARE = 0.7
SLIDER_SD = 10.0
ALPHA = 0.05
BANK_TARGET = 250


def agent_labels(personas: dict, measured: dict | None, models: list[str]) -> dict[tuple[str, str], dict[str, float]]:
    out = {}
    for m in models:
        for pid, p in personas.items():
            lab = dict(p["target_traits"])
            if measured:
                lab.update(measured.get((m, pid), {}))
            out[(m, pid)] = lab
    return out


def _alignment(item: dict, r: dict, label: dict[str, float]) -> float:
    a = item["answer"]
    if a["type"] == "slider":
        return (r["value"] - 50) / 50 * fit(a["keyed"], label)
    fits = {o["key"]: fit(o["keyed"], label) for o in a["options"]}
    return fits[r["chosen_key"]] - float(np.mean(list(fits.values())))


def item_stats(item: dict, rows: list[dict], labels: dict, n_perm: int = 2000, seed: int = 0) -> dict:
    a = item["answer"]
    rs = [r for r in rows if not r["invalid"]]
    models = sorted({r["model"] for r in rs})
    s: dict = {"id": item["id"], "type": a["type"], "n": len(rs), "invalid": len(rows) - len(rs)}
    if not rs:
        return {**s, "keep": False, "reasons": ["no valid answers"]}
    reasons = []
    if a["type"] == "slider":
        vals = np.array([r["value"] for r in rs], float)
        s["sd"] = float(vals.std())
        if s["sd"] < SLIDER_SD:
            reasons.append(f"slider sd {s['sd']:.0f} < {SLIDER_SD:.0f}")
    else:
        keys = [o["key"] for o in a["options"]]
        counts = [sum(r["chosen_key"] == k for r in rs) for k in keys]
        s["shares"] = {k: c / len(rs) for k, c in zip(keys, counts)}
        s["entropy"] = entropy_bits(counts)
        s["entropy_bar"] = ENTROPY_SHARE * math.log2(len(keys))
        s["top_share"] = max(counts) / len(rs)
        per_model = {}
        for m in models:
            mr = [r for r in rs if r["model"] == m]
            per_model[m] = max(sum(r["chosen_key"] == k for r in mr) for k in keys) / len(mr)
        s["top_share_by_model"] = per_model
        if s["entropy"] <= s["entropy_bar"]:
            reasons.append(f"entropy {s['entropy']:.2f} <= {s['entropy_bar']:.1f} bits")
        worst = max(per_model.items(), key=lambda kv: kv[1])
        if s["top_share"] > TOP_SHARE:
            reasons.append(f"top option {s['top_share']:.0%} pooled")
        elif worst[1] > TOP_SHARE:
            reasons.append(f"top option {worst[1]:.0%} on {worst[0]}")

    obs = float(np.mean([_alignment(item, r, labels[(r["model"], r["persona_id"])]) for r in rs]))
    # Permutation: shuffle which agent's label goes with which answer, within each model.
    rng = np.random.default_rng(seed)
    by_model = defaultdict(list)
    for r in rs:
        by_model[r["model"]].append(r)
    null = []
    for _ in range(n_perm):
        total = 0.0
        for m, mr in by_model.items():
            pids = [r["persona_id"] for r in mr]
            for r, pid in zip(mr, rng.permutation(pids)):
                total += _alignment(item, r, labels[(m, pid)])
        null.append(total / len(rs))
    s["alignment"] = obs
    s["p"] = (1 + int((np.asarray(null) >= obs).sum())) / (n_perm + 1)
    if obs <= 0 or s["p"] >= ALPHA:
        reasons.append(f"does not track its keys (alignment {obs:+.2f}, p {s['p']:.2f})")
    s["reasons"] = reasons
    s["keep"] = not reasons
    return s


def report(rows: list[dict], items: list[dict], personas: dict, measured: dict | None, n_perm: int = 2000) -> tuple[str, list[dict]]:
    rows = [r for r in rows if r["answer_type"] != "likert"]
    models = sorted({r["model"] for r in rows})
    labels = agent_labels(personas, measured, models)
    by_item = defaultdict(list)
    for r in rows:
        by_item[r["item_id"]].append(r)
    stats = [item_stats(i, by_item[i["id"]], labels, n_perm) for i in items if i["id"] in by_item]
    agents = {(r["model"], r["persona_id"]) for r in rows}
    spread_ok = [s for s in stats if s["type"] == "slider" and s.get("sd", 0) >= SLIDER_SD
                 or s["type"] != "slider" and s.get("entropy", 0) > s.get("entropy_bar", 9)]
    kept = [s for s in stats if s["keep"]]

    L: list[str] = []
    w = L.append
    w("# Phase 1 item gate\n")
    w(f"{len(agents)} agents ({len({p for _, p in agents})} personas x {len(models)} models: {', '.join(models)}), "
      f"{len(stats)} items. Labels: {'measured MFQ-2/OUS scores, targets for other traits' if measured else 'persona targets'}.\n")
    w(f"- Items kept: **{len(kept)} / {len(stats)}**")
    w(f"- Items above the entropy bar: {len(spread_ok)} (bank gate: at least {BANK_TARGET} of the 300-item bank)")
    w(f"- Invalid answers: {sum(s['invalid'] for s in stats)} of {len(rows)}\n")
    w("| Item | Type | Entropy (bits) | Top share | Worst model top share | Alignment | p | Keep | Why not |")
    w("| --- | --- | --- | --- | --- | --- | --- | --- | --- |")
    for s in stats:
        if s["type"] == "slider":
            spread, top, worst = f"sd {s.get('sd', 0):.0f}", "", ""
        else:
            spread = f"{s['entropy']:.2f}"
            top = f"{s['top_share']:.0%}"
            worst = f"{max(s['top_share_by_model'].values()):.0%}"
        al = f"{s['alignment']:+.2f}" if "alignment" in s else ""
        p = f"{s['p']:.3f}" if "p" in s else ""
        w(f"| {s['id']} | {s['type']} | {spread} | {top} | {worst} | {al} | {p} | {'yes' if s['keep'] else 'no'} | {'; '.join(s['reasons'])} |")
    w("")
    return "\n".join(L), stats


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--run", type=Path, nargs="+", required=True, help="runs holding the dilemma (and scale) answers")
    p.add_argument("--personas", type=Path, required=True)
    p.add_argument("--items", type=Path, required=True)
    p.add_argument("--scales", type=Path, nargs="*", default=[], help="questionnaire files, for measured labels")
    p.add_argument("--json", type=Path, help="also write the per-item stats here")
    p.add_argument("--n-perm", type=int, default=2000)
    args = p.parse_args(argv)
    rows = [json.loads(line) for run in args.run for line in (run / "answers.jsonl").read_text().splitlines() if line.strip()]
    measured = None
    if args.scales:
        from .scales import load_scale, score, standardise

        scale_items = [i for s in args.scales for i in load_scale(s)]
        srows = [r for r in rows if r["answer_type"] == "likert"]
        measured = standardise(score(srows, scale_items)) if srows else None
    personas = {p["persona_id"]: p for p in json.loads(args.personas.read_text())}
    text, stats = report(rows, json.loads(args.items.read_text()), personas, measured, args.n_perm)
    print(text)
    if args.json:
        args.json.write_text(json.dumps(stats, indent=2) + "\n")


if __name__ == "__main__":
    main()
