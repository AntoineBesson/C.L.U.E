# Phase 1 item gate

100 agents (50 personas x 2 models: openrouter:mistralai/mistral-medium-3-5, openrouter:qwen/qwen3.8-27b), 47 items. Labels: measured MFQ-2/OUS scores, targets for other traits.

- Items kept: **34 / 47**
- Items above the entropy bar: 42 (bank gate: at least 250 of the 300-item bank)
- Invalid answers: 0 of 4700

| Item | Type | Entropy (bits) | Top share | Worst model top share | Alignment | p | Keep | Why not |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| q0004 | choice | 1.74 | 44% | 46% | +0.33 | 0.000 | yes |  |
| q0005 | binary | 0.93 | 65% | 94% | +0.39 | 0.000 | no | top option 94% on openrouter:qwen/qwen3.8-27b |
| q0012 | choice | 1.80 | 42% | 48% | +0.39 | 0.000 | yes |  |
| q0013 | binary | 0.99 | 57% | 62% | +0.10 | 0.060 | no | does not track its keys (alignment +0.10, p 0.06) |
| q0021 | choice | 1.52 | 49% | 52% | +0.60 | 0.000 | yes |  |
| q0022 | choice | 1.88 | 43% | 48% | +0.57 | 0.000 | yes |  |
| q0027 | choice | 1.27 | 58% | 62% | +0.58 | 0.000 | yes |  |
| q0032 | choice | 1.80 | 46% | 64% | +0.28 | 0.000 | yes |  |
| q0033 | choice | 1.41 | 64% | 64% | +0.62 | 0.000 | yes |  |
| q0034 | choice | 1.57 | 59% | 70% | +0.51 | 0.000 | yes |  |
| q0035 | choice | 1.67 | 48% | 50% | +0.48 | 0.000 | yes |  |
| q0036 | choice | 1.12 | 72% | 72% | +0.15 | 0.000 | no | entropy 1.12 <= 1.20 bits; top option 72% pooled |
| q0037 | choice | 1.47 | 52% | 58% | +0.65 | 0.000 | yes |  |
| q0038 | choice | 1.56 | 54% | 70% | +0.51 | 0.000 | yes |  |
| q0039 | choice | 1.71 | 54% | 66% | +0.60 | 0.000 | yes |  |
| q0040 | choice | 1.24 | 73% | 80% | +0.45 | 0.000 | no | top option 73% pooled |
| q0041 | choice | 1.07 | 64% | 66% | +0.51 | 0.000 | no | entropy 1.07 <= 1.20 bits |
| q0042 | choice | 1.49 | 65% | 72% | +0.50 | 0.000 | no | top option 72% on openrouter:qwen/qwen3.8-27b |
| q0043 | choice | 1.10 | 73% | 78% | +0.27 | 0.000 | no | entropy 1.10 <= 1.20 bits; top option 73% pooled |
| q0044 | choice | 1.73 | 48% | 52% | +0.31 | 0.000 | yes |  |
| q0045 | choice | 1.86 | 33% | 44% | +0.45 | 0.000 | yes |  |
| q0046 | choice | 1.73 | 35% | 40% | +0.28 | 0.001 | yes |  |
| q0047 | choice | 1.79 | 35% | 44% | +0.51 | 0.000 | yes |  |
| q0048 | choice | 1.80 | 38% | 42% | +0.41 | 0.000 | yes |  |
| q0049 | choice | 1.96 | 33% | 34% | +0.56 | 0.000 | yes |  |
| q0050 | choice | 1.39 | 45% | 54% | +0.02 | 0.340 | no | does not track its keys (alignment +0.02, p 0.34) |
| q0051 | choice | 1.72 | 40% | 42% | +0.26 | 0.000 | yes |  |
| q0052 | choice | 1.97 | 32% | 34% | +0.54 | 0.000 | yes |  |
| q0053 | choice | 1.72 | 49% | 54% | +0.41 | 0.000 | yes |  |
| q0054 | choice | 1.60 | 56% | 60% | +0.49 | 0.000 | yes |  |
| q0055 | choice | 1.64 | 52% | 56% | +0.66 | 0.000 | yes |  |
| q0056 | choice | 1.54 | 50% | 54% | +0.65 | 0.000 | yes |  |
| q0057 | choice | 1.41 | 63% | 76% | +0.45 | 0.000 | no | top option 76% on openrouter:mistralai/mistral-medium-3-5 |
| q0058 | choice | 1.33 | 71% | 80% | +0.39 | 0.000 | no | top option 71% pooled |
| q0059 | choice | 1.51 | 64% | 64% | +0.34 | 0.000 | yes |  |
| q0060 | choice | 1.65 | 45% | 48% | +0.77 | 0.000 | yes |  |
| q0061 | choice | 1.62 | 48% | 54% | +0.30 | 0.000 | yes |  |
| q0062 | choice | 1.72 | 46% | 54% | +0.60 | 0.000 | yes |  |
| q0063 | choice | 1.66 | 48% | 48% | +0.52 | 0.000 | yes |  |
| q0064 | choice | 1.71 | 42% | 48% | +0.97 | 0.000 | yes |  |
| q0065 | choice | 1.19 | 49% | 50% | +0.25 | 0.000 | no | entropy 1.19 <= 1.20 bits |
| q0066 | binary | 0.96 | 61% | 62% | +0.80 | 0.000 | yes |  |
| q0067 | choice | 1.52 | 49% | 54% | +0.17 | 0.007 | yes |  |
| q0068 | choice | 1.53 | 43% | 52% | +0.57 | 0.000 | yes |  |
| q0069 | binary | 0.96 | 61% | 88% | +0.16 | 0.009 | no | top option 88% on openrouter:qwen/qwen3.8-27b |
| q0070 | choice | 1.86 | 41% | 44% | +0.34 | 0.000 | yes |  |
| q0071 | choice | 1.18 | 62% | 70% | +0.30 | 0.000 | no | entropy 1.18 <= 1.20 bits |

