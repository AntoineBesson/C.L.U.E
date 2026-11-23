# Phase 0 trial: personas × seed dilemmas

20 personas × 29 scorable items × 2 model(s) = 1160 answers. Free-text items are not played. Targets stand in for questionnaire scores until those are in the harness.

## Valid answers

| Model | Answers | Invalid | Needed the strict retry | Input tokens / call |
| --- | --- | --- | --- | --- |
| claude-cli:claude-haiku-5-5 | 580 | 0 (0.0%) | 0 | 2828 |
| claude-cli:claude-sonnet-5-5 | 580 | 0 (0.0%) | 0 | 2808 |

## Position bias

Share of choice and binary answers that picked the first option shown, against what a player ignoring position would give.

| Model | First-position picks | Expected by chance |
| --- | --- | --- |
| claude-cli:claude-haiku-5-5 | 14.8% | 31.9% |
| claude-cli:claude-sonnet-5-5 | 32.0% | 31.9% |

## Do choices track the keyed traits?

Alignment is how much better the chosen option's keys fit the persona's targets than the average option (slider: how far the answer moves toward the persona's keyed side). It is 0 for a player who ignores the persona. The p-value comes from 2,000 shuffles of which persona gave which answers.

| Model | Mean alignment | Under shuffled personas | p |
| --- | --- | --- | --- |
| claude-cli:claude-haiku-5-5 | 0.164 | -0.017 | 0.0005 |
| claude-cli:claude-sonnet-5-5 | 0.438 | -0.001 | 0.0005 |

### Per trait

For each option or slider keyed to a trait: the correlation, across personas, between the persona's target on that trait (signed by the key's direction) and choosing that option (slider: the value). Mean over keyed options; with 20 personas a single correlation has a standard error of about 0.22, so read the means, not single items.

| Trait | Keyed options | claude-cli:claude-haiku-5-5 mean r | claude-cli:claude-haiku-5-5 share > 0 | claude-cli:claude-sonnet-5-5 mean r | claude-cli:claude-sonnet-5-5 share > 0 |
| --- | --- | --- | --- | --- | --- |
| care | 5 | +0.16 | 100% | +0.31 | 80% |
| equality | 5 | -0.01 | 60% | +0.14 | 60% |
| proportionality | 4 | +0.15 | 50% | +0.22 | 100% |
| loyalty | 6 | +0.03 | 40% | +0.31 | 83% |
| authority | 3 | +0.31 | 100% | +0.60 | 100% |
| purity | 4 | -0.03 | 25% | +0.36 | 100% |
| instrumental_harm | 5 | +0.42 | 100% | +0.54 | 100% |
| impartial_beneficence | 5 | +0.30 | 100% | +0.57 | 100% |
| machiavellianism | 6 | +0.12 | 40% | +0.56 | 100% |
| narcissism | 5 | +0.24 | 80% | +0.47 | 100% |
| psychopathy | 3 | -0.05 | 67% | +0.45 | 100% |
| honesty_humility | 9 | +0.26 | 75% | +0.31 | 78% |
| emotionality | 4 | +0.15 | 75% | +0.36 | 100% |
| extraversion | 5 | +0.07 | 75% | +0.34 | 80% |
| agreeableness | 5 | +0.08 | 75% | +0.29 | 60% |
| conscientiousness | 7 | +0.14 | 71% | +0.23 | 83% |
| openness | 3 | +0.08 | 67% | +0.20 | 67% |

## Per item

Entropy in bits (maximum 2 for four options, 1 for two). Top share above 70% means the spec would drop the item. Alignment below 0 means the item's options did not track their keys for that model. Slider items show the standard deviation of answers instead of entropy.

