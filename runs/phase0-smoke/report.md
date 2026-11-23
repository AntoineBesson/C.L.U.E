# Phase 0 trial: personas × seed dilemmas

20 personas × 29 scorable items × 2 model(s) = 1160 answers. Free-text items are not played. Targets stand in for questionnaire scores until those are in the harness.

## Valid answers

| Model | Answers | Invalid | Needed the strict retry | Input tokens / call |
| --- | --- | --- | --- | --- |
| claude-cli:claude-haiku-5-5 | 580 | 0 (0.0%) | 0 | 2858 |
| claude-cli:claude-sonnet-5-5 | 580 | 0 (0.0%) | 0 | 2838 |

## Position bias

Share of choice and binary answers that picked the first option shown, against what a player ignoring position would give.

| Model | First-position picks | Expected by chance |
| --- | --- | --- |
| claude-cli:claude-haiku-5-5 | 14.3% | 31.9% |
| claude-cli:claude-sonnet-5-5 | 33.7% | 31.9% |

## Do choices track the keyed traits?

Alignment is how much better the chosen option's keys fit the persona's targets than the average option (slider: how far the answer moves toward the persona's keyed side). It is 0 for a player who ignores the persona. The p-value comes from 2,000 shuffles of which persona gave which answers.

| Model | Mean alignment | Under shuffled personas | p |
| --- | --- | --- | --- |
| claude-cli:claude-haiku-5-5 | 0.140 | -0.025 | 0.0005 |
| claude-cli:claude-sonnet-5-5 | 0.433 | -0.006 | 0.0005 |

### Per trait

For each option or slider keyed to a trait: the correlation, across personas, between the persona's target on that trait (signed by the key's direction) and choosing that option (slider: the value). Mean over keyed options; with 20 personas a single correlation has a standard error of about 0.22, so read the means, not single items.

| Trait | Keyed options | claude-cli:claude-haiku-5-5 mean r | claude-cli:claude-haiku-5-5 share > 0 | claude-cli:claude-sonnet-5-5 mean r | claude-cli:claude-sonnet-5-5 share > 0 |
| --- | --- | --- | --- | --- | --- |
| care | 5 | +0.09 | 60% | +0.53 | 100% |
| equality | 5 | +0.12 | 60% | +0.20 | 100% |
| proportionality | 4 | +0.00 | 50% | +0.13 | 75% |
| loyalty | 5 | +0.23 | 100% | +0.35 | 80% |
| authority | 3 | +0.08 | 33% | +0.29 | 100% |
| purity | 4 | +0.33 | 100% | +0.55 | 100% |
| instrumental_harm | 5 | +0.21 | 80% | +0.59 | 100% |
| impartial_beneficence | 5 | +0.15 | 50% | +0.55 | 100% |
| machiavellianism | 6 | +0.18 | 75% | +0.55 | 100% |
| narcissism | 5 | +0.21 | 80% | +0.40 | 100% |
| psychopathy | 2 | +0.09 | 50% | +0.35 | 100% |
| honesty_humility | 9 | +0.21 | 89% | +0.31 | 100% |
| emotionality | 3 | +0.08 | 67% | +0.14 | 100% |
| extraversion | 5 | +0.10 | 75% | +0.10 | 60% |
| agreeableness | 6 | +0.11 | 83% | +0.38 | 83% |
| conscientiousness | 7 | -0.13 | 29% | +0.31 | 83% |
| openness | 3 | +0.14 | 67% | +0.47 | 100% |

## Per item

Entropy in bits (maximum 2 for four options, 1 for two). Top share above 70% means the spec would drop the item. Alignment below 0 means the item's options did not track their keys for that model. Slider items show the standard deviation of answers instead of entropy.

