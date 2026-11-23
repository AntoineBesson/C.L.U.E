# Persona fidelity: target traits vs measured questionnaire scores

20 personas answered 45 questionnaire items (mfq2, ous) on 2 model(s). Fidelity is the correlation, across personas, between the trait a persona was written to have and the score it got on the scale. The spec's Phase 0 gate asks for r > 0.3.

| Model | Answers | Invalid |
| --- | --- | --- |
| claude-cli:claude-haiku-5-5 | 900 | 0 (0.0%) |
| claude-cli:claude-sonnet-5-5 | 900 | 0 (0.0%) |

| Trait | claude-cli:claude-haiku-5-5 r | claude-cli:claude-haiku-5-5 mean (sd) | claude-cli:claude-sonnet-5-5 r | claude-cli:claude-sonnet-5-5 mean (sd) |
| --- | --- | --- | --- | --- |
| care | +0.40 | 3.89 (0.44) | +0.85 | 3.28 (1.09) |
| equality | +0.07 | 3.29 (0.51) | +0.76 | 2.29 (0.99) |
| proportionality | +0.47 | 3.64 (0.54) | +0.81 | 3.57 (0.94) |
| loyalty | +0.36 | 3.52 (0.34) | +0.76 | 2.95 (0.72) |
| authority | +0.22 | 3.38 (0.21) | +0.82 | 2.88 (0.66) |
| purity | +0.51 | 2.88 (0.34) | +0.66 | 1.89 (0.59) |
| impartial_beneficence | +0.77 | 4.00 (1.12) | +0.74 | 3.37 (1.42) |
| instrumental_harm | +0.35 | 3.71 (1.04) | +0.81 | 3.55 (1.55) |

Raw scores per persona (scale units; MFQ-2 runs 1 to 5, OUS 1 to 7):

