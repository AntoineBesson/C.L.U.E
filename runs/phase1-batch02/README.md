# Batch 2 on 100 agents: Qwen + free Nemotron (2026-11-24 to 27)

Same 50 Phase 1 personas (p101-p150), now on Qwen 3.8 27B and Nemotron 3
Ultra (free tier, run over four days of the 1,000-a-day quota). Played: the
10 batch 1 drafts revised after their first gate, plus
`items/drafts/batch-02.json` (q0072-q0110, 39 new). Qwen agents are labelled
by their measured MFQ-2/OUS scores; Nemotron agents did not answer the
questionnaires (to save quota) and are labelled by their persona targets,
which matched Nemotron's measured scores at 0.66-0.87 in Phase 0.
4,900 answers, 3 invalid; cost about $0.25 (Qwen only). Per card: [gate.md](gate.md).

**38 of 49 kept.**

- Revised batch 1 drafts: 7 of 10 now pass. Still failing: q0040 (dinner bill,
  72% on Nemotron), q0042 (café investment, 71%) and q0071 (kidney, 71% and
  weak tracking).
- New drafts: 31 of 39 pass. Failures: five of the seven sacrificial cards
  (q0104 care-home fire, q0106 stored blood, q0108 dam, q0109 river rescue at
  71-85% one option; q0110 vaccine order does not track), plus q0079 (energy
  supplier, does not track), q0080 (gift collection) and q0088 (brother's
  loan). Sacrificial cards with four options tend to have one answer that
  feels clearly right; they need more balanced costs.

Bank status: 95 cards pass (28 seed, 29 + 7 batch 1 drafts, 31 batch 2
drafts) toward the spec's 250. Batches 1 and 2 were gated on different model
pairs (Qwen + Mistral, then Qwen + Nemotron), so the final pass over the
whole bank should use one pair.
