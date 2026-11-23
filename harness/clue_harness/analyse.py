"""Phase 0 trial report: do AI players' choices track the traits their options are keyed to?

    python -m clue_harness.analyse --run ../runs/phase0-smoke --personas ../agents/personas.json \\
        --items ../items/seed.json > ../runs/phase0-smoke/report.md

Targets stand in for labels here. The spec labels agents by their measured
questionnaire scores; once the questionnaires are in the harness, swap
``target_traits`` for measured scores and the same checks apply.

Checks:
- invalid answers (refusals or unparseable), per model and archetype;
- first-position picks against chance;
- per item: answer spread (entropy, top share; the spec drops items where one
  option takes over 70%);
- trait tracking: for each answer, how well the chosen option's keys fit the
  persona minus the average fit of all options ("alignment"), with a
  permutation test that shuffles which persona gave which answers; per trait,
  the correlation between a persona's target and choosing an option keyed to it.
"""

from __future__ import annotations

import argparse
import json
import math
from collections import defaultdict
from pathlib import Path

import numpy as np

from .traits import TRAITS


def fit(keyed: dict[str, float], traits: dict[str, float]) -> float:
    return sum(w * traits[t] for t, w in keyed.items())


def _corr(x: list[float], y: list[float]) -> float | None:
    x_, y_ = np.asarray(x, float), np.asarray(y, float)
    if len(x_) < 3 or x_.std() == 0 or y_.std() == 0:
        return None
    return float(np.corrcoef(x_, y_)[0, 1])


def alignment_rows(rows: list[dict], items: dict, personas: dict) -> list[tuple[str, str, str, float]]:
    """(model, persona_id, item_id, alignment) for valid choice/binary and slider answers.

    Choice: fit(chosen) - mean fit(options). Slider: (value-50)/50 * fit(keys).
    Both are 0 on average for a player who ignores the persona.
    """
    out = []
    for r in rows:
        if r["invalid"]:
            continue
        item = items[r["item_id"]]
        traits = personas[r["persona_id"]]["target_traits"]
        a = item["answer"]
        if a["type"] in ("choice", "binary"):
            fits = {o["key"]: fit(o["keyed"], traits) for o in a["options"]}
            out.append((r["model"], r["persona_id"], r["item_id"], fits[r["chosen_key"]] - float(np.mean(list(fits.values())))))
        elif a["type"] == "slider":
            out.append((r["model"], r["persona_id"], r["item_id"], (r["value"] - 50) / 50 * fit(a["keyed"], traits)))
    return out


def permutation_p(rows: list[dict], items: dict, personas: dict, n_perm: int = 2000, seed: int = 0) -> tuple[float, float, float]:
    """Observed mean alignment, mean under shuffled personas, and one-sided p."""
    observed = float(np.mean([a for *_, a in alignment_rows(rows, items, personas)]))
    ids = sorted(personas)
    rng = np.random.default_rng(seed)
    null = []
    for _ in range(n_perm):
        perm = dict(zip(ids, rng.permutation(ids)))
        shuffled = {pid: personas[perm[pid]] for pid in ids}
        null.append(float(np.mean([a for *_, a in alignment_rows(rows, items, shuffled)])))
    null_a = np.asarray(null)
    p = (1 + int((null_a >= observed).sum())) / (n_perm + 1)
    return observed, float(null_a.mean()), p


def trait_correlations(rows: list[dict], items: dict, personas: dict) -> dict[str, list[float]]:
    """Per trait, the correlations (one per keyed option or slider) between direction * target and the answer."""
    by_item: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        if not r["invalid"]:
            by_item[r["item_id"]].append(r)
    out: dict[str, list[float]] = defaultdict(list)
    for item_id, rs in by_item.items():
        a = items[item_id]["answer"]
        if a["type"] in ("choice", "binary"):
            for o in a["options"]:
                chosen = [1.0 if r["chosen_key"] == o["key"] else 0.0 for r in rs]
                for t, w in o["keyed"].items():
                    c = _corr([w * personas[r["persona_id"]]["target_traits"][t] for r in rs], chosen)
                    if c is not None:
                        out[t].append(c)
        elif a["type"] == "slider":
            vals = [float(r["value"]) for r in rs]
            for t, w in a["keyed"].items():
                c = _corr([w * personas[r["persona_id"]]["target_traits"][t] for r in rs], vals)
                if c is not None:
                    out[t].append(c)
    return out


