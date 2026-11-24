# Persona fidelity: target traits vs measured questionnaire scores

20 personas answered 45 questionnaire items (mfq2, ous) on 1 model(s). Fidelity is the correlation, across personas, between the trait a persona was written to have and the score it got on the scale. The spec's Phase 0 gate asks for r > 0.3.

| Model | Answers | Invalid |
| --- | --- | --- |
| openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 900 | 0 (0.0%) |

| Trait | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free r | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free mean (sd) |
| --- | --- | --- |
| care | +0.76 | 3.13 (1.44) |
| equality | +0.66 | 2.47 (1.25) |
| proportionality | +0.87 | 3.45 (1.02) |
| loyalty | +0.68 | 2.83 (0.91) |
| authority | +0.83 | 2.88 (0.98) |
| purity | +0.68 | 2.02 (0.74) |
| impartial_beneficence | +0.81 | 3.16 (1.82) |
| instrumental_harm | +0.73 | 3.15 (2.41) |

Raw scores per persona (scale units; MFQ-2 runs 1 to 5, OUS 1 to 7):

| Persona | Archetype | Model | care | equality | proportionality | loyalty | authority | purity | impartial_beneficence | instrumental_harm |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| p001 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 2.00 | 3.00 | 2.00 | 3.50 | 4.00 | 2.67 | 2.00 | 3.75 |
| p002 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 4.83 | 2.17 | 3.17 | 2.83 | 2.50 | 1.83 | 4.20 | 5.50 |
| p003 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 2.00 | 2.67 | 3.17 | 3.17 | 3.33 | 3.00 | 2.00 | 1.25 |
| p004 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 5.00 | 3.17 | 4.33 | 3.50 | 3.33 | 2.67 | 6.60 | 1.00 |
| p005 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 1.50 | 2.67 | 2.17 | 2.83 | 3.50 | 1.50 | 2.80 | 6.25 |
| p006 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 1.67 | 1.17 | 4.33 | 2.00 | 3.50 | 1.33 | 1.20 | 1.00 |
| p007 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 5.00 | 2.17 | 4.83 | 3.33 | 2.33 | 1.67 | 6.00 | 1.00 |
| p008 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 2.00 | 4.67 | 2.17 | 1.33 | 2.33 | 2.17 | 3.60 | 6.75 |
| p009 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 4.83 | 4.67 | 2.00 | 2.33 | 2.33 | 1.67 | 4.40 | 2.75 |
| p010 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 1.33 | 1.00 | 1.83 | 1.83 | 1.50 | 1.33 | 1.00 | 6.75 |
| p011 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 3.00 | 3.67 | 2.50 | 3.83 | 2.17 | 1.50 | 1.80 | 6.00 |
| p012 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 5.00 | 1.00 | 4.67 | 3.17 | 3.33 | 3.00 | 5.00 | 1.00 |
| p013 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 2.50 | 3.67 | 3.17 | 4.00 | 4.33 | 2.83 | 2.40 | 2.00 |
| p014 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 1.83 | 1.00 | 4.00 | 2.50 | 2.50 | 2.00 | 1.20 | 1.25 |
| p015 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 3.50 | 4.00 | 4.67 | 3.83 | 4.33 | 1.67 | 2.60 | 1.00 |
| p016 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 2.00 | 1.17 | 4.83 | 2.83 | 2.67 | 1.50 | 1.20 | 1.00 |
| p017 | sampled | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 4.50 | 1.17 | 4.17 | 2.33 | 1.33 | 2.17 | 4.60 | 1.00 |
| p018 | dark-triad | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 1.17 | 1.00 | 3.83 | 1.50 | 2.50 | 1.00 | 1.00 | 6.50 |
| p019 | hyper-utilitarian | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 5.00 | 3.50 | 3.17 | 1.33 | 1.17 | 1.00 | 6.60 | 6.25 |
| p020 | purity-driven | openrouter:nvidia/nemotron-3-ultra-550b-a55b:free | 4.00 | 1.83 | 4.00 | 4.67 | 4.67 | 3.83 | 3.00 | 1.00 |

