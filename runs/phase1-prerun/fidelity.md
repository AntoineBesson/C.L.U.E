# Persona fidelity: target traits vs measured questionnaire scores

50 personas answered 45 questionnaire items (mfq2, ous) on 2 model(s). Fidelity is the correlation, across personas, between the trait a persona was written to have and the score it got on the scale. The spec's Phase 0 gate asks for r > 0.3.

| Model | Answers | Invalid |
| --- | --- | --- |
| openrouter:mistralai/mistral-medium-3-5 | 2250 | 0 (0.0%) |
| openrouter:qwen/qwen3.8-27b | 2250 | 0 (0.0%) |

| Trait | openrouter:mistralai/mistral-medium-3-5 r | openrouter:mistralai/mistral-medium-3-5 mean (sd) | openrouter:qwen/qwen3.8-27b r | openrouter:qwen/qwen3.8-27b mean (sd) |
| --- | --- | --- | --- | --- |
| care | +0.83 | 3.67 (1.45) | +0.84 | 3.82 (1.44) |
| equality | +0.86 | 2.53 (1.36) | +0.83 | 2.18 (1.22) |
| proportionality | +0.74 | 4.03 (0.96) | +0.69 | 3.57 (1.05) |
| loyalty | +0.80 | 2.87 (1.00) | +0.59 | 3.02 (0.92) |
| authority | +0.89 | 3.06 (1.02) | +0.78 | 2.95 (1.00) |
| purity | +0.80 | 2.29 (0.95) | +0.76 | 1.95 (0.92) |
| impartial_beneficence | +0.77 | 3.82 (1.87) | +0.82 | 3.12 (1.59) |
| instrumental_harm | +0.77 | 3.21 (2.29) | +0.77 | 3.08 (2.13) |

Raw scores per persona (scale units; MFQ-2 runs 1 to 5, OUS 1 to 7):

