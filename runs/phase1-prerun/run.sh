#!/usr/bin/env bash
# Phase 1 pre-run: 50 new personas (p101-p150) x 2 model families = 100 agents.
# Each agent answers the playable bank plus MFQ-2 and OUS (for measured labels).
# Resumable: rerun the same command after an interruption or a rate limit.
set -euo pipefail
cd "$(dirname "$0")/../../harness"
P=../agents/personas-phase1.json
SCALES="../items/scales/mfq2.json ../items/scales/ous.json"
OUT=../runs/phase1-prerun

python3 -m clue_harness.run --personas $P --items ../items/seed.json --scales $SCALES \
    --backend openrouter:qwen/qwen3.8-27b --workers 4 --out $OUT/qwen
# New OpenRouter accounts are held to 20 requests a minute on Mistral Medium.
python3 -m clue_harness.run --personas $P --items ../items/seed.json --scales $SCALES \
    --backend openrouter:mistralai/mistral-medium-3-5 --workers 3 --rpm 18 --out $OUT/mistral

python3 -m clue_harness.gate --run $OUT/qwen $OUT/mistral --personas $P --items ../items/seed.json \
    --scales $SCALES --json $OUT/gate.json > $OUT/gate.md
python3 -m clue_harness.scales --run $OUT/qwen $OUT/mistral --personas $P --scales $SCALES > $OUT/fidelity.md
