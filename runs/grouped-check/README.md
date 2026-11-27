# Grouped-mode check on free Nemotron (2026-11-26)

Does sending a whole set of cards in one request (`clue_harness.sets
--grouped`) give the same answers as one card per request? 20 Phase 0
personas played the 23 choice/binary cards of the bank as it was in Phase 0
([seed-phase0.json](seed-phase0.json)) in grouped sets of 4, with crowd
guesses, on free Nemotron 3 Ultra. Compared with the same agents' isolated
answers from [phase0-nemotron](../phase0-nemotron). Free; 269 requests in all.
Full report: [report.md](report.md).

| | Requests | Same answer as the isolated run |
| --- | --- | --- |
| Isolated again (5 personas, resampling baseline) | 149 | 75% (n = 114) |
| Grouped sets of 4, all 20 personas | 120 | 74% (n = 460) |
| Grouped, same 5 personas as the baseline | | 72% (n = 115) |

- **Grouped answers agree with isolated ones as often as a second isolated
  run does** (74% vs 75%; the gap is well within sampling error). Trait
  tracking is unchanged (alignment +0.44 grouped, +0.45 isolated).
- **No parsing problems**: 0 invalid answers or guesses, no retries.
- **Requests drop about 8-fold**: 120 requests for 460 answers and 460
  guesses, against 920 in the one-request-per-step set mode (or 460 isolated
  answers without guesses).
- **Guesses**: off by 11.1 points per option on average. Agents guess much
  more for their own choice than others do (+24.8 points, against +3.4 for
  Qwen in the sequential pilot), so the false-consensus effect is far
  stronger when the answer and the guess come on the same line. Keep that in
  mind before using these guesses as crowd predictions.

**Decision:** grouped mode is the default for request-limited models (free
tiers, Mistral) when playing daily sets. The item gate and the
adaptive-policy replays keep isolated answers (`clue_harness.run`).

## Guesses in a second turn (2026-11-27)

Same 20 personas and cards, but the agent answers the whole set first and
guesses the whole set in a second turn ([report-separate.md](report-separate.md);
240 free requests, 2 per set).

| | Guess on the answer's line | Guesses in a second turn |
| --- | --- | --- |
| Same answer as isolated (baseline 75%) | 74% | 73% |
| Invalid answers / guesses | 0 / 0 | 0 / 0 |
| False-consensus gap (own pick vs others) | +24.8 points | **+5.4 points** |
| Error of the average guess, per option | 11.1 points | 13.7 points |
| Average game points per agent (predictionPoints vs the other 19 agents) | 75.5 (66-85) | 79.4 (73-85) |
| Same, for Clu's even-split guess | 76.9 | 79.8 |

- **The second turn removes most of the own-pick bias** (+5 points, in the
  range people usually show), so it stays the default.
- **As leaderboard bots**, agents score 73-85 points per card with a spread
  of about 3 points between them. On average they do not beat the even-split
  benchmark yet: their average guess tracks the crowd well, but each agent's
  own guess is noisy. Bots will sit around Clu on a simulated leaderboard
  rather than above it.
