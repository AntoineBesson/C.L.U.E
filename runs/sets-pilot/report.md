# Daily sets vs isolated cards

## openrouter:qwen/qwen3.8-27b

50 personas, 1250 answers in sets of 4; 0 invalid answers, 0 invalid guesses.

| Position in set | Same answer as when shown alone | n |
| --- | --- | --- |
| 1 (no context: resampling baseline) | 67% | 350 |
| 2 | 68% | 300 |
| 3 | 66% | 300 |
| 4 | 65% | 300 |

Mean alignment: +0.43 in sets, +0.44 alone (same agents and cards).

Answer split shift per card (total variation): median 0.10; largest q0024 0.24, q0014 0.22, q0011 0.22, q0029 0.22, q0021 0.18.

Crowd guesses: mean absolute error of the average guess 9.1 points per option; false-consensus gap +3.4 points (agents guess more for the option they chose).

