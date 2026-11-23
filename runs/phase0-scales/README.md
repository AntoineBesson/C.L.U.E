# Phase 0 questionnaires (2026-11-23)

The same 20 personas answered the 45 MFQ-2 and OUS items
(`items/scales/`) on Claude Haiku 5.5 and Sonnet 5.5 through the
`claude-cli` backend: 1,800 answers, none invalid. Scores are the mean of each
trait's items. Full tables in [fidelity.md](fidelity.md).

## Persona fidelity (target vs measured, r across 20 personas)

| Trait | Haiku 5.5 | Sonnet 5.5 |
| --- | --- | --- |
| care | 0.40 | 0.85 |
| equality | 0.07 | 0.76 |
| proportionality | 0.47 | 0.81 |
| loyalty | 0.36 | 0.76 |
| authority | 0.22 | 0.82 |
| purity | 0.51 | 0.66 |
| impartial beneficence | 0.77 | 0.74 |
| instrumental harm | 0.35 | 0.81 |

- **Sonnet plays the personas faithfully on all eight traits** (0.66 to 0.85),
  well above the spec's 0.3 gate.
- **Haiku passes on 6 of 8**, misses on equality (0.07) and authority (0.22),
  and its answers are compressed: MFQ-2 standard deviations across personas
  are 0.2 to 0.5 scale points, against 0.6 to 1.1 on Sonnet. Haiku answers
  most items near the middle whoever it plays.
- The SD3 and HEXACO traits have no measured scores yet: those scales are on
  hold over their terms of use.

These scores are what the trial report
([../phase0-smoke/report.md](../phase0-smoke/report.md), "Against measured
questionnaire scores") now uses as labels for those eight traits.
