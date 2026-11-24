import json
import random
import re
from pathlib import Path

import numpy as np

from clue_harness import prompts
from clue_harness.analyse import alignment_rows, permutation_p
from clue_harness.personas import BEHAVIOUR, generate, system_prompt
from clue_harness.run import run
from clue_harness.traits import TRAITS, correlation_matrix

ROOT = Path(__file__).resolve().parents[2]
ITEMS = json.loads((ROOT / "items" / "seed.json").read_text())
PERSONAS = json.loads((ROOT / "agents" / "personas.json").read_text())

# Trait names and scale jargon must not reach the model (spec: behaviour, never labels).
BANNED = re.compile(
    r"machiavell|narciss|psychopath|utilitarian|agreeabl|conscientious|extraver|extrovert|introvert|"
    r"openness|emotionality|honesty-humility|humility|loyalty|\bloyal|authority|purity|proportionality|"
    r"equality|beneficence|instrumental|\btrait|personality|dark triad|z-score|\d\.\d",
    re.I,
)


def test_traits_match_the_game():
    profile = (ROOT / "game" / "src" / "profile.ts").read_text()
    block = profile.split("TRAIT_LABELS")[1].split("}")[0]
    assert sorted(re.findall(r"^\s+(\w+):", block, re.M)) == sorted(TRAITS)
    assert set(BEHAVIOUR) == set(TRAITS)
    assert np.linalg.eigvalsh(correlation_matrix()).min() > 0


def test_committed_personas_are_reproducible():
    assert generate(20, 2026) == PERSONAS


def test_persona_files():
    ids = [p["persona_id"] for p in PERSONAS]
    assert len(ids) == 20 and len(set(ids)) == 20
    assert len({p["backstory"] for p in PERSONAS}) == 20
    assert {"dark-triad", "hyper-utilitarian", "purity-driven"} <= {p["archetype"] for p in PERSONAS}
    for p in PERSONAS:
        assert set(p["target_traits"]) == set(TRAITS)
        assert not BANNED.search(system_prompt(p)), p["persona_id"]


def test_option_order_is_stable_and_varies():
    item = next(i for i in ITEMS if i["answer"]["type"] == "choice" and len(i["answer"]["options"]) == 4)
    assert prompts.option_order(item, "p001") == prompts.option_order(item, "p001")
    orders = {tuple(prompts.option_order(item, f"p{i:03d}")) for i in range(1, 40)}
    assert len(orders) > 5


def test_parse():
    item = next(i for i in ITEMS if i["answer"]["type"] == "choice" and len(i["answer"]["options"]) == 4)
    order = ["C", "A", "D", "B"]
    for raw, key in [("A", "C"), ("B.", "A"), ("**C**", "D"), ("Answer: D", "B"), ("D) because", "B")]:
        assert prompts.parse(item, order, raw) == key, raw
    for raw in ["", "I would not", "a bit of both", "E"]:
        assert prompts.parse(item, order, raw) is None, raw
    binary = next(i for i in ITEMS if i["answer"]["type"] == "binary")
    assert prompts.parse(binary, ["B", "A"], "C") is None
    slider = next(i for i in ITEMS if i["answer"]["type"] == "slider")
    assert prompts.parse(slider, None, "72") == 72
    assert prompts.parse(slider, None, "About 40.") == 40
    assert prompts.parse(slider, None, "150") is None


def test_render_never_shows_keys():
    for item in ITEMS:
        if not prompts.playable(item):
            continue
        text = prompts.render(item, prompts.option_order(item, "p001"))
        assert "keyed" not in text and not BANNED.search(text.replace(item["scenario"], ""))


