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