| Item | Type | claude-cli:claude-haiku-5-5 entropy | claude-cli:claude-haiku-5-5 top share | claude-cli:claude-haiku-5-5 alignment | claude-cli:claude-sonnet-5-5 entropy | claude-cli:claude-sonnet-5-5 top share | claude-cli:claude-sonnet-5-5 alignment |
| --- | --- | --- | --- | --- | --- | --- | --- |
| q0001 | choice | 1.24 | 65% | -0.30 | 1.76 | 50% | +0.39 |
| q0002 | binary | 0.61 | 85% | +0.07 | 0.88 | 70% | +0.24 |
| q0003 | slider | sd 25 | mean 48 | +0.37 | sd 21 | mean 57 | +0.46 |
| q0004 | choice | 0.99 | 75% | +0.08 | 1.34 | 55% | +0.43 |
| q0005 | binary | 0.29 | 95% | +0.10 | 0.88 | 70% | +0.52 |
| q0007 | choice | 1.28 | 65% | -0.08 | 1.46 | 45% | +0.55 |
| q0008 | choice | 1.22 | 55% | +0.20 | 0.47 | 90% | +0.15 |
| q0009 | choice | 1.34 | 55% | +0.04 | 1.94 | 35% | +0.65 |
| q0010 | slider | sd 23 | mean 55 | +0.21 | sd 20 | mean 59 | +0.34 |
| q0011 | choice | 1.53 | 60% | -0.06 | 0.99 | 75% | +0.21 |
| q0012 | choice | 0.92 | 80% | +0.34 | 0.75 | 85% | +0.14 |
| q0013 | binary | 0.99 | 55% | +0.02 | 0.88 | 70% | +0.43 |
| q0014 | choice | 1.68 | 50% | +0.34 | 1.44 | 65% | +0.63 |
| q0015 | binary | 0.99 | 55% | +0.33 | 0.93 | 65% | +0.62 |
| q0016 | choice | 1.54 | 45% | +0.44 | 1.19 | 60% | +0.46 |
| q0017 | slider | sd 21 | mean 41 | +0.18 | sd 21 | mean 69 | +0.39 |
| q0018 | choice | 1.85 | 40% | +0.06 | 0.75 | 85% | +0.19 |
| q0019 | choice | 1.44 | 65% | +0.68 | 1.74 | 40% | +0.88 |
| q0020 | binary | 0.72 | 80% | +0.02 | 0.93 | 65% | +0.75 |
| q0021 | choice | 0.47 | 90% | -0.16 | 0.99 | 75% | +0.39 |
| q0022 | slider | sd 23 | mean 28 | -0.05 | sd 17 | mean 27 | +0.05 |
| q0023 | slider | sd 31 | mean 59 | +0.53 | sd 21 | mean 64 | +0.37 |
| q0024 | choice | 1.22 | 55% | -0.09 | 1.76 | 50% | +0.82 |
| q0025 | binary | 0.81 | 75% | +0.06 | 0.99 | 55% | +0.74 |
| q0026 | choice | 1.22 | 55% | +0.24 | 1.19 | 60% | +0.43 |
| q0027 | choice | 1.05 | 75% | -0.11 | 0.81 | 75% | +0.27 |
| q0028 | slider | sd 28 | mean 50 | +0.54 | sd 17 | mean 45 | +0.33 |
| q0029 | choice | 1.58 | 50% | +0.15 | 1.54 | 55% | +0.40 |
| q0030 | choice | 1.44 | 55% | -0.10 | 1.35 | 60% | +0.36 |

Flagged for claude-cli:claude-haiku-5-5: q0001 (alignment -0.30), q0002 (top 85%), q0004 (top 75%), q0005 (top 95%), q0007 (alignment -0.08), q0011 (alignment -0.06), q0012 (top 80%), q0020 (top 80%), q0021 (top 90%), q0021 (alignment -0.16), q0022 (alignment -0.05), q0024 (alignment -0.09), q0025 (top 75%), q0027 (top 75%), q0027 (alignment -0.11), q0030 (alignment -0.10)

Flagged for claude-cli:claude-sonnet-5-5: q0008 (top 90%), q0011 (top 75%), q0012 (top 85%), q0018 (top 85%), q0021 (top 75%), q0027 (top 75%)

## Per persona

Mean alignment of each persona's answers. Low values mean the model did not play this persona's traits.

| Persona | Archetype | claude-cli:claude-haiku-5-5 | claude-cli:claude-sonnet-5-5 |
| --- | --- | --- | --- |
| p001 | sampled | +0.13 | +0.40 |
| p002 | sampled | +0.17 | +0.34 |
| p003 | sampled | +0.24 | +0.36 |
| p004 | sampled | +0.16 | +0.54 |
| p005 | sampled | +0.22 | +0.38 |
| p006 | sampled | +0.53 | +0.51 |
| p007 | sampled | +0.01 | +0.52 |
| p008 | sampled | +0.01 | +0.34 |
| p009 | sampled | +0.19 | +0.61 |
| p010 | sampled | +0.02 | +0.42 |
| p011 | sampled | -0.16 | +0.18 |
| p012 | sampled | +0.27 | +0.55 |
| p013 | sampled | +0.05 | +0.22 |
| p014 | sampled | -0.23 | +0.24 |
| p015 | sampled | +0.10 | +0.77 |
| p016 | sampled | +0.44 | +0.51 |
| p017 | sampled | +0.15 | +0.26 |
| p018 | dark-triad | -0.14 | +0.59 |
| p019 | hyper-utilitarian | +0.31 | +0.54 |
| p020 | purity-driven | +0.32 | +0.40 |

