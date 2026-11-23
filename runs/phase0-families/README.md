# Phase 0: model families compared (2026-11-23)

Combines the Claude runs ([phase0-smoke](../phase0-smoke), [phase0-scales](../phase0-scales))
with Qwen 3.8 27B ([phase0-qwen](../phase0-qwen)) and Mistral Medium 3.5
([phase0-mistral](../phase0-mistral)) through OpenRouter. Same 20 personas, same
29 dilemmas and 45 MFQ-2/OUS items, same option orders. Full tables:
[report.md](report.md), [fidelity.md](fidelity.md). Nemotron 3 Ultra (free tier)
is still running and is added once it finishes.

| | Haiku 5.5 | Sonnet 5.5 | Mistral Medium 3.5 | Qwen 3.8 27B |
| --- | --- | --- | --- | --- |
| Invalid answers (of 1,480) | 0 | 0 | 0 | 0 |
| First-position picks (chance 32%) | 15% | 32% | 27% | 27% |
| Dilemma alignment (0 = ignores persona) | 0.16 | 0.44 | 0.48 | 0.39 |
| MFQ-2/OUS fidelity, range over 8 traits | 0.07 to 0.77 | 0.66 to 0.85 | 0.70 to 0.91 | 0.67 to 0.86 |
| Dark triad on dilemmas (Mach / narc / psych, vs targets) | 0.12 / 0.24 / -0.05 | 0.56 / 0.47 / 0.45 | 0.48 / 0.53 / 0.55 | 0.36 / 0.58 / 0.49 |
| Dark-triad archetype alignment | 0.02 | 0.64 | 0.81 | 0.78 |

- **Three of four models pass the spec's Phase 0 gates**: no refusals, first
  position near chance, fidelity above 0.3 on every measured trait, and dark
  triad above 0.3 against targets. Haiku 5.5 fails on fidelity and position bias.
- **No safety softening of dark personas** on any of the three: the dark-triad
  archetype tracks best of all personas on Mistral and Qwen.
- **Items that stay weak across families**: equality and proportionality
  options barely track on any model (mean r around 0 except Sonnet), which
  points at the items rather than the models. q0005 (trolley) and q0020
  (second-hand mattress) are dominated by one option on two or more models.
- Qwen returned answer probabilities (logprobs) for 576 of 1,480 answers, when
  routed to providers that support them; the rest are single samples.

Cost: about $1.21 of OpenRouter credit for Qwen and Mistral together
(including $0.11 of an abandoned Mistral Large 4 start, which could not turn
its reasoning off).
