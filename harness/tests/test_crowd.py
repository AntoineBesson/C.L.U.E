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