def test_mock_run_tracks_traits_and_shuffle_does_not(tmp_path):
    rows = run(PERSONAS, ITEMS, ["mock"], tmp_path, workers=4)
    assert len(rows) == 20 * sum(prompts.playable(i) for i in ITEMS)
    assert not any(r["invalid"] for r in rows)
    items = {i["id"]: i for i in ITEMS}
    personas = {p["persona_id"]: p for p in PERSONAS}
    obs, null, p = permutation_p(rows, items, personas, n_perm=200)
    assert obs > 0.3 and abs(null) < 0.15 and p < 0.01
    # A player that ignores the persona shows no alignment.
    rng = random.Random(0)
    noise = []
    for r in rows:
        r = dict(r)
        if r["order"]:
            r["chosen_key"] = rng.choice(r["order"])
        else:
            r["value"] = rng.randint(0, 100)
        noise.append(r)
    assert abs(np.mean([a for *_, a in alignment_rows(noise, items, personas)])) < 0.15
    assert (tmp_path / "answers.jsonl").exists()


def test_scale_items_render_and_score(tmp_path):
    from clue_harness.scales import load_scale, score, standardise

    scale_items = [i for f in ("mfq2", "ous") for i in load_scale(ROOT / "items" / "scales" / f"{f}.json")]
    assert len(scale_items) == 45 and all(i["trait"] in TRAITS for i in scale_items)
    item = scale_items[0]
    text = prompts.render(item, None)
    assert item["scenario"] in text and "1 = " in text and "5 = " in text
    assert prompts.parse(item, None, "4") == 4 and prompts.parse(item, None, "6") is None
    rows = run(PERSONAS, scale_items, ["mock"], tmp_path, workers=4)
    scores = score(rows, scale_items)
    assert len(scores) == 20 and all(len(v) == 8 for v in scores.values())
    z = standardise(scores)
    care = [z[("mock", p["persona_id"])]["care"] for p in PERSONAS]
    assert abs(np.mean(care)) < 1e-9
    # The mock answers along the targets, so measured scores should track them.
    target = [p["target_traits"]["care"] for p in PERSONAS]
    assert np.corrcoef(target, care)[0, 1] > 0.7


def test_gate_keeps_tracking_items_and_drops_a_dominated_one(tmp_path):
    from clue_harness.gate import report as gate_report

    rows = run(PERSONAS, ITEMS, ["mock"], tmp_path, workers=4)
    personas = {p["persona_id"]: p for p in PERSONAS}
    choice = next(i for i in ITEMS if i["answer"]["type"] == "choice")
    # Everyone picks the same option on one item: it must fail the gate.
    first = choice["answer"]["options"][0]["key"]
    rows = [dict(r, chosen_key=first) if r["item_id"] == choice["id"] else r for r in rows]
    _, stats = gate_report(rows, ITEMS, personas, None, n_perm=100)
    by_id = {s["id"]: s for s in stats}
    assert not by_id[choice["id"]]["keep"]
    assert sum(s["keep"] for s in stats) >= 0.8 * len(stats)


def test_draft_items_follow_the_bank_rules():
    """Drafts (items/drafts/*.json) follow the same rules as the bank, with ids unused in seed.json."""
    seen = {i["id"] for i in ITEMS}
    for path in sorted((ROOT / "items" / "drafts").glob("*.json")):
        for item in json.loads(path.read_text()):
            assert item["id"] not in seen, item["id"]
            seen.add(item["id"])
            assert len(item["scenario"].split()) <= 60
            assert item["intensity"] in (1, 2, 3)
            a = item["answer"]
            assert a["type"] in ("choice", "binary")
            assert len(a["options"]) == (2 if a["type"] == "binary" else 4)
            for o in a["options"]:
                assert len(o["keyed"]) == 1 and set(o["keyed"]) <= set(TRAITS) and set(o["keyed"].values()) <= {1, -1}


def test_sets_mode_plays_cards_in_one_conversation_and_guesses(tmp_path):
    from clue_harness.sets import make_sets, run_sets
    from clue_harness.prompts import parse_guess

    sets = make_sets("p001", ITEMS, 4)
    assert all(len(s) <= 4 for s in sets) and len({i["id"] for s in sets for i in s}) == sum(len(s) for s in sets)
    rows = run_sets(PERSONAS[:3], ITEMS, ["mock"], tmp_path, set_size=4, guess=True, workers=2)
    assert rows and not any(r["invalid"] or r["guess_invalid"] for r in rows)
    assert all(abs(sum(r["guess"].values()) - 1) < 1e-9 for r in rows)
    assert parse_guess(["x", "y", "z"], "A=40, B=60") is None
