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

# Report: validity, position bias, trait tracking, per-item and per-persona tables
python -m clue_harness.analyse --run ../runs/phase0-smoke \
    --personas ../agents/personas.json --items ../items/seed.json > ../runs/phase0-smoke/report.md
```

## Modules

| Module | What |
| --- | --- |
| `traits.py` | The 17 dimensions and the prior correlation matrix |
| `personas.py` | Persona generator and the system prompt ([format](../agents/README.md)) |
| `prompts.py` | Item → prompt (options shuffled per persona and item), reply → option key or slider value |
| `backends.py` | `anthropic:<model>`, `claude-cli:<model>`, `openrouter:<model>`, `mock` |
| `run.py` | The runner: retries, strict-suffix retry, resumable cache, JSONL + Parquet output |
| `analyse.py` | The trial report |

## How a call works

Following the spec's harness steps:

1. The persona is the system prompt. The item's options are shuffled with a
   seed per (persona, item), shown as A–D, and the prompt ends with "Answer
   with a single letter." Slider items ask for a whole number from 0 to 100.
   Free-text items are not played.
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
- `openrouter:<model>` asks for top logprobs and no reasoning. Written to the
  OpenRouter chat API but not run yet: check it on one `:free` model first.
- `mock` picks options by how well their keys fit the persona's targets. The
  tests use it to check that the analysis detects tracking, and that a player
  ignoring the persona shows none.

Not done yet: a vLLM backend for the Kaggle runs, and the questionnaire items
(being added in a separate thread), which will give measured labels to
replace targets in the analysis.
