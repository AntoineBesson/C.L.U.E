# Nemotron 3 Ultra, free tier (2026-11-23 to 24)

Model family through OpenRouter's free tier (`nvidia/nemotron-3-ultra-550b-a55b:free`):
20 personas × 29 dilemmas + 45 MFQ-2/OUS items = 1,480 answers, run over two
days because of the free daily cap (1,000 requests a day once credits were
bought). Cost $0. Full tables: [report.md](report.md), [fidelity.md](fidelity.md);
compared with the other models in [phase0-families](../phase0-families).

- 0 invalid answers (10 needed the strict retry); first-position picks 28%
  against 32% by chance.
- Dilemma alignment 0.47 (0.02 with shuffled personas, p < 0.001), level with
  Sonnet 5.5 and Mistral Medium 3.5.
- MFQ-2/OUS fidelity 0.66 to 0.87 on all 8 traits; dark triad on dilemmas
  0.54 / 0.57 / 0.54; the dark-triad archetype is played without refusals
  (alignment 0.85).
- Passes the Phase 0 gates. Equality and proportionality options do not track
  here either (+0.01, -0.05), as on the other models.

The run used the bank as merged in #7 (30 items); the later item revisions
were not played by this model.
