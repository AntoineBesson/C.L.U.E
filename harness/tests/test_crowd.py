import json
from pathlib import Path

from clue_harness.crowd import build, fingerprint

ROOT = Path(__file__).resolve().parents[2]


def _item(**kw):
    base = {
        "id": "qx", "scenario": "Café?", "answer": {"type": "binary", "options": [
            {"key": "B", "text": "no", "keyed": {"care": -1}},
            {"key": "A", "text": "yes", "keyed": {"care": 1}},
        ]},
    }
    base.update(kw)
    return base


def test_fingerprint_ignores_option_order_and_keys_but_not_text():
    a = _item()
    b = _item(answer={"type": "binary", "options": list(reversed(a["answer"]["options"]))})
    assert fingerprint(a) == fingerprint(b)
    c = _item(scenario="Cafe?")
    assert fingerprint(a) != fingerprint(c)


def test_fingerprint_matches_the_committed_simulated_crowd():
    sim = json.loads((ROOT / "items/crowd/simulated.json").read_text())
    q1 = next(i for i in json.loads((ROOT / "items/seed.json").read_text()) if i["id"] == "q0001")
    assert sim["items"]["q0001"]["fingerprint"] == fingerprint(q1)


def test_build_pools_valid_answers(tmp_path):
    items = tmp_path / "items.json"
    items.write_text(json.dumps([_item()]))
    run = tmp_path / "run"
    (run / "m1").mkdir(parents=True)
    rows = [
        {"agent_id": f"p{i}@m1", "model": "m1", "item_id": "qx", "chosen_key": k, "invalid": False}
        for i, k in enumerate("AAAB")
    ] + [{"agent_id": "p9@m1", "model": "m1", "item_id": "qx", "chosen_key": None, "invalid": True},
         {"agent_id": "p1@m1", "model": "m1", "item_id": "mfq2_01", "value": 3, "invalid": False}]
    (run / "m1/answers.jsonl").write_text("\n".join(json.dumps(r) for r in rows))
    (run / "gate.json").write_text(json.dumps([{"id": "qx", "keep": True}]))
    out = build([(run, None)], [items])
    e = out["items"]["qx"]
    assert e["crowd"]["answerShare"] == {"B": 0.25, "A": 0.75}
    assert e["crowd"]["n"] == 4 and e["gate"] is True
    assert "predictedShare" not in e["crowd"]
    assert set(out["items"]) == {"qx"}


def test_guess_runs_add_the_geometric_mean_of_guesses(tmp_path):
    items = tmp_path / "items.json"
    items.write_text(json.dumps([_item()]))
    run = tmp_path / "run"
    run.mkdir()
    (run / "answers.jsonl").write_text("\n".join(json.dumps(
        {"agent_id": f"p{i}", "model": "m", "item_id": "qx", "chosen_key": "A", "invalid": False}) for i in range(4)))
    guesses = tmp_path / "guesses"
    guesses.mkdir()
    (guesses / "answers.jsonl").write_text("\n".join(json.dumps(
        {"agent_id": f"p{i}", "model": "m", "item_id": "qx", "chosen_key": "A", "invalid": False,
         "guess": g, "guess_invalid": False}) for i, g in enumerate([{"A": 0.8, "B": 0.2}, {"A": 0.2, "B": 0.8}])))
    out = build([(run, None)], [items], [(guesses, None)])
    c = out["items"]["qx"]["crowd"]
    assert c["answerShare"] == {"B": 0.0, "A": 1.0}  # answers come from the main run
    assert c["predictedShare"] == {"B": 0.4, "A": 0.4}  # sqrt(0.8 * 0.2)
    assert out["items"]["qx"]["guesses"] == 2


def test_guesses_pool_across_runs_and_runs_can_bring_their_own_bank(tmp_path):
    items = tmp_path / "items.json"
    items.write_text(json.dumps([_item()]))
    old = tmp_path / "old.json"
    old.write_text(json.dumps([_item(scenario="Old wording?")]))
    run = tmp_path / "run"
    run.mkdir()
    (run / "answers.jsonl").write_text(json.dumps(
        {"agent_id": "p0", "model": "m", "item_id": "qx", "chosen_key": "A", "invalid": False}))

    def guess_run(name, g):
        d = tmp_path / name
        d.mkdir()
        (d / "answers.jsonl").write_text(json.dumps(
            {"agent_id": "p0", "model": "m", "item_id": "qx", "chosen_key": "A", "invalid": False,
             "guess": g, "guess_invalid": False}))
        return d

    a = guess_run("a", {"A": 0.8, "B": 0.2})
    b = guess_run("b", {"A": 0.2, "B": 0.8})
    c = guess_run("c", {"A": 0.5, "B": 0.5})
    out = build([(run, None)], [items], [(a, None), (b, None, items), (c, None, old)])
    e = out["items"]["qx"]
    assert e["crowd"]["predictedShare"] == {"B": 0.4, "A": 0.4}  # a and b pooled; c asked another wording
    assert e["guesses"] == 2 and e["guessRun"] == "a+b"
