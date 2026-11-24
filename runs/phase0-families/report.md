# Phase 0 trial: personas × seed dilemmas

20 personas × 29 scorable items × 5 model(s) = 2900 answers. Free-text items are not played. Targets stand in for questionnaire scores until those are in the harness.

## Valid answers

| Model | Answers | Invalid | Needed the strict retry | Input tokens / call |
| --- | --- | --- | --- | --- |
| claude-cli:claude-haiku-5-5 | 580 | 0 (0.0%) | 0 | 2828 |
| claude-cli:claude-sonnet-5-5 | 580 | 0 (0.0%) | 0 | 2808 |
| openrouter:mistralai/mistral-medium-3-5 | 580 | 0 (0.0%) | 0 | n/a |
| openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 580 | 0 (0.0%) | 10 | n/a |
| openrouter:qwen/qwen3.8-27b | 580 | 0 (0.0%) | 0 | n/a |

## Position bias

Share of choice and binary answers that picked the first option shown, against what a player ignoring position would give.

| Model | First-position picks | Expected by chance |
| --- | --- | --- |
| claude-cli:claude-haiku-5-5 | 14.8% | 31.9% |
| claude-cli:claude-sonnet-5-5 | 32.0% | 31.9% |
| openrouter:mistralai/mistral-medium-3-5 | 27.4% | 31.9% |
| openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 27.8% | 31.9% |
| openrouter:qwen/qwen3.8-27b | 27.2% | 31.9% |

## Do choices track the keyed traits?

Alignment is how much better the chosen option's keys fit the persona's targets than the average option (slider: how far the answer moves toward the persona's keyed side). It is 0 for a player who ignores the persona. The p-value comes from 2,000 shuffles of which persona gave which answers.

| Model | Mean alignment | Under shuffled personas | p |
| --- | --- | --- | --- |
| claude-cli:claude-haiku-5-5 | 0.164 | -0.017 | 0.0005 |
| claude-cli:claude-sonnet-5-5 | 0.438 | -0.001 | 0.0005 |
| openrouter:mistralai/mistral-medium-3-5 | 0.479 | 0.022 | 0.0005 |
| openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 0.466 | 0.017 | 0.0005 |
| openrouter:qwen/qwen3.8-27b | 0.388 | 0.009 | 0.0005 |

### Per trait

For each option or slider keyed to a trait: the correlation, across personas, between the persona's target on that trait (signed by the key's direction) and choosing that option (slider: the value). Mean over keyed options; with 20 personas a single correlation has a standard error of about 0.22, so read the means, not single items.

| Trait | Keyed options | claude-cli:claude-haiku-5-5 mean r | claude-cli:claude-haiku-5-5 share > 0 | claude-cli:claude-sonnet-5-5 mean r | claude-cli:claude-sonnet-5-5 share > 0 | openrouter:mistralai/mistral-medium-3-5 mean r | openrouter:mistralai/mistral-medium-3-5 share > 0 | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free mean r | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free share > 0 | openrouter:qwen/qwen3.8-27b mean r | openrouter:qwen/qwen3.8-27b share > 0 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| care | 5 | +0.16 | 100% | +0.31 | 80% | +0.26 | 100% | +0.26 | 80% | +0.41 | 100% |
| equality | 5 | -0.01 | 60% | +0.14 | 60% | -0.01 | 50% | +0.01 | 50% | -0.11 | 0% |
| proportionality | 5 | +0.15 | 50% | +0.22 | 100% | -0.07 | 20% | -0.05 | 50% | +0.04 | 50% |
| loyalty | 6 | +0.03 | 40% | +0.31 | 83% | +0.33 | 83% | +0.33 | 83% | +0.28 | 83% |
| authority | 3 | +0.31 | 100% | +0.60 | 100% | +0.62 | 100% | +0.60 | 100% | +0.48 | 100% |
| purity | 4 | -0.03 | 25% | +0.36 | 100% | +0.56 | 100% | +0.60 | 100% | +0.46 | 100% |
| instrumental_harm | 5 | +0.42 | 100% | +0.54 | 100% | +0.48 | 100% | +0.33 | 80% | +0.36 | 100% |
| impartial_beneficence | 5 | +0.30 | 100% | +0.57 | 100% | +0.55 | 100% | +0.50 | 100% | +0.50 | 100% |
| machiavellianism | 6 | +0.12 | 40% | +0.56 | 100% | +0.48 | 83% | +0.54 | 100% | +0.36 | 83% |
| narcissism | 5 | +0.24 | 80% | +0.47 | 100% | +0.53 | 100% | +0.57 | 100% | +0.58 | 100% |
| psychopathy | 3 | -0.05 | 67% | +0.45 | 100% | +0.55 | 100% | +0.54 | 100% | +0.49 | 100% |
| honesty_humility | 9 | +0.26 | 75% | +0.31 | 78% | +0.37 | 75% | +0.40 | 88% | +0.25 | 78% |
| emotionality | 4 | +0.15 | 75% | +0.36 | 100% | +0.20 | 100% | +0.25 | 100% | +0.10 | 67% |
| extraversion | 6 | +0.07 | 75% | +0.34 | 80% | +0.23 | 100% | +0.23 | 100% | +0.29 | 80% |
| agreeableness | 6 | +0.08 | 75% | +0.29 | 60% | +0.57 | 100% | +0.32 | 80% | +0.34 | 83% |
| conscientiousness | 7 | +0.14 | 71% | +0.23 | 83% | +0.30 | 83% | +0.20 | 86% | -0.03 | 67% |
| openness | 3 | +0.08 | 67% | +0.20 | 67% | +0.29 | 100% | +0.23 | 100% | +0.33 | 100% |

