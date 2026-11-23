# Re-test of the revised items (2026-11-23)

The 20 Phase 0 personas answered the revised items on the three models that
passed Phase 0: Sonnet 5.5 (claude-cli), Qwen 3.8 27B and Mistral Medium 3.5
(OpenRouter). 9 items x 20 personas x 3 models = 540 answers, 0 invalid, about $0.15.

"Top" is the share of the most chosen option, "al" the mean alignment
(how much better the chosen option fits the persona than the average option).

| Item | Change | Sonnet old → new | Qwen old → new | Mistral old → new | Kept? |
| --- | --- | --- | --- | --- | --- |
| q0005 trolley | lever only works half the time | top 75% → 65% | top 95% → 70% | 60% → 65% | yes |
| q0009 | equality option: "split it evenly" | al +0.51 → +0.36 | +0.35 → +0.43 | +0.53 → +0.50 | yes |
| q0014 | proportionality option: "ask them to replace them" | al +0.63 → +0.54 | top 85% → 60% | al +0.11 → +0.74 | yes |
| q0018 | equality option: "those who earn more pay more" | al +0.06 → +0.19 | +0.02 → -0.03 | +0.07 → +0.12 | yes, still weak |
| q0020 mattress | a stranger's used mattress, a fifth of the price | top 85% → 75% | top 90% → 55% | 65% → 55% | yes |
| q0024 | equality option wording | al +0.73 → +0.79 | +0.60 → +0.58 | +0.44 → +0.21 | yes |
| q0031 (new) | bonus split: equal / by work / by need / take half | al +0.88 | +0.81 | +0.78 | yes |
| q0001 | proportionality option: "you earned the credit" | al +0.38 → -0.19 | top 35% → 70% | +0.64 → +0.40 | **reverted**: became the default answer |
| q0012 | proportionality option: "leave them out" | al +0.28 → +0.05 | -0.02 → +0.06 | +0.17 → -0.13 | **reverted**: nobody picked it |

Per-option correlation between a persona's target and choosing an option keyed
to the trait, over these items:

| Trait | Sonnet old → new | Qwen old → new | Mistral old → new |
| --- | --- | --- | --- |
| equality | +0.06 → +0.20 | -0.11 → +0.11 | -0.15 → +0.02 |
| proportionality | +0.17 → +0.22 | -0.16 → +0.11 | -0.19 → +0.21 |

Both traits went from negative to positive on every model, but stay the
weakest. n = 20 per model, so single-item numbers are noisy; the Phase 1
pre-run (100 agents) decides which items stay. q0005 and q0020 are still
above 70% on one model (Qwen 70%, Sonnet 75%), and q0018 and q0012 still track weakly.

Raw answers: `sonnet/`, `qwen/`, `mistral/` (answers.jsonl).
