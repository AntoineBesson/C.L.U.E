# Daily-set and crowd-guess pilot (2026-11-24)

50 Phase 1 personas (p101-p150) on Qwen 3.8 27B played the 25 choice/binary
seed cards in sets of 4 in one conversation (`clue_harness.sets`), guessing
after each answer how 100 people split. Compared with the same agents'
isolated answers ([phase1-prerun](../phase1-prerun), [phase1-batch01](../phase1-batch01)
for the 7 rewritten cards). 1,250 answers + 1,250 guesses, 0 invalid, $0.15.
Full numbers: [report.md](report.md); per-card agent shares: [crowd.json](crowd.json).

- **Memory of earlier cards does not move answers here.** The first card of
  a set has no context and matches the isolated answer 67% of the time (the
  model answers at temperature 1, so this is plain resampling); cards 2-4
  match 65-68%, the same. Trait tracking is the same in both modes (alignment
  +0.43 vs +0.44). Isolated answers stay valid for the bank gate and the
  adaptive-policy replays.
- **Crowd guesses are informative.** The average guess correlates 0.81 with
  the actual split across options, and is off by 9.4 points per option,
  against 14.9 for a flat guess. Agents guess a little more for the option
  they chose themselves (+3.4 points), the false-consensus effect the truth
  bonus relies on, though weaker than people usually show.

Caveats: one model, 50 personas; a card's split shift between modes (median
0.10) is about what n = 50 sampling noise alone gives.
