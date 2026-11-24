# Phase 1 item gate

100 agents (50 personas x 2 models: openrouter:mistralai/mistral-medium-3-5, openrouter:qwen/qwen3.8-27b), 30 items. Labels: measured MFQ-2/OUS scores, targets for other traits.

- Items kept: **23 / 30**
- Items above the entropy bar: 27 (bank gate: at least 250 of the 300-item bank)
- Invalid answers: 0 of 3000

| Item | Type | Entropy (bits) | Top share | Worst model top share | Alignment | p | Keep | Why not |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| q0001 | choice | 1.83 | 42% | 48% | +0.34 | 0.000 | yes |  |
| q0002 | binary | 0.91 | 67% | 68% | +0.39 | 0.000 | yes |  |
| q0003 | slider | sd 37 |  |  | +0.61 | 0.000 | yes |  |
| q0004 | choice | 0.95 | 79% | 90% | +0.09 | 0.009 | no | entropy 0.95 <= 0.95 bits; top option 79% pooled |
| q0005 | binary | 0.97 | 60% | 84% | +0.37 | 0.000 | no | top option 84% on openrouter:qwen/qwen3.8-27b |
| q0007 | choice | 1.48 | 64% | 68% | +0.33 | 0.000 | yes |  |
| q0008 | choice | 1.64 | 37% | 48% | +0.51 | 0.000 | yes |  |
| q0009 | choice | 1.96 | 34% | 36% | +0.73 | 0.000 | yes |  |
| q0010 | slider | sd 20 |  |  | +0.29 | 0.000 | yes |  |
| q0011 | choice | 1.52 | 40% | 52% | +0.19 | 0.005 | yes |  |
| q0012 | choice | 1.26 | 73% | 78% | +0.09 | 0.000 | no | top option 73% pooled |
| q0013 | binary | 0.84 | 73% | 88% | +0.09 | 0.038 | no | top option 73% pooled |
| q0014 | choice | 1.74 | 50% | 62% | +0.39 | 0.000 | yes |  |
| q0015 | binary | 0.93 | 65% | 66% | +0.52 | 0.000 | yes |  |
| q0016 | choice | 1.47 | 58% | 62% | +0.46 | 0.000 | yes |  |
| q0017 | slider | sd 32 |  |  | +0.38 | 0.000 | yes |  |
| q0018 | choice | 1.86 | 39% | 46% | +0.28 | 0.003 | yes |  |
| q0019 | choice | 1.64 | 49% | 50% | +0.81 | 0.000 | yes |  |
| q0020 | binary | 1.00 | 53% | 58% | +0.61 | 0.000 | yes |  |
| q0021 | choice | 1.17 | 63% | 72% | +0.73 | 0.000 | no | entropy 1.17 <= 1.20 bits; top option 72% on openrouter:qwen/qwen3.8-27b |
| q0022 | slider | sd 28 |  |  | +0.13 | 0.198 | no | does not track its keys (alignment +0.13, p 0.20) |
| q0023 | slider | sd 33 |  |  | +0.27 | 0.003 | yes |  |
| q0024 | choice | 1.86 | 43% | 48% | +0.84 | 0.000 | yes |  |
| q0025 | binary | 0.95 | 63% | 70% | +0.33 | 0.000 | yes |  |
| q0026 | choice | 1.48 | 58% | 62% | +0.40 | 0.000 | yes |  |
| q0027 | choice | 1.06 | 63% | 66% | +0.64 | 0.000 | no | entropy 1.06 <= 1.20 bits |
| q0028 | slider | sd 30 |  |  | +0.39 | 0.000 | yes |  |
| q0029 | choice | 1.66 | 54% | 58% | +0.50 | 0.000 | yes |  |
| q0030 | choice | 1.86 | 45% | 50% | +0.15 | 0.029 | yes |  |
| q0031 | choice | 1.58 | 51% | 60% | +0.76 | 0.000 | yes |  |

