# Phase 1 pre-run (set up, not run yet)

The spec's Phase 1 asks for a 100-agent pre-run of the question bank, then
drops weak items, with a gate of at least 250 items above 1.2 bits of answer
entropy (out of 300).

**Agents.** 50 new personas (`agents/personas-phase1.json`, seed 2027, ids
p101-p150, 5 archetypes) x 2 model families that passed Phase 0 (Qwen 3.8 27B
and Mistral Medium 3.5) = 100 agents. New personas so the Phase 0 personas,
which the item rewrites were tuned on, are not reused. Two families so an item
is not kept because of one model's habits.

**What each agent answers.** The playable bank (30 items today) plus MFQ-2 and
OUS (45 items), so each agent is labelled by its own measured scores.

**Gate** (`python -m clue_harness.gate`): an item is kept when its answer
entropy is above 1.2 bits (0.6 for a binary item; slider sd at least 10), no
option takes over 70% of agents pooled or on either model, and the chosen
option tracks the agent's measured traits (mean alignment above 0,
permutation p < 0.05).

**Run:** `runs/phase1-prerun/run.sh` (resumable).

**Cost**, from the Phase 0 per-call prices (Qwen $0.0001, Mistral Medium $0.00067):

| Bank | Calls per model | Qwen | Mistral Medium | Total | Time (Mistral at 18 rpm) |
| --- | --- | --- | --- | --- | --- |
| Today's 30 items + scales | 3,750 | $0.38 | $2.51 | **~$2.90** | ~3.5 h |
| 300-item bank + scales | ~17,250 | $1.75 | $11.55 | ~$13.30 | ~16 h |

The full 300-item run does not fit the remaining OpenRouter credit with
Mistral Medium. Options then: a cheaper second family (e.g. a small Mistral
or Llama model, after a Phase 0 check), the free Nemotron model at about
1,000 calls a day, or Kaggle vLLM as the spec plans for Phase 2.
