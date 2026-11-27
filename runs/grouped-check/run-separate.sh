#!/usr/bin/env bash
# Grouped sets with the crowd guesses asked in a second turn, after all four
# answers (2 requests per set; about 240 free requests). Compares the
# false-consensus gap with the same-line version in ./grouped.
set -euo pipefail
cd "$(dirname "$0")/../../harness"
M=openrouter:nvidia/nemotron-3-ultra-550b-a55b:free
ITEMS=../runs/grouped-check/seed-phase0.json
python3 -m clue_harness.sets --personas ../agents/personas.json --items $ITEMS --backend $M \
    --set-size 4 --grouped --guess-turn separate --workers 2 --rpm 15 --out ../runs/grouped-check/grouped-separate
python3 -m clue_harness.sets_report --sets ../runs/grouped-check/grouped-separate --isolated ../runs/phase0-nemotron \
    --personas ../agents/personas.json --items $ITEMS --crowd-out ../runs/grouped-check/crowd-separate.json \
    > ../runs/grouped-check/report-separate.md
