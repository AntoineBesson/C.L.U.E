# Phase 1 item gate

100 agents (50 personas x 2 models: openrouter:nvidia/nemotron-3-ultra-550b-a55b:free, openrouter:qwen/qwen3.8-27b), 49 items. Labels: measured MFQ-2/OUS scores, targets for other traits.

- Items kept: **38 / 49**
- Items above the entropy bar: 44 (bank gate: at least 250 of the 300-item bank)
- Invalid answers: 3 of 4900

| Item | Type | Entropy (bits) | Top share | Worst model top share | Alignment | p | Keep | Why not |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| q0036 | choice | 1.63 | 48% | 56% | +0.18 | 0.003 | yes |  |
| q0040 | choice | 1.64 | 58% | 72% | +0.39 | 0.000 | no | top option 72% on openrouter:nvidia/nemotron-3-ultra-550b-a55b:free |
| q0041 | choice | 1.80 | 47% | 50% | +0.37 | 0.000 | yes |  |
| q0042 | choice | 1.32 | 71% | 72% | +0.35 | 0.000 | no | top option 71% pooled |
| q0043 | choice | 1.66 | 53% | 66% | +0.36 | 0.000 | yes |  |
| q0050 | choice | 1.86 | 42% | 46% | +0.40 | 0.000 | yes |  |
| q0057 | choice | 1.68 | 49% | 52% | +0.32 | 0.000 | yes |  |
| q0058 | choice | 1.77 | 51% | 56% | +0.38 | 0.000 | yes |  |
| q0065 | binary | 1.00 | 51% | 62% | +0.31 | 0.000 | yes |  |
| q0071 | choice | 1.16 | 71% | 72% | +0.12 | 0.031 | no | entropy 1.16 <= 1.20 bits; top option 71% pooled |
| q0072 | choice | 1.63 | 50% | 54% | +0.45 | 0.000 | yes |  |
| q0073 | choice | 1.63 | 56% | 56% | +0.39 | 0.000 | yes |  |
| q0074 | choice | 1.82 | 47% | 50% | +0.64 | 0.000 | yes |  |
| q0075 | choice | 1.30 | 64% | 70% | +0.60 | 0.000 | yes |  |
| q0076 | choice | 1.77 | 44% | 62% | +0.39 | 0.000 | yes |  |
| q0077 | choice | 1.61 | 48% | 52% | +0.59 | 0.000 | yes |  |
| q0078 | choice | 1.62 | 52% | 60% | +0.66 | 0.000 | yes |  |
| q0079 | choice | 1.56 | 46% | 50% | +0.06 | 0.283 | no | does not track its keys (alignment +0.06, p 0.28) |
| q0080 | choice | 1.28 | 67% | 74% | +0.23 | 0.011 | no | top option 74% on openrouter:nvidia/nemotron-3-ultra-550b-a55b:free |
| q0081 | choice | 1.74 | 52% | 56% | +0.27 | 0.000 | yes |  |
| q0082 | choice | 1.82 | 39% | 46% | +0.47 | 0.000 | yes |  |
| q0083 | choice | 1.50 | 63% | 68% | +0.30 | 0.000 | yes |  |
| q0084 | choice | 1.68 | 51% | 56% | +0.67 | 0.000 | yes |  |
| q0085 | choice | 1.52 | 62% | 66% | +0.64 | 0.000 | yes |  |
| q0086 | choice | 1.36 | 48% | 64% | +0.45 | 0.000 | yes |  |
| q0087 | choice | 1.49 | 46% | 48% | +0.47 | 0.000 | yes |  |
| q0088 | choice | 1.38 | 67% | 86% | +0.36 | 0.000 | no | top option 86% on openrouter:qwen/qwen3.8-27b |
| q0089 | choice | 1.62 | 57% | 58% | +0.66 | 0.000 | yes |  |
| q0090 | choice | 1.77 | 46% | 50% | +0.51 | 0.000 | yes |  |
| q0091 | choice | 1.38 | 59% | 66% | +0.43 | 0.000 | yes |  |
| q0092 | choice | 1.66 | 49% | 52% | +0.47 | 0.000 | yes |  |
| q0093 | choice | 1.67 | 53% | 58% | +0.32 | 0.000 | yes |  |
| q0094 | choice | 1.72 | 43% | 44% | +0.62 | 0.000 | yes |  |
| q0095 | choice | 1.85 | 42% | 52% | +0.31 | 0.000 | yes |  |
| q0096 | choice | 1.77 | 48% | 54% | +0.26 | 0.000 | yes |  |
| q0097 | choice | 1.65 | 42% | 48% | +0.24 | 0.001 | yes |  |
| q0098 | choice | 1.58 | 47% | 52% | +0.34 | 0.000 | yes |  |
| q0099 | choice | 1.87 | 37% | 44% | +0.72 | 0.000 | yes |  |
| q0100 | choice | 1.56 | 57% | 60% | +0.47 | 0.000 | yes |  |
| q0101 | choice | 1.86 | 45% | 52% | +0.54 | 0.000 | yes |  |
| q0102 | choice | 1.60 | 56% | 58% | +0.36 | 0.000 | yes |  |
| q0103 | choice | 1.76 | 42% | 42% | +0.63 | 0.000 | yes |  |
| q0104 | choice | 0.83 | 83% | 88% | +0.33 | 0.000 | no | entropy 0.83 <= 1.20 bits; top option 83% pooled |
| q0105 | binary | 0.99 | 57% | 66% | +0.69 | 0.000 | yes |  |
| q0106 | choice | 0.84 | 85% | 90% | +0.24 | 0.000 | no | entropy 0.84 <= 1.20 bits; top option 85% pooled |
| q0107 | choice | 1.58 | 47% | 52% | +0.76 | 0.000 | yes |  |
| q0108 | choice | 1.08 | 77% | 80% | +0.48 | 0.000 | no | entropy 1.08 <= 1.20 bits; top option 77% pooled |
| q0109 | choice | 1.18 | 61% | 72% | +0.47 | 0.000 | no | entropy 1.18 <= 1.20 bits; top option 72% on openrouter:nvidia/nemotron-3-ultra-550b-a55b:free |
| q0110 | choice | 1.24 | 49% | 57% | +0.16 | 0.078 | no | does not track its keys (alignment +0.16, p 0.08) |

