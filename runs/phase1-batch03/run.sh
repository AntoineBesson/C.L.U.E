#!/bin/sh
# Batch 3 on 100 agents (run from harness/). Qwen answers the questionnaires too (cached from batch 2).
A="--personas ../agents/personas-phase1.json --items ../items/seed.json ../items/drafts/batch-01.json ../items/drafts/batch-02.json ../items/drafts/batch-03.json --item-ids q0040 q0042 q0071 q0079 q0080 q0088 q0104 q0106 q0108 q0109 q0110 q0111 q0112 q0113 q0114 q0115 q0116 q0117 q0118 q0119 q0120 q0121 q0122 q0123 q0124 q0125 q0126 q0127 q0128 q0129 q0130 q0131 q0132 q0133 q0134 q0135 q0136 q0137 q0138 q0139 q0140 q0141 q0142 q0143 q0144 q0145 q0146 q0147 q0148 q0149 q0150"
python3 -m clue_harness.run $A --scales ../items/scales/mfq2.json ../items/scales/ous.json --backend openrouter:qwen/qwen3.8-27b --workers 4 --out ../runs/phase1-batch03/qwen
# Free tier: about 1,000 requests a day, so rerun daily until done (resumes from the cache).
python3 -m clue_harness.run $A --backend openrouter:nvidia/nemotron-3-ultra-550b-a55b:free --workers 2 --rpm 15 --max-calls 980 --out ../runs/phase1-batch03/nemotron
python3 -m clue_harness.gate --run ../runs/phase1-batch03/qwen ../runs/phase1-batch03/nemotron --personas ../agents/personas-phase1.json \
  --items ../items/seed.json ../items/drafts/batch-01.json ../items/drafts/batch-02.json ../items/drafts/batch-03.json \
  --scales ../items/scales/mfq2.json ../items/scales/ous.json --json ../runs/phase1-batch03/gate.json > ../runs/phase1-batch03/gate.md