### Against measured questionnaire scores

The same per-trait correlations, with each agent's label taken from its own questionnaire answers (z-scored within each model) instead of the target it was written with. This is how the spec labels agents. Only traits covered by the scales run so far appear.

| Trait | claude-cli:claude-haiku-5-5 r vs targets | claude-cli:claude-haiku-5-5 r vs measured | claude-cli:claude-sonnet-5-5 r vs targets | claude-cli:claude-sonnet-5-5 r vs measured | openrouter:mistralai/mistral-medium-3-5 r vs targets | openrouter:mistralai/mistral-medium-3-5 r vs measured | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free r vs targets | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free r vs measured | openrouter:qwen/qwen3.8-27b r vs targets | openrouter:qwen/qwen3.8-27b r vs measured |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| care | +0.16 | +0.12 | +0.31 | +0.51 | +0.26 | +0.38 | +0.26 | +0.35 | +0.41 | +0.42 |
| equality | -0.01 | +0.15 | +0.14 | +0.19 | -0.01 | +0.11 | +0.01 | +0.07 | -0.11 | -0.23 |
| proportionality | +0.15 | +0.01 | +0.22 | +0.19 | -0.07 | -0.11 | -0.05 | -0.10 | +0.04 | +0.08 |
| loyalty | +0.03 | -0.05 | +0.31 | +0.30 | +0.33 | +0.32 | +0.33 | +0.31 | +0.28 | +0.26 |
| authority | +0.31 | +0.07 | +0.60 | +0.64 | +0.62 | +0.71 | +0.60 | +0.67 | +0.48 | +0.52 |
| purity | -0.03 | +0.01 | +0.36 | +0.47 | +0.56 | +0.60 | +0.60 | +0.62 | +0.46 | +0.44 |
| instrumental_harm | +0.42 | +0.14 | +0.54 | +0.54 | +0.48 | +0.43 | +0.33 | +0.35 | +0.36 | +0.24 |
| impartial_beneficence | +0.30 | +0.29 | +0.57 | +0.66 | +0.55 | +0.65 | +0.50 | +0.64 | +0.50 | +0.50 |

## Per item

Entropy in bits (maximum 2 for four options, 1 for two). Top share above 70% means the spec would drop the item. Alignment below 0 means the item's options did not track their keys for that model. Slider items show the standard deviation of answers instead of entropy.

