"""Questionnaire items as harness items, and scoring.

Each scale item in items/scales/*.json becomes a harness item of answer type
``likert``: the scale's instructions, the statement, and the labelled response
options in their published order (never shuffled). Scores follow each scale's
own rule: the mean of a trait's items, reversing reversed items.

    python -m clue_harness.scales --run ../runs/phase0-scales --personas ../agents/personas.json \\
        --scales ../items/scales/mfq2.json ../items/scales/ous.json > ../runs/phase0-scales/fidelity.md
"""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path

import numpy as np


def load_scale(path: Path, lang: str = "en") -> list[dict]:
    scale = json.loads(Path(path).read_text())
    r = scale["response"]
    out = []
    for it in scale["items"]:
        out.append({
            "id": it["id"],
            "scale": scale["id"],
            "trait": it["trait"],
            "reversed": it["reversed"],
            "scenario": it["text"][lang],
            "answer": {
                "type": "likert",
                "instructions": scale["instructions"][lang],
                "min": r["min"],
                "max": r["max"],
                "labels": r["labels"][lang],
            },
        })
    return out


def score(rows: list[dict], items: list[dict]) -> dict[tuple[str, str], dict[str, float]]:
    """(model, persona_id) -> trait -> raw mean score. Invalid answers are skipped."""
    by_id = {i["id"]: i for i in items}
    acc: dict[tuple[str, str], dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))
    for r in rows:
        item = by_id.get(r["item_id"])
        if item is None or r["invalid"]:
            continue
        a = item["answer"]
        v = r["value"]
        if item["reversed"]:
            v = a["min"] + a["max"] - v
        acc[(r["model"], r["persona_id"])][item["trait"]].append(v)
    return {k: {t: float(np.mean(vs)) for t, vs in ts.items()} for k, ts in acc.items()}


def standardise(scores: dict[tuple[str, str], dict[str, float]]) -> dict[tuple[str, str], dict[str, float]]:
    """z-scores within each model, across its personas (no human norms yet)."""
    out: dict[tuple[str, str], dict[str, float]] = defaultdict(dict)
    models = {m for m, _ in scores}
    for m in models:
        keys = [k for k in scores if k[0] == m]
        traits = {t for k in keys for t in scores[k]}
        for t in traits:
            vals = np.array([scores[k][t] for k in keys if t in scores[k]])
            mu, sd = vals.mean(), vals.std()
            for k in keys:
                if t in scores[k]:
                    out[k][t] = float((scores[k][t] - mu) / sd) if sd > 0 else 0.0
    return dict(out)


def fidelity_report(rows: list[dict], items: list[dict], personas: list[dict]) -> str:
    targets = {p["persona_id"]: p["target_traits"] for p in personas}
    archetype = {p["persona_id"]: p["archetype"] for p in personas}
    scores = score(rows, items)
    models = sorted({m for m, _ in scores})
    traits = list(dict.fromkeys(i["trait"] for i in items))
    L = ["# Persona fidelity: target traits vs measured questionnaire scores\n"]
    L.append(f"{len(personas)} personas answered {len(items)} questionnaire items "
             f"({', '.join(sorted({i['scale'] for i in items}))}) on {len(models)} model(s). "
             "Fidelity is the correlation, across personas, between the trait a persona was written to have "
             "and the score it got on the scale. The spec's Phase 0 gate asks for r > 0.3.\n")
    L.append("| Model | Answers | Invalid |")
    L.append("| --- | --- | --- |")
    for m in models:
        rs = [r for r in rows if r["model"] == m]
        inv = sum(r["invalid"] for r in rs)
        L.append(f"| {m} | {len(rs)} | {inv} ({inv / max(1, len(rs)):.1%}) |")
    L.append("")
    L.append("| Trait | " + " | ".join(f"{m} r | {m} mean (sd)" for m in models) + " |")
    L.append("| --- | " + " | ".join("--- | ---" for _ in models) + " |")
    for t in traits:
        cells = []
        for m in models:
            pids = [pid for (mm, pid) in scores if mm == m and t in scores[(mm, pid)]]
            x = [targets[p][t] for p in pids]
            y = [scores[(m, p)][t] for p in pids]
            r = float(np.corrcoef(x, y)[0, 1]) if len(pids) > 2 and np.std(y) > 0 else float("nan")
            cells.append(f"{r:+.2f} | {np.mean(y):.2f} ({np.std(y):.2f})")
        L.append(f"| {t} | " + " | ".join(cells) + " |")
    L.append("")
    L.append("Raw scores per persona (scale units; MFQ-2 runs 1 to 5, OUS 1 to 7):\n")
    L.append("| Persona | Archetype | Model | " + " | ".join(traits) + " |")
    L.append("| --- | --- | --- | " + " | ".join("---" for _ in traits) + " |")
    for (m, pid) in sorted(scores, key=lambda k: (k[1], k[0])):
        L.append(f"| {pid} | {archetype[pid]} | {m} | " + " | ".join(
            f"{scores[(m, pid)].get(t, float('nan')):.2f}" for t in traits) + " |")
    L.append("")
    return "\n".join(L)


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--run", type=Path, required=True)
    p.add_argument("--personas", type=Path, required=True)
    p.add_argument("--scales", type=Path, nargs="+", required=True)
    args = p.parse_args(argv)
    items = [i for s in args.scales for i in load_scale(s)]
    rows = [json.loads(line) for line in (args.run / "answers.jsonl").read_text().splitlines() if line.strip()]
    print(fidelity_report(rows, items, json.loads(args.personas.read_text())))


if __name__ == "__main__":
    main()
