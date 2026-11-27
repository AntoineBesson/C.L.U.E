# Agent harness

AI players answer the question bank as personas, and the analysis checks
whether their choices track the traits each option is keyed to.

```sh
cd harness
pip install -r requirements.txt
python -m pytest tests

# Run every persona on every playable item, for one or more backends
python -m clue_harness.run --personas ../agents/personas.json --items ../items/seed.json \
    --backend claude-cli:claude-haiku-5-5 --backend claude-cli:claude-sonnet-5-5 \
    --out ../runs/phase0-smoke

# Questionnaires: personas answer the validated scales (items/scales/)
python -m clue_harness.run --personas ../agents/personas.json \
    --scales ../items/scales/mfq2.json ../items/scales/ous.json \
    --backend claude-cli:claude-sonnet-5-5 --out ../runs/phase0-scales
python -m clue_harness.scales --run ../runs/phase0-scales --personas ../agents/personas.json \
    --scales ../items/scales/mfq2.json ../items/scales/ous.json > ../runs/phase0-scales/fidelity.md

# Report: validity, position bias, trait tracking, per-item and per-persona tables.
# With --scales-run, trait tracking is also shown against measured scores.
python -m clue_harness.analyse --run ../runs/phase0-smoke \
    --personas ../agents/personas.json --items ../items/seed.json \
    --scales-run ../runs/phase0-scales --scales ../items/scales/mfq2.json ../items/scales/ous.json \
    > ../runs/phase0-smoke/report.md

# Daily sets with crowd guesses. On request-limited models (free tiers, Mistral) use
# --grouped: one request per set instead of two per card (runs/grouped-check).
# The item gate and adaptive replays keep isolated answers (clue_harness.run).
python -m clue_harness.sets --personas ../agents/personas-phase1.json --items ../items/seed.json \
    --backend openrouter:nvidia/nemotron-3-ultra-550b-a55b:free --set-size 4 --grouped --out ../runs/sets-nemotron

# Phase 1 pre-run (100 agents) and item gate: see runs/phase1-prerun/run.sh

# Simulated crowd for the game. Each run is given with the commit it ran at, so a
# split is dropped automatically once its item is reworded. Re-run after each new run.
python -m clue_harness.crowd --run ../runs/phase1-prerun@bb974b5 --run ../runs/phase1-batch01@972140b \
    --guesses ../runs/sets-pilot@2fa28a9 --items ../items/seed.json ../items/drafts/batch-01.json > ../items/crowd/simulated.json
python -m clue_harness.personas --n 50 --seed 2027 --first-id 101 > ../agents/personas-phase1.json
```

## Modules

| Module | What |
| --- | --- |
| `traits.py` | The 17 dimensions and the prior correlation matrix |
| `personas.py` | Persona generator and the system prompt ([format](../agents/README.md)) |
| `prompts.py` | Item → prompt (options shuffled per persona and item), reply → option key or slider value |
| `backends.py` | `anthropic:<model>`, `claude-cli:<model>`, `openrouter:<model>`, `mock` |
| `run.py` | The runner: retries, strict-suffix retry, resumable cache, JSONL + Parquet output |
| `scales.py` | Questionnaire items as harness items (`likert`), scoring, persona fidelity report |
| `analyse.py` | The trial report |
| `sets.py` | Daily-set mode: cards played in sets within one conversation, with a crowd-split guess after each answer; `--grouped` sends a whole set in one request (for request-limited models) |
| `sets_report.py` | Sets vs isolated answers (context effect, tracking), crowd-guess accuracy, agent `crowd` shares |
| `gate.py` | Phase 1 item gate: keep/drop per item from a pre-run (entropy, top share, tracking against measured labels) |
| `crowd.py` | Simulated crowd for the game (`items/crowd/simulated.json`): pooled agent answers per item, fingerprinted against the item text the run used |

## How a call works

Following the spec's harness steps:

1. The persona is the system prompt. The item's options are shuffled with a
   seed per (persona, item), shown as A–D, and the prompt ends with "Answer
   with a single letter." Slider items ask for a whole number from 0 to 100.
   Questionnaire items show the scale's instructions, the statement and the
   labelled response options in published order. Free-text items are not played.
2. The backend answers. The same (persona, item) gets the same option order on
   every model, so models can be compared pair by pair.
3. The letter is mapped back to the item's own option key. Anything else gets
   one retry with a stricter suffix, then is logged as invalid.
4. Where a backend returns logprobs (OpenRouter, for some providers), the
   answer distribution is stored in `probs`; otherwise one sample at the
   provider's default temperature, recorded in `sampling`.
5. Every call is cached in `cache.jsonl` under a hash of (backend, system
   prompt, user prompt), so a cut run resumes where it stopped.

Each output row: `agent_id, persona_id, archetype, model, item_id,
answer_type, order, chosen_key, chosen_position, value, probs, sampling,
invalid, attempts, raw_text, input_tokens, output_tokens`.

## Backends

- `anthropic:<model>` uses the official SDK and `ANTHROPIC_API_KEY`. Thinking
  is disabled on Haiku 5.5 and set to the lowest effort on models where it
  cannot be disabled. Current Claude models no longer accept `temperature`,
  so Claude answers are one sample at the default.
- `claude-cli:<model>` runs a headless Claude Code (`claude -p`) with tools,
  MCP servers and settings off. It was used for the Phase 0 trial because it
  needed no API key. It adds about 2,300 input tokens of its own per call, so
  use the API backend for bulk runs.
- `openrouter:<model>` asks for top logprobs and no reasoning. The key comes
  from `OPENROUTER_API_KEY` or, better, from a network secret on the cloud
  environment (host `openrouter.ai`, header `Authorization`, value
  `Bearer <key>`), which the network layer adds so the harness never sees it.
- `mock` picks options by how well their keys fit the persona's targets. The
  tests use it to check that the analysis detects tracking, and that a player
  ignoring the persona shows none.

Not done yet: a vLLM backend for the Kaggle runs, and SD3 and HEXACO, which
are on hold over their terms of use (see `items/scales/README.md`), so the
dark-triad and HEXACO traits still have targets only.
