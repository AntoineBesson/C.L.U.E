#!/usr/bin/env bash
# Grouped-mode check on free Nemotron (about 265 free requests).
# Compares grouped sets of 4 (one request per set) with the isolated Nemotron
# answers from Phase 0 (runs/phase0-nemotron), using the bank as it was then.
set -euo pipefail
cd "$(dirname "$0")/../../harness"
M=openrouter:nvidia/nemotron-3-ultra-550b-a55b:free
ITEMS=../runs/grouped-check/seed-phase0.json
# 1. Grouped: 20 Phase 0 personas, sets of 4 with crowd guesses: 140 requests.
python3 -m clue_harness.sets --personas ../agents/personas.json --items $ITEMS --backend $M \
    --set-size 4 --grouped --workers 2 --rpm 15 --out ../runs/grouped-check/grouped
# 2. Resampling baseline: 5 personas answer every card alone again (fresh cache): 125 requests.
python3 -m clue_harness.run --personas ../agents/personas.json --limit-personas 5 --items $ITEMS \
    --backend $M --workers 2 --rpm 15 --out ../runs/grouped-check/resample
python3 -m clue_harness.sets_report --sets ../runs/grouped-check/grouped --isolated ../runs/phase0-nemotron \
    --personas ../agents/personas.json --items $ITEMS --crowd-out ../runs/grouped-check/crowd.json \
    > ../runs/grouped-check/report.md