| Persona | Archetype | Model | care | equality | proportionality | loyalty | authority | purity | impartial_beneficence | instrumental_harm |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| p001 | sampled | claude-cli:claude-haiku-5-5 | 4.50 | 3.50 | 3.50 | 3.50 | 3.50 | 3.00 | 3.60 | 4.50 |
| p001 | sampled | claude-cli:claude-sonnet-5-5 | 2.17 | 2.33 | 2.17 | 3.83 | 3.33 | 2.17 | 2.40 | 4.50 |
| p002 | sampled | claude-cli:claude-haiku-5-5 | 4.17 | 3.33 | 2.83 | 3.83 | 3.33 | 2.67 | 4.80 | 3.75 |
| p002 | sampled | claude-cli:claude-sonnet-5-5 | 4.17 | 2.00 | 2.50 | 2.67 | 2.67 | 1.50 | 4.80 | 5.25 |
| p003 | sampled | claude-cli:claude-haiku-5-5 | 3.83 | 2.83 | 3.67 | 3.67 | 3.50 | 2.83 | 2.40 | 3.00 |
| p003 | sampled | claude-cli:claude-sonnet-5-5 | 3.00 | 2.67 | 3.67 | 3.33 | 3.33 | 2.83 | 2.00 | 3.00 |
| p004 | sampled | claude-cli:claude-haiku-5-5 | 4.00 | 3.17 | 4.33 | 2.67 | 3.50 | 3.00 | 5.40 | 2.50 |
| p004 | sampled | claude-cli:claude-sonnet-5-5 | 4.83 | 2.00 | 4.17 | 2.83 | 2.67 | 2.17 | 5.20 | 2.25 |
| p005 | sampled | claude-cli:claude-haiku-5-5 | 3.33 | 3.00 | 3.83 | 3.67 | 3.83 | 2.83 | 3.80 | 4.00 |
| p005 | sampled | claude-cli:claude-sonnet-5-5 | 2.00 | 2.00 | 3.17 | 3.67 | 4.00 | 1.83 | 3.00 | 5.75 |
| p006 | sampled | claude-cli:claude-haiku-5-5 | 3.17 | 1.67 | 4.17 | 3.50 | 3.17 | 2.83 | 2.80 | 3.50 |
| p006 | sampled | claude-cli:claude-sonnet-5-5 | 1.67 | 1.33 | 4.17 | 2.67 | 2.83 | 1.50 | 1.80 | 1.75 |
| p007 | sampled | claude-cli:claude-haiku-5-5 | 4.00 | 3.33 | 3.67 | 4.00 | 3.83 | 3.17 | 5.00 | 2.50 |
| p007 | sampled | claude-cli:claude-sonnet-5-5 | 5.00 | 1.83 | 4.83 | 2.83 | 2.50 | 1.67 | 5.40 | 3.00 |
| p008 | sampled | claude-cli:claude-haiku-5-5 | 3.50 | 3.67 | 2.67 | 3.83 | 3.00 | 3.17 | 5.40 | 4.25 |
| p008 | sampled | claude-cli:claude-sonnet-5-5 | 3.50 | 4.50 | 2.00 | 2.00 | 2.33 | 1.50 | 4.60 | 5.00 |
| p009 | sampled | claude-cli:claude-haiku-5-5 | 3.83 | 3.33 | 2.33 | 3.17 | 3.50 | 3.00 | 5.00 | 1.00 |
| p009 | sampled | claude-cli:claude-sonnet-5-5 | 4.00 | 4.17 | 1.83 | 1.83 | 2.17 | 1.17 | 4.80 | 4.25 |
| p010 | sampled | claude-cli:claude-haiku-5-5 | 3.83 | 3.33 | 3.50 | 3.00 | 3.33 | 2.33 | 3.20 | 5.00 |
| p010 | sampled | claude-cli:claude-sonnet-5-5 | 1.50 | 2.00 | 2.17 | 2.00 | 2.00 | 1.17 | 2.20 | 5.50 |
| p011 | sampled | claude-cli:claude-haiku-5-5 | 4.17 | 3.00 | 4.17 | 3.17 | 3.33 | 2.67 | 4.80 | 5.00 |
| p011 | sampled | claude-cli:claude-sonnet-5-5 | 3.83 | 2.83 | 4.00 | 3.67 | 2.50 | 1.67 | 4.60 | 5.25 |
| p012 | sampled | claude-cli:claude-haiku-5-5 | 4.67 | 3.67 | 4.17 | 3.33 | 3.00 | 3.33 | 4.80 | 3.00 |
| p012 | sampled | claude-cli:claude-sonnet-5-5 | 4.00 | 1.17 | 4.50 | 2.67 | 3.00 | 1.83 | 4.00 | 2.50 |
| p013 | sampled | claude-cli:claude-haiku-5-5 | 4.33 | 4.00 | 3.83 | 3.67 | 3.33 | 2.83 | 3.20 | 3.50 |
| p013 | sampled | claude-cli:claude-sonnet-5-5 | 3.00 | 3.00 | 3.17 | 3.67 | 3.83 | 2.33 | 2.20 | 3.00 |
| p014 | sampled | claude-cli:claude-haiku-5-5 | 3.50 | 3.83 | 3.50 | 3.67 | 3.33 | 2.50 | 2.20 | 4.25 |
| p014 | sampled | claude-cli:claude-sonnet-5-5 | 3.17 | 1.17 | 4.00 | 3.00 | 3.17 | 1.83 | 2.00 | 2.25 |
| p015 | sampled | claude-cli:claude-haiku-5-5 | 3.67 | 3.17 | 4.50 | 3.83 | 3.50 | 3.17 | 3.40 | 3.75 |
| p015 | sampled | claude-cli:claude-sonnet-5-5 | 3.50 | 4.17 | 4.50 | 4.00 | 4.00 | 2.50 | 2.60 | 2.00 |
| p016 | sampled | claude-cli:claude-haiku-5-5 | 3.00 | 2.83 | 3.50 | 3.67 | 3.17 | 2.00 | 2.40 | 2.50 |
| p016 | sampled | claude-cli:claude-sonnet-5-5 | 2.00 | 1.17 | 4.83 | 3.17 | 2.67 | 2.00 | 1.80 | 1.50 |
| p017 | sampled | claude-cli:claude-haiku-5-5 | 4.50 | 3.00 | 4.17 | 3.67 | 3.33 | 3.00 | 4.20 | 4.00 |
| p017 | sampled | claude-cli:claude-sonnet-5-5 | 4.00 | 1.83 | 4.00 | 3.00 | 2.50 | 1.83 | 3.80 | 1.75 |
| p018 | dark-triad | claude-cli:claude-haiku-5-5 | 3.67 | 3.67 | 3.67 | 3.50 | 3.50 | 3.17 | 4.60 | 5.00 |
| p018 | dark-triad | claude-cli:claude-sonnet-5-5 | 1.67 | 1.17 | 3.83 | 2.17 | 2.17 | 1.17 | 1.80 | 5.25 |
| p019 | hyper-utilitarian | claude-cli:claude-haiku-5-5 | 4.17 | 4.00 | 3.33 | 3.17 | 3.33 | 2.67 | 6.00 | 5.25 |
| p019 | hyper-utilitarian | claude-cli:claude-sonnet-5-5 | 4.67 | 2.50 | 3.67 | 1.83 | 2.00 | 1.50 | 6.20 | 5.75 |
| p020 | purity-driven | claude-cli:claude-haiku-5-5 | 4.00 | 3.50 | 3.50 | 4.00 | 3.33 | 3.50 | 3.00 | 4.00 |
| p020 | purity-driven | claude-cli:claude-sonnet-5-5 | 4.00 | 2.00 | 4.17 | 4.17 | 4.00 | 3.67 | 2.20 | 1.50 |