| Item | Type | claude-cli:claude-haiku-5-5 entropy | claude-cli:claude-haiku-5-5 top share | claude-cli:claude-haiku-5-5 alignment | claude-cli:claude-sonnet-5-5 entropy | claude-cli:claude-sonnet-5-5 top share | claude-cli:claude-sonnet-5-5 alignment | openrouter:mistralai/mistral-medium-3-5 entropy | openrouter:mistralai/mistral-medium-3-5 top share | openrouter:mistralai/mistral-medium-3-5 alignment | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free entropy | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free top share | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free alignment | openrouter:qwen/qwen3.8-27b entropy | openrouter:qwen/qwen3.8-27b top share | openrouter:qwen/qwen3.8-27b alignment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| q0001 | choice | 1.16 | 70% | -0.10 | 1.79 | 50% | +0.38 | 1.80 | 40% | +0.64 | 1.79 | 35% | +0.47 | 1.79 | 35% | +0.55 |
| q0002 | binary | 0.81 | 75% | +0.33 | 0.99 | 55% | +0.49 | 0.99 | 55% | +0.59 | 0.97 | 60% | +0.58 | 0.97 | 60% | +0.13 |
| q0003 | slider | sd 25 | mean 51 | +0.39 | sd 22 | mean 63 | +0.47 | sd 33 | mean 60 | +0.73 | sd 36 | mean 53 | +0.81 | sd 45 | mean 56 | +0.56 |
| q0004 | choice | 0.99 | 55% | -0.21 | 1.46 | 45% | +0.36 | 0.57 | 90% | +0.07 | 1.16 | 70% | +0.19 | 1.37 | 60% | -0.03 |
| q0005 | binary | -0.00 | 100% | +0.00 | 0.81 | 75% | +0.52 | 0.97 | 60% | +0.75 | 0.93 | 65% | +0.56 | 0.29 | 95% | +0.15 |
| q0007 | choice | 1.30 | 60% | +0.14 | 1.60 | 55% | +0.62 | 1.84 | 45% | +0.57 | 1.68 | 55% | +0.55 | 1.87 | 40% | +0.75 |
| q0008 | choice | 1.34 | 55% | +0.26 | 1.28 | 65% | +0.47 | 1.68 | 50% | +0.78 | 1.90 | 30% | +0.59 | 1.86 | 35% | +0.57 |
| q0009 | choice | 1.46 | 50% | +0.07 | 1.72 | 45% | +0.51 | 1.79 | 50% | +0.53 | 1.49 | 50% | +0.56 | 1.95 | 30% | +0.35 |
| q0010 | slider | sd 25 | mean 60 | -0.13 | sd 20 | mean 67 | +0.21 | sd 24 | mean 73 | +0.31 | sd 26 | mean 72 | +0.30 | sd 29 | mean 70 | +0.38 |
| q0011 | choice | 1.44 | 50% | +0.13 | 1.14 | 65% | +0.39 | 0.97 | 60% | +0.30 | 1.52 | 40% | +0.28 | 1.77 | 40% | +0.06 |
| q0012 | choice | 0.75 | 85% | -0.02 | 1.16 | 70% | +0.28 | 1.34 | 65% | +0.17 | 1.44 | 55% | +0.27 | 1.76 | 50% | -0.02 |
| q0013 | binary | 0.88 | 70% | +0.45 | 0.93 | 65% | +0.48 | 0.93 | 65% | +0.16 | 0.72 | 80% | +0.35 | 0.61 | 85% | +0.31 |
| q0014 | choice | 1.79 | 35% | +0.21 | 1.93 | 35% | +0.63 | 1.49 | 50% | +0.11 | 1.60 | 55% | +0.39 | 0.61 | 85% | +0.38 |
| q0015 | binary | 0.99 | 55% | -0.10 | 0.97 | 60% | +0.81 | 1.00 | 50% | +0.71 | 0.97 | 60% | +0.72 | 1.00 | 50% | +0.69 |
| q0016 | choice | 1.99 | 30% | +0.45 | 1.71 | 45% | +0.53 | 1.94 | 35% | +0.80 | 1.48 | 65% | +0.62 | 1.65 | 50% | +0.47 |
| q0017 | slider | sd 23 | mean 35 | +0.25 | sd 21 | mean 63 | +0.23 | sd 28 | mean 57 | +0.48 | sd 27 | mean 64 | +0.50 | sd 31 | mean 36 | +0.40 |
| q0018 | choice | 1.88 | 35% | +0.31 | 1.34 | 55% | +0.06 | 1.68 | 40% | +0.07 | 1.64 | 55% | -0.13 | 1.44 | 50% | +0.02 |
| q0019 | choice | 1.23 | 50% | +0.41 | 1.32 | 70% | +0.59 | 1.58 | 50% | +0.93 | 1.24 | 65% | +0.83 | 1.74 | 40% | +0.98 |
| q0020 | binary | 0.88 | 70% | -0.11 | 0.61 | 85% | +0.33 | 0.93 | 65% | +0.51 | 0.88 | 70% | +0.50 | 0.47 | 90% | +0.25 |
| q0021 | choice | -0.00 | 100% | -0.17 | 1.14 | 65% | +0.42 | 1.22 | 55% | +0.33 | 1.23 | 50% | +0.39 | 0.99 | 55% | +0.36 |
| q0022 | slider | sd 28 | mean 35 | +0.13 | sd 18 | mean 34 | +0.13 | sd 34 | mean 32 | +0.11 | sd 33 | mean 28 | +0.05 | sd 23 | mean 18 | +0.10 |
| q0023 | slider | sd 38 | mean 54 | +1.02 | sd 24 | mean 62 | +0.68 | sd 34 | mean 66 | +0.70 | sd 44 | mean 50 | +0.48 | sd 38 | mean 79 | +0.52 |
| q0024 | choice | 1.46 | 50% | +0.24 | 1.93 | 35% | +0.73 | 1.58 | 50% | +0.44 | 1.81 | 45% | +0.42 | 1.90 | 30% | +0.60 |
| q0025 | binary | 0.88 | 70% | +0.03 | 0.93 | 65% | +0.52 | 0.93 | 65% | +0.39 | 0.81 | 75% | +0.45 | 1.00 | 50% | +0.49 |
| q0026 | choice | 1.85 | 40% | -0.04 | 1.40 | 60% | +0.34 | 1.41 | 55% | +0.52 | 1.24 | 65% | +0.39 | 1.81 | 45% | +0.63 |
| q0027 | choice | 1.58 | 50% | +0.27 | 0.99 | 55% | +0.72 | 0.97 | 60% | +0.73 | 1.19 | 60% | +0.76 | 0.97 | 60% | +0.49 |
| q0028 | slider | sd 27 | mean 48 | +0.51 | sd 19 | mean 50 | +0.54 | sd 25 | mean 68 | +0.83 | sd 31 | mean 62 | +0.97 | sd 35 | mean 42 | +0.69 |
| q0029 | choice | 1.44 | 55% | +0.16 | 1.68 | 50% | +0.40 | 1.22 | 55% | +0.53 | 1.23 | 50% | +0.41 | 1.97 | 30% | +0.52 |
| q0030 | choice | 1.68 | 50% | -0.10 | 1.85 | 40% | -0.13 | 1.60 | 55% | +0.13 | 1.79 | 35% | +0.26 | 1.60 | 45% | -0.08 |