| Item | Type | claude-cli:claude-haiku-5-5 entropy | claude-cli:claude-haiku-5-5 top share | claude-cli:claude-haiku-5-5 alignment | claude-cli:claude-sonnet-5-5 entropy | claude-cli:claude-sonnet-5-5 top share | claude-cli:claude-sonnet-5-5 alignment |
| --- | --- | --- | --- | --- | --- | --- | --- |
| q0001 | choice | 1.16 | 70% | -0.10 | 1.79 | 50% | +0.38 |
| q0002 | binary | 0.81 | 75% | +0.33 | 0.99 | 55% | +0.49 |
| q0003 | slider | sd 25 | mean 51 | +0.39 | sd 22 | mean 63 | +0.47 |
| q0004 | choice | 0.99 | 55% | -0.21 | 1.46 | 45% | +0.36 |
| q0005 | binary | -0.00 | 100% | +0.00 | 0.81 | 75% | +0.52 |
| q0007 | choice | 1.30 | 60% | +0.14 | 1.60 | 55% | +0.62 |
| q0008 | choice | 1.34 | 55% | +0.26 | 1.28 | 65% | +0.47 |
| q0009 | choice | 1.46 | 50% | +0.07 | 1.72 | 45% | +0.51 |
| q0010 | slider | sd 25 | mean 60 | -0.13 | sd 20 | mean 67 | +0.21 |
| q0011 | choice | 1.44 | 50% | +0.13 | 1.14 | 65% | +0.39 |
| q0012 | choice | 0.75 | 85% | -0.02 | 1.16 | 70% | +0.28 |
| q0013 | binary | 0.88 | 70% | +0.45 | 0.93 | 65% | +0.48 |
| q0014 | choice | 1.79 | 35% | +0.21 | 1.93 | 35% | +0.63 |
| q0015 | binary | 0.99 | 55% | -0.10 | 0.97 | 60% | +0.81 |
| q0016 | choice | 1.99 | 30% | +0.45 | 1.71 | 45% | +0.53 |
| q0017 | slider | sd 23 | mean 35 | +0.25 | sd 21 | mean 63 | +0.23 |
| q0018 | choice | 1.88 | 35% | +0.31 | 1.34 | 55% | +0.06 |
| q0019 | choice | 1.23 | 50% | +0.41 | 1.32 | 70% | +0.59 |
| q0020 | binary | 0.88 | 70% | -0.11 | 0.61 | 85% | +0.33 |
| q0021 | choice | -0.00 | 100% | -0.17 | 1.14 | 65% | +0.42 |
| q0022 | slider | sd 28 | mean 35 | +0.13 | sd 18 | mean 34 | +0.13 |
| q0023 | slider | sd 38 | mean 54 | +1.02 | sd 24 | mean 62 | +0.68 |
| q0024 | choice | 1.46 | 50% | +0.24 | 1.93 | 35% | +0.73 |
| q0025 | binary | 0.88 | 70% | +0.03 | 0.93 | 65% | +0.52 |
| q0026 | choice | 1.85 | 40% | -0.04 | 1.40 | 60% | +0.34 |
| q0027 | choice | 1.58 | 50% | +0.27 | 0.99 | 55% | +0.72 |
| q0028 | slider | sd 27 | mean 48 | +0.51 | sd 19 | mean 50 | +0.54 |
| q0029 | choice | 1.44 | 55% | +0.16 | 1.68 | 50% | +0.40 |
| q0030 | choice | 1.68 | 50% | -0.10 | 1.85 | 40% | -0.13 |

Flagged for claude-cli:claude-haiku-5-5: q0001 (alignment -0.10), q0002 (top 75%), q0004 (alignment -0.21), q0005 (top 100%), q0010 (alignment -0.13), q0012 (top 85%), q0012 (alignment -0.02), q0015 (alignment -0.10), q0020 (alignment -0.11), q0021 (top 100%), q0021 (alignment -0.17), q0026 (alignment -0.04), q0030 (alignment -0.10)

Flagged for claude-cli:claude-sonnet-5-5: q0005 (top 75%), q0020 (top 85%), q0030 (alignment -0.13)

## Per persona

Mean alignment of each persona's answers. Low values mean the model did not play this persona's traits.

| Persona | Archetype | claude-cli:claude-haiku-5-5 | claude-cli:claude-sonnet-5-5 |
| --- | --- | --- | --- |
| p001 | sampled | -0.03 | +0.25 |
| p002 | sampled | +0.27 | +0.59 |
| p003 | sampled | +0.18 | +0.30 |
| p004 | sampled | +0.23 | +0.57 |
| p005 | sampled | -0.06 | +0.22 |
| p006 | sampled | +0.33 | +0.23 |
| p007 | sampled | +0.25 | +0.60 |
| p008 | sampled | +0.14 | +0.41 |
| p009 | sampled | +0.03 | +0.36 |
| p010 | sampled | +0.12 | +0.99 |
| p011 | sampled | +0.24 | +0.41 |
| p012 | sampled | -0.10 | +0.46 |
| p013 | sampled | +0.11 | +0.10 |
| p014 | sampled | +0.10 | +0.24 |
| p015 | sampled | +0.34 | +0.43 |
| p016 | sampled | +0.42 | +0.78 |
| p017 | sampled | +0.32 | -0.04 |
| p018 | dark-triad | +0.02 | +0.64 |
| p019 | hyper-utilitarian | +0.33 | +0.69 |
| p020 | purity-driven | +0.04 | +0.53 |