| Persona | Archetype | Model | care | equality | proportionality | loyalty | authority | purity | impartial_beneficence | instrumental_harm |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| p101 | sampled | openrouter:mistralai/mistral-medium-3-5 | 3.00 | 2.17 | 3.83 | 2.33 | 3.33 | 2.33 | 2.20 | 1.00 |
| p101 | sampled | openrouter:qwen/qwen3.8-27b | 3.17 | 1.67 | 3.83 | 2.33 | 3.33 | 1.67 | 1.20 | 1.75 |
| p102 | sampled | openrouter:mistralai/mistral-medium-3-5 | 4.83 | 2.33 | 4.00 | 3.67 | 3.50 | 3.50 | 3.60 | 1.00 |
| p102 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 1.33 | 3.50 | 4.00 | 3.17 | 2.83 | 3.80 | 1.00 |
| p103 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 4.83 | 2.33 | 3.33 | 4.33 | 3.83 | 7.00 | 2.75 |
| p103 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 4.67 | 1.33 | 4.17 | 4.17 | 3.83 | 5.60 | 2.25 |
| p104 | sampled | openrouter:mistralai/mistral-medium-3-5 | 1.33 | 1.00 | 4.33 | 1.67 | 2.50 | 1.67 | 1.20 | 1.00 |
| p104 | sampled | openrouter:qwen/qwen3.8-27b | 1.50 | 1.00 | 4.00 | 2.17 | 2.50 | 1.00 | 1.20 | 1.00 |
| p105 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 2.67 | 5.00 | 3.17 | 1.83 | 1.17 | 6.00 | 1.25 |
| p105 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 1.67 | 4.83 | 2.17 | 1.50 | 1.17 | 4.00 | 1.25 |
| p106 | sampled | openrouter:mistralai/mistral-medium-3-5 | 3.00 | 1.17 | 4.83 | 3.67 | 4.17 | 3.50 | 3.00 | 1.75 |
| p106 | sampled | openrouter:qwen/qwen3.8-27b | 3.17 | 1.00 | 4.33 | 4.00 | 4.17 | 3.00 | 1.80 | 2.75 |
| p107 | sampled | openrouter:mistralai/mistral-medium-3-5 | 4.67 | 4.00 | 5.00 | 3.17 | 3.67 | 2.00 | 4.20 | 5.50 |
| p107 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 3.17 | 4.50 | 3.67 | 3.67 | 1.67 | 4.40 | 6.25 |
| p108 | sampled | openrouter:mistralai/mistral-medium-3-5 | 2.17 | 1.00 | 4.33 | 2.83 | 2.17 | 1.50 | 5.20 | 6.00 |
| p108 | sampled | openrouter:qwen/qwen3.8-27b | 1.33 | 1.00 | 4.00 | 2.00 | 2.00 | 1.17 | 4.00 | 4.25 |
| p109 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 2.50 | 4.00 | 3.50 | 3.83 | 2.17 | 3.60 | 1.25 |
| p109 | sampled | openrouter:qwen/qwen3.8-27b | 4.83 | 1.83 | 3.67 | 3.50 | 3.17 | 1.50 | 3.20 | 1.25 |
| p110 | sampled | openrouter:mistralai/mistral-medium-3-5 | 1.00 | 1.00 | 4.17 | 1.17 | 1.67 | 1.17 | 1.20 | 6.25 |
| p110 | sampled | openrouter:qwen/qwen3.8-27b | 1.50 | 1.00 | 3.00 | 1.50 | 1.67 | 1.00 | 1.60 | 6.25 |
| p111 | sampled | openrouter:mistralai/mistral-medium-3-5 | 4.33 | 4.17 | 4.67 | 2.17 | 2.33 | 2.17 | 2.60 | 1.00 |
| p111 | sampled | openrouter:qwen/qwen3.8-27b | 4.83 | 4.00 | 3.67 | 2.67 | 2.17 | 1.83 | 1.80 | 1.00 |
| p112 | sampled | openrouter:mistralai/mistral-medium-3-5 | 4.83 | 3.00 | 4.17 | 4.50 | 4.67 | 4.00 | 4.40 | 1.75 |
| p112 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 1.33 | 3.83 | 4.67 | 4.83 | 3.00 | 2.40 | 2.00 |
| p113 | sampled | openrouter:mistralai/mistral-medium-3-5 | 3.50 | 1.33 | 5.00 | 4.00 | 4.83 | 3.67 | 1.80 | 1.00 |
| p113 | sampled | openrouter:qwen/qwen3.8-27b | 4.50 | 1.00 | 5.00 | 4.33 | 4.67 | 4.17 | 1.00 | 2.50 |
| p114 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 3.33 | 2.00 | 1.67 | 2.00 | 1.33 | 7.00 | 6.75 |
| p114 | sampled | openrouter:qwen/qwen3.8-27b | 4.83 | 2.67 | 1.50 | 2.67 | 1.67 | 1.17 | 6.20 | 5.00 |
| p115 | sampled | openrouter:mistralai/mistral-medium-3-5 | 2.00 | 1.00 | 4.67 | 2.33 | 3.17 | 1.67 | 1.80 | 5.25 |
| p115 | sampled | openrouter:qwen/qwen3.8-27b | 4.33 | 1.00 | 4.17 | 2.00 | 2.00 | 1.67 | 4.80 | 5.50 |
| p116 | sampled | openrouter:mistralai/mistral-medium-3-5 | 2.00 | 1.00 | 4.33 | 2.33 | 2.50 | 3.00 | 2.20 | 6.25 |
| p116 | sampled | openrouter:qwen/qwen3.8-27b | 1.83 | 1.00 | 3.33 | 2.33 | 2.83 | 3.50 | 2.00 | 6.50 |
| p117 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 2.17 | 3.83 | 3.17 | 3.67 | 2.17 | 6.80 | 4.75 |
| p117 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 1.67 | 2.50 | 3.83 | 3.33 | 1.83 | 5.60 | 2.00 |
| p118 | sampled | openrouter:mistralai/mistral-medium-3-5 | 4.50 | 4.50 | 3.00 | 4.33 | 4.33 | 1.83 | 5.00 | 6.00 |
| p118 | sampled | openrouter:qwen/qwen3.8-27b | 3.67 | 2.33 | 1.67 | 3.83 | 4.00 | 1.17 | 4.60 | 6.25 |
| p119 | sampled | openrouter:mistralai/mistral-medium-3-5 | 4.00 | 1.00 | 5.00 | 1.83 | 1.83 | 1.83 | 2.40 | 1.00 |
| p119 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 1.17 | 4.17 | 3.33 | 2.00 | 2.17 | 1.80 | 1.25 |
| p120 | sampled | openrouter:mistralai/mistral-medium-3-5 | 4.67 | 5.00 | 1.83 | 2.00 | 2.00 | 1.33 | 4.00 | 1.00 |
| p120 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 4.33 | 1.67 | 2.83 | 2.33 | 1.83 | 4.40 | 1.00 |
| p121 | sampled | openrouter:mistralai/mistral-medium-3-5 | 2.00 | 4.00 | 4.33 | 3.67 | 4.17 | 3.67 | 2.60 | 1.00 |
| p121 | sampled | openrouter:qwen/qwen3.8-27b | 1.67 | 4.33 | 3.67 | 3.00 | 3.83 | 2.50 | 1.20 | 1.00 |
| p122 | sampled | openrouter:mistralai/mistral-medium-3-5 | 2.83 | 1.00 | 4.50 | 1.17 | 1.33 | 1.17 | 2.60 | 3.75 |
| p122 | sampled | openrouter:qwen/qwen3.8-27b | 2.17 | 1.00 | 3.50 | 1.50 | 1.67 | 1.00 | 2.40 | 4.00 |
| p123 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 4.67 | 2.17 | 2.00 | 2.33 | 2.00 | 5.60 | 1.00 |
| p123 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 5.00 | 1.67 | 2.00 | 2.17 | 1.83 | 4.80 | 1.00 |
| p124 | sampled | openrouter:mistralai/mistral-medium-3-5 | 4.17 | 3.50 | 4.83 | 4.50 | 4.50 | 3.67 | 4.00 | 1.75 |
| p124 | sampled | openrouter:qwen/qwen3.8-27b | 4.67 | 2.67 | 4.33 | 5.00 | 4.50 | 3.00 | 2.80 | 1.50 |
| p125 | sampled | openrouter:mistralai/mistral-medium-3-5 | 1.17 | 1.00 | 5.00 | 2.50 | 3.67 | 3.50 | 2.00 | 5.25 |
| p125 | sampled | openrouter:qwen/qwen3.8-27b | 1.50 | 1.00 | 4.67 | 2.83 | 3.33 | 2.33 | 1.40 | 3.50 |
| p126 | sampled | openrouter:mistralai/mistral-medium-3-5 | 3.17 | 1.17 | 4.83 | 5.00 | 3.17 | 3.50 | 3.40 | 5.75 |
| p126 | sampled | openrouter:qwen/qwen3.8-27b | 3.50 | 1.00 | 4.33 | 4.50 | 2.33 | 3.00 | 3.00 | 6.25 |
| p127 | sampled | openrouter:mistralai/mistral-medium-3-5 | 3.67 | 3.50 | 2.83 | 3.33 | 3.67 | 2.83 | 2.40 | 1.00 |
| p127 | sampled | openrouter:qwen/qwen3.8-27b | 4.17 | 2.33 | 3.33 | 3.00 | 3.83 | 3.00 | 2.00 | 1.50 |
| p128 | sampled | openrouter:mistralai/mistral-medium-3-5 | 3.17 | 2.83 | 4.50 | 1.50 | 1.67 | 1.50 | 4.00 | 6.00 |
| p128 | sampled | openrouter:qwen/qwen3.8-27b | 3.00 | 3.50 | 4.50 | 2.00 | 1.83 | 1.00 | 4.60 | 6.75 |
| p129 | sampled | openrouter:mistralai/mistral-medium-3-5 | 4.17 | 1.67 | 5.00 | 3.00 | 2.50 | 2.00 | 4.60 | 5.50 |
| p129 | sampled | openrouter:qwen/qwen3.8-27b | 4.67 | 1.50 | 4.83 | 2.33 | 2.17 | 2.33 | 2.40 | 4.75 |
| p130 | sampled | openrouter:mistralai/mistral-medium-3-5 | 1.00 | 1.00 | 3.67 | 4.17 | 4.50 | 1.33 | 1.40 | 6.00 |
| p130 | sampled | openrouter:qwen/qwen3.8-27b | 1.33 | 1.00 | 3.00 | 3.67 | 4.00 | 1.00 | 1.40 | 6.00 |
| p131 | sampled | openrouter:mistralai/mistral-medium-3-5 | 3.33 | 1.33 | 2.83 | 2.67 | 2.67 | 1.67 | 2.80 | 1.00 |
| p131 | sampled | openrouter:qwen/qwen3.8-27b | 4.50 | 1.67 | 1.83 | 3.67 | 2.50 | 1.17 | 1.40 | 1.25 |
| p132 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 3.50 | 5.00 | 3.83 | 3.67 | 2.17 | 6.40 | 4.50 |
| p132 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 3.33 | 4.83 | 3.17 | 4.00 | 2.00 | 5.40 | 4.75 |
| p133 | sampled | openrouter:mistralai/mistral-medium-3-5 | 4.83 | 2.67 | 3.33 | 1.83 | 1.67 | 1.67 | 3.00 | 1.00 |
| p133 | sampled | openrouter:qwen/qwen3.8-27b | 4.83 | 2.33 | 2.83 | 2.00 | 2.00 | 1.67 | 3.00 | 1.00 |
| p134 | sampled | openrouter:mistralai/mistral-medium-3-5 | 4.83 | 4.00 | 3.50 | 3.50 | 2.83 | 2.33 | 4.40 | 1.00 |
| p134 | sampled | openrouter:qwen/qwen3.8-27b | 4.83 | 2.83 | 4.33 | 3.00 | 3.17 | 1.83 | 2.00 | 1.00 |
| p135 | sampled | openrouter:mistralai/mistral-medium-3-5 | 1.17 | 1.00 | 5.00 | 3.50 | 3.17 | 3.33 | 1.40 | 6.00 |
| p135 | sampled | openrouter:qwen/qwen3.8-27b | 1.33 | 1.00 | 4.83 | 3.33 | 2.33 | 1.83 | 1.60 | 6.25 |
| p136 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 3.83 | 2.83 | 3.00 | 2.83 | 2.00 | 6.80 | 1.00 |
| p136 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 3.00 | 2.83 | 2.67 | 3.00 | 2.00 | 5.80 | 1.50 |
| p137 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 4.00 | 4.83 | 1.67 | 1.67 | 1.83 | 4.80 | 3.00 |
| p137 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 3.50 | 4.50 | 2.17 | 2.17 | 1.00 | 2.60 | 1.75 |
| p138 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 4.17 | 4.00 | 2.50 | 3.50 | 2.83 | 2.80 | 1.00 |
| p138 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 3.17 | 2.17 | 3.67 | 3.33 | 1.33 | 2.20 | 1.00 |
| p139 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 4.00 | 2.00 | 3.67 | 3.17 | 2.50 | 6.60 | 1.00 |
| p139 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 3.50 | 2.17 | 3.50 | 3.83 | 2.17 | 6.20 | 1.25 |
| p140 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 4.17 | 2.50 | 4.00 | 4.17 | 2.17 | 3.40 | 1.25 |
| p140 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 3.50 | 2.83 | 4.00 | 4.67 | 1.83 | 2.20 | 1.75 |
| p141 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 5.00 | 2.50 | 2.17 | 3.67 | 1.83 | 5.40 | 1.00 |
| p141 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 5.00 | 1.83 | 2.67 | 3.83 | 1.17 | 2.60 | 1.00 |
| p142 | sampled | openrouter:mistralai/mistral-medium-3-5 | 4.17 | 1.83 | 4.83 | 3.00 | 2.83 | 2.00 | 6.00 | 5.75 |
| p142 | sampled | openrouter:qwen/qwen3.8-27b | 3.67 | 1.17 | 3.67 | 3.17 | 1.83 | 1.67 | 3.60 | 6.50 |
| p143 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 1.50 | 5.00 | 3.67 | 4.00 | 3.33 | 4.40 | 1.50 |
| p143 | sampled | openrouter:qwen/qwen3.8-27b | 4.83 | 1.50 | 3.83 | 3.67 | 3.17 | 2.67 | 4.00 | 1.00 |
| p144 | sampled | openrouter:mistralai/mistral-medium-3-5 | 1.17 | 1.00 | 5.00 | 2.33 | 1.67 | 1.17 | 1.00 | 1.00 |
| p144 | sampled | openrouter:qwen/qwen3.8-27b | 1.00 | 1.00 | 4.83 | 2.33 | 1.83 | 1.00 | 2.00 | 1.00 |
| p145 | sampled | openrouter:mistralai/mistral-medium-3-5 | 5.00 | 3.33 | 4.67 | 3.33 | 4.33 | 4.00 | 5.40 | 4.75 |
| p145 | sampled | openrouter:qwen/qwen3.8-27b | 5.00 | 3.17 | 4.50 | 3.50 | 4.33 | 4.00 | 3.40 | 6.25 |
| p146 | dark-triad | openrouter:mistralai/mistral-medium-3-5 | 1.17 | 1.00 | 4.33 | 2.00 | 2.33 | 1.00 | 1.00 | 6.00 |
| p146 | dark-triad | openrouter:qwen/qwen3.8-27b | 1.33 | 1.00 | 4.67 | 1.50 | 1.50 | 1.00 | 1.00 | 3.75 |
| p147 | hyper-utilitarian | openrouter:mistralai/mistral-medium-3-5 | 4.67 | 2.50 | 4.00 | 1.17 | 1.83 | 1.00 | 6.80 | 6.75 |
| p147 | hyper-utilitarian | openrouter:qwen/qwen3.8-27b | 4.67 | 2.17 | 3.67 | 1.83 | 2.33 | 1.00 | 6.00 | 6.25 |
| p148 | purity-driven | openrouter:mistralai/mistral-medium-3-5 | 4.67 | 2.33 | 4.50 | 4.50 | 5.00 | 4.33 | 3.00 | 1.00 |
| p148 | purity-driven | openrouter:qwen/qwen3.8-27b | 4.83 | 1.83 | 4.33 | 4.83 | 4.67 | 4.17 | 2.60 | 1.00 |
| p149 | dark-triad | openrouter:mistralai/mistral-medium-3-5 | 1.17 | 1.00 | 4.67 | 2.00 | 2.67 | 1.17 | 1.00 | 5.75 |
| p149 | dark-triad | openrouter:qwen/qwen3.8-27b | 2.00 | 1.17 | 4.67 | 1.67 | 2.17 | 1.00 | 1.20 | 3.25 |
| p150 | hyper-utilitarian | openrouter:mistralai/mistral-medium-3-5 | 2.00 | 1.00 | 4.33 | 1.33 | 1.50 | 1.00 | 7.00 | 6.75 |
| p150 | hyper-utilitarian | openrouter:qwen/qwen3.8-27b | 1.83 | 1.17 | 3.00 | 2.67 | 2.00 | 1.00 | 5.80 | 5.25 |

