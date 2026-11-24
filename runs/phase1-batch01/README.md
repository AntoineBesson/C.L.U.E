# Batch 1: rewrites and 40 new drafts on 100 agents (2026-11-24)

Same 100 agents as the [pre-run](../phase1-prerun) (personas p101-p150 x Qwen
3.8 27B and Mistral Medium 3.5). Played: the 7 items rewritten after the
pre-run plus `items/drafts/batch-01.json` (q0032-q0071). MFQ-2/OUS answers
were reused from the pre-run cache, so agents keep the same measured labels.
4,700 dilemma answers, 0 invalid, $1.71. Per item: [gate.md](gate.md).

**34 of 47 kept.**

- Rewrites: 5 of 7 now pass (q0004, q0012, q0021, q0022, q0027). q0005
  (trolley) is balanced on Mistral but Qwen still pulls the lever 94% of the
  time; q0013 (ventilator) is now balanced but no longer tracks its keys.
- New drafts: 29 of 40 pass. Failures are mostly an obvious answer (q0036,
  q0040, q0042, q0043, q0057, q0058, q0069) or answers just under 1.2 bits
  (q0041, q0065, q0071 at 1.07-1.19); q0050 (aunt's house) does not track.

Bank status: 28 of the 30 seed items plus 29 drafts pass, 57 in all, against
the spec's target of 250.

Rerun: `python -m clue_harness.run --personas ../agents/personas-phase1.json
--items ../items/seed.json ../items/drafts/batch-01.json --item-ids $(cat
../runs/phase1-batch01/item-ids.txt) --scales ../items/scales/mfq2.json
../items/scales/ous.json --backend <model> --out ../runs/phase1-batch01/<model>`