Flagged for claude-cli:claude-haiku-5-5: q0001 (alignment -0.10), q0002 (top 75%), q0004 (alignment -0.21), q0005 (top 100%), q0010 (alignment -0.13), q0012 (top 85%), q0012 (alignment -0.02), q0015 (alignment -0.10), q0020 (alignment -0.11), q0021 (top 100%), q0021 (alignment -0.17), q0026 (alignment -0.04), q0030 (alignment -0.10)

Flagged for claude-cli:claude-sonnet-5-5: q0005 (top 75%), q0020 (top 85%), q0030 (alignment -0.13)

Flagged for openrouter:mistralai/mistral-medium-3-5: q0004 (top 90%)

Flagged for openrouter:nvidia/nemotron-3-ultra-550b-a55b:free: q0013 (top 80%), q0018 (alignment -0.13), q0025 (top 75%)

Flagged for openrouter:qwen/qwen3.8-27b: q0004 (alignment -0.03), q0005 (top 95%), q0012 (alignment -0.02), q0013 (top 85%), q0014 (top 85%), q0020 (top 90%), q0030 (alignment -0.08)

## Per persona

Mean alignment of each persona's answers. Low values mean the model did not play this persona's traits.

| Persona | Archetype | claude-cli:claude-haiku-5-5 | claude-cli:claude-sonnet-5-5 | openrouter:mistralai/mistral-medium-3-5 | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | openrouter:qwen/qwen3.8-27b |
| --- | --- | --- | --- | --- | --- | --- |
| p001 | sampled | -0.03 | +0.25 | +0.24 | +0.27 | +0.37 |
| p002 | sampled | +0.27 | +0.59 | +0.65 | +0.65 | +0.78 |
| p003 | sampled | +0.18 | +0.30 | +0.20 | +0.31 | +0.30 |
| p004 | sampled | +0.23 | +0.57 | +0.62 | +0.59 | +0.70 |
| p005 | sampled | -0.06 | +0.22 | +0.28 | +0.18 | +0.20 |
| p006 | sampled | +0.33 | +0.23 | +0.40 | +0.40 | +0.16 |
| p007 | sampled | +0.25 | +0.60 | +0.57 | +0.58 | +0.54 |
| p008 | sampled | +0.14 | +0.41 | +0.46 | +0.44 | +0.09 |
| p009 | sampled | +0.03 | +0.36 | +0.32 | +0.31 | +0.32 |
| p010 | sampled | +0.12 | +0.99 | +0.68 | +0.83 | +0.88 |
| p011 | sampled | +0.24 | +0.41 | +0.54 | +0.44 | +0.48 |
| p012 | sampled | -0.10 | +0.46 | +0.30 | +0.49 | +0.54 |
| p013 | sampled | +0.11 | +0.10 | +0.31 | +0.21 | +0.18 |
| p014 | sampled | +0.10 | +0.24 | +0.38 | +0.50 | +0.21 |
| p015 | sampled | +0.34 | +0.43 | +0.56 | +0.41 | +0.29 |
| p016 | sampled | +0.42 | +0.78 | +0.51 | +0.25 | +0.28 |
| p017 | sampled | +0.32 | -0.04 | +0.44 | +0.27 | -0.14 |
| p018 | dark-triad | +0.02 | +0.64 | +0.81 | +0.85 | +0.78 |
| p019 | hyper-utilitarian | +0.33 | +0.69 | +0.69 | +0.67 | +0.59 |
| p020 | purity-driven | +0.04 | +0.53 | +0.63 | +0.66 | +0.19 |