def entropy_bits(counts: list[int]) -> float:
    n = sum(counts)
    return -sum(c / n * math.log2(c / n) for c in counts if c)


def report(rows: list[dict], items_list: list[dict], personas_list: list[dict]) -> str:
    items = {i["id"]: i for i in items_list}
    personas = {p["persona_id"]: p for p in personas_list}
    models = sorted({r["model"] for r in rows})
    L: list[str] = []
    w = L.append

    w("# Phase 0 trial: personas × seed dilemmas\n")
    n_items = len({r["item_id"] for r in rows})
    w(f"{len(personas)} personas × {n_items} scorable items × {len(models)} model(s) = {len(rows)} answers. "
      "Free-text items are not played. Targets stand in for questionnaire scores until those are in the harness.\n")

    # Validity
    w("## Valid answers\n")
    w("| Model | Answers | Invalid | Needed the strict retry | Input tokens / call |")
    w("| --- | --- | --- | --- | --- |")
    for m in models:
        rs = [r for r in rows if r["model"] == m]
        inv = sum(r["invalid"] for r in rs)
        retry = sum(r["attempts"] > 1 for r in rs)
        toks = [r["input_tokens"] for r in rs if r.get("input_tokens")]
        tok = f"{np.mean(toks):.0f}" if toks else "n/a"
        w(f"| {m} | {len(rs)} | {inv} ({inv / len(rs):.1%}) | {retry} | {tok} |")
    w("")
    by_arch = defaultdict(lambda: [0, 0])
    for r in rows:
        by_arch[(r["model"], r["archetype"])][0] += 1
        by_arch[(r["model"], r["archetype"])][1] += r["invalid"]
    if any(v[1] for v in by_arch.values()):
        w("Invalid answers by archetype: " + ", ".join(
            f"{m} / {a}: {v[1]}/{v[0]}" for (m, a), v in sorted(by_arch.items()) if v[1]) + "\n")

    # Position bias
    w("## Position bias\n")
    w("Share of choice and binary answers that picked the first option shown, against what a player ignoring position would give.\n")
    w("| Model | First-position picks | Expected by chance |")
    w("| --- | --- | --- |")
    for m in models:
        rs = [r for r in rows if r["model"] == m and r["order"] and not r["invalid"]]
        if rs:
            first = np.mean([r["chosen_position"] == 0 for r in rs])
            exp = np.mean([1 / len(r["order"]) for r in rs])
            w(f"| {m} | {first:.1%} | {exp:.1%} |")
    w("")

    # Trait tracking
    w("## Do choices track the keyed traits?\n")
    w("Alignment is how much better the chosen option's keys fit the persona's targets than the average option "
      "(slider: how far the answer moves toward the persona's keyed side). It is 0 for a player who ignores the persona. "
      "The p-value comes from 2,000 shuffles of which persona gave which answers.\n")
    w("| Model | Mean alignment | Under shuffled personas | p |")
    w("| --- | --- | --- | --- |")
    for m in models:
        rs = [r for r in rows if r["model"] == m]
        obs, null, p = permutation_p(rs, items, personas)
        w(f"| {m} | {obs:.3f} | {null:.3f} | {p:.4f} |")
    w("")

    w("### Per trait\n")
    w("For each option or slider keyed to a trait: the correlation, across personas, between the persona's target "
      "on that trait (signed by the key's direction) and choosing that option (slider: the value). "
      "Mean over keyed options; with 20 personas a single correlation has a standard error of about 0.22, so read the means, not single items.\n")
    header = "| Trait | Keyed options | " + " | ".join(f"{m} mean r | {m} share > 0" for m in models) + " |"
    w(header)
    w("| --- | --- | " + " | ".join("--- | ---" for _ in models) + " |")
    per_model = {m: trait_correlations([r for r in rows if r["model"] == m], items, personas) for m in models}
    for t in TRAITS:
        n = max((len(per_model[m].get(t, [])) for m in models), default=0)
        cells = []
        for m in models:
            cs = per_model[m].get(t, [])
            cells.append(f"{np.mean(cs):+.2f} | {np.mean([c > 0 for c in cs]):.0%}" if cs else "n/a | n/a")
        w(f"| {t} | {n} | " + " | ".join(cells) + " |")
    w("")

    # Per item
    w("## Per item\n")
    w("Entropy in bits (maximum 2 for four options, 1 for two). Top share above 70% means the spec would drop the item. "
      "Alignment below 0 means the item's options did not track their keys for that model. Slider items show the standard deviation of answers instead of entropy.\n")
    w("| Item | Type | " + " | ".join(f"{m} entropy | {m} top share | {m} alignment" for m in models) + " |")
    w("| --- | --- | " + " | ".join("--- | --- | ---" for _ in models) + " |")
    align = defaultdict(list)
    for m, _pid, iid, a in alignment_rows(rows, items, personas):
        align[(m, iid)].append(a)
    flagged = defaultdict(list)
    for iid in sorted({r["item_id"] for r in rows}):
        a = items[iid]["answer"]
        cells = []
        for m in models:
            rs = [r for r in rows if r["model"] == m and r["item_id"] == iid and not r["invalid"]]
            al = np.mean(align[(m, iid)]) if align[(m, iid)] else float("nan")
            if a["type"] == "slider":
                vals = [r["value"] for r in rs]
                cells.append(f"sd {np.std(vals):.0f} | mean {np.mean(vals):.0f} | {al:+.2f}")
                if np.std(vals) < 10:
                    flagged[m].append(f"{iid} (slider sd {np.std(vals):.0f})")
            else:
                counts = [sum(r["chosen_key"] == o["key"] for r in rs) for o in a["options"]]
                top = max(counts) / max(1, len(rs))
                cells.append(f"{entropy_bits(counts):.2f} | {top:.0%} | {al:+.2f}")
                if top > 0.7:
                    flagged[m].append(f"{iid} (top {top:.0%})")
            if al <= 0:
                flagged[m].append(f"{iid} (alignment {al:+.2f})")
        w(f"| {iid} | {a['type']} | " + " | ".join(cells) + " |")
    w("")
    for m in models:
        if flagged[m]:
            w(f"Flagged for {m}: " + ", ".join(flagged[m]) + "\n")

    # Persona-level
    w("## Per persona\n")
    w("Mean alignment of each persona's answers. Low values mean the model did not play this persona's traits.\n")
    w("| Persona | Archetype | " + " | ".join(models) + " |")
    w("| --- | --- | " + " | ".join("---" for _ in models) + " |")
    pa = defaultdict(list)
    for m, pid, _iid, a in alignment_rows(rows, items, personas):
        pa[(m, pid)].append(a)
    for pid in sorted(personas):
        w(f"| {pid} | {personas[pid]['archetype']} | " + " | ".join(
            f"{np.mean(pa[(m, pid)]):+.2f}" if pa[(m, pid)] else "n/a" for m in models) + " |")
    w("")
    return "\n".join(L)


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--run", type=Path, required=True)
    p.add_argument("--personas", type=Path, required=True)
    p.add_argument("--items", type=Path, required=True)
    args = p.parse_args(argv)
    rows = [json.loads(line) for line in (args.run / "answers.jsonl").read_text().splitlines() if line.strip()]
    print(report(rows, json.loads(args.items.read_text()), json.loads(args.personas.read_text())))


if __name__ == "__main__":
    main()
