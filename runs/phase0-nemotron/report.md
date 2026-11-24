# Phase 0 trial: personas × seed dilemmas

20 personas × 29 scorable items × 1 model(s) = 580 answers. Free-text items are not played. Targets stand in for questionnaire scores until those are in the harness.

## Valid answers

| Model | Answers | Invalid | Needed the strict retry | Input tokens / call |
| --- | --- | --- | --- | --- |
| openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 580 | 0 (0.0%) | 10 | n/a |

## Position bias

Share of choice and binary answers that picked the first option shown, against what a player ignoring position would give.

| Model | First-position picks | Expected by chance |
| --- | --- | --- |
| openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 27.8% | 31.9% |

## Do choices track the keyed traits?

Alignment is how much better the chosen option's keys fit the persona's targets than the average option (slider: how far the answer moves toward the persona's keyed side). It is 0 for a player who ignores the persona. The p-value comes from 2,000 shuffles of which persona gave which answers.

| Model | Mean alignment | Under shuffled personas | p |
| --- | --- | --- | --- |
| openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 0.466 | 0.017 | 0.0005 |

### Per trait

For each option or slider keyed to a trait: the correlation, across personas, between the persona's target on that trait (signed by the key's direction) and choosing that option (slider: the value). Mean over keyed options; with 20 personas a single correlation has a standard error of about 0.22, so read the means, not single items.

| Trait | Keyed options | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free mean r | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free share > 0 |
| --- | --- | --- | --- |
| care | 5 | +0.26 | 80% |
| equality | 4 | +0.01 | 50% |
| proportionality | 4 | -0.05 | 50% |
| loyalty | 6 | +0.33 | 83% |
| authority | 3 | +0.60 | 100% |
| purity | 4 | +0.60 | 100% |
| instrumental_harm | 5 | +0.33 | 80% |
| impartial_beneficence | 5 | +0.50 | 100% |
| machiavellianism | 6 | +0.54 | 100% |
| narcissism | 4 | +0.57 | 100% |
| psychopathy | 3 | +0.54 | 100% |
| honesty_humility | 8 | +0.40 | 88% |
| emotionality | 4 | +0.25 | 100% |
| extraversion | 5 | +0.23 | 100% |
| agreeableness | 5 | +0.32 | 80% |
| conscientiousness | 7 | +0.20 | 86% |
| openness | 3 | +0.23 | 100% |

### Against measured questionnaire scores

The same per-trait correlations, with each agent's label taken from its own questionnaire answers (z-scored within each model) instead of the target it was written with. This is how the spec labels agents. Only traits covered by the scales run so far appear.

| Trait | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free r vs targets | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free r vs measured |
| --- | --- | --- |
| care | +0.26 | +0.35 |
| equality | +0.01 | +0.07 |
| proportionality | -0.05 | -0.10 |
| loyalty | +0.33 | +0.31 |
| authority | +0.60 | +0.67 |
| purity | +0.60 | +0.62 |
| instrumental_harm | +0.33 | +0.35 |
| impartial_beneficence | +0.50 | +0.64 |

## Per item

Entropy in bits (maximum 2 for four options, 1 for two). Top share above 70% means the spec would drop the item. Alignment below 0 means the item's options did not track their keys for that model. Slider items show the standard deviation of answers instead of entropy.

| Item | Type | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free entropy | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free top share | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free alignment |
| --- | --- | --- | --- | --- |
| q0001 | choice | 1.79 | 35% | +0.47 |
| q0002 | binary | 0.97 | 60% | +0.58 |
| q0003 | slider | sd 36 | mean 53 | +0.81 |
| q0004 | choice | 1.16 | 70% | +0.19 |
| q0005 | binary | 0.93 | 65% | +0.56 |
| q0007 | choice | 1.68 | 55% | +0.55 |
| q0008 | choice | 1.90 | 30% | +0.59 |
| q0009 | choice | 1.49 | 50% | +0.56 |
| q0010 | slider | sd 26 | mean 72 | +0.30 |
| q0011 | choice | 1.52 | 40% | +0.28 |
| q0012 | choice | 1.44 | 55% | +0.27 |
| q0013 | binary | 0.72 | 80% | +0.35 |
| q0014 | choice | 1.60 | 55% | +0.39 |
| q0015 | binary | 0.97 | 60% | +0.72 |
| q0016 | choice | 1.48 | 65% | +0.62 |
| q0017 | slider | sd 27 | mean 64 | +0.50 |
| q0018 | choice | 1.64 | 55% | -0.13 |
| q0019 | choice | 1.24 | 65% | +0.83 |
| q0020 | binary | 0.88 | 70% | +0.50 |
| q0021 | choice | 1.23 | 50% | +0.39 |
| q0022 | slider | sd 33 | mean 28 | +0.05 |
| q0023 | slider | sd 44 | mean 50 | +0.48 |
| q0024 | choice | 1.81 | 45% | +0.42 |
| q0025 | binary | 0.81 | 75% | +0.45 |
| q0026 | choice | 1.24 | 65% | +0.39 |
| q0027 | choice | 1.19 | 60% | +0.76 |
| q0028 | slider | sd 31 | mean 62 | +0.97 |
| q0029 | choice | 1.23 | 50% | +0.41 |
| q0030 | choice | 1.79 | 35% | +0.26 |

Flagged for openrouter:nvidia/nemotron-3-ultra-550b-a55b:free: q0013 (top 80%), q0018 (alignment -0.13), q0025 (top 75%)

## Per persona

Mean alignment of each persona's answers. Low values mean the model did not play this persona's traits.

| Persona | Archetype | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free |
| --- | --- | --- |
| p001 | sampled | +0.27 |
| p002 | sampled | +0.65 |
| p003 | sampled | +0.31 |
| p004 | sampled | +0.59 |
| p005 | sampled | +0.18 |
| p006 | sampled | +0.40 |
| p007 | sampled | +0.58 |
| p008 | sampled | +0.44 |
| p009 | sampled | +0.31 |
| p010 | sampled | +0.83 |
| p011 | sampled | +0.44 |
| p012 | sampled | +0.49 |
| p013 | sampled | +0.21 |
| p014 | sampled | +0.50 |
| p015 | sampled | +0.41 |
| p016 | sampled | +0.25 |
| p017 | sampled | +0.27 |
| p018 | dark-triad | +0.85 |
| p019 | hyper-utilitarian | +0.67 |
| p020 | purity-driven | +0.66 |

