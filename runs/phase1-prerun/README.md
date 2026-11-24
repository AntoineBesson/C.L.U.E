# Phase 1 pre-run (run 2026-11-24)

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

## Results (2026-11-24)

100 agents answered 30 playable items and 45 MFQ-2/OUS items: 7,500 answers,
0 invalid. Cost $2.74 (Qwen ~$0.40, Mistral ~$2.35). Full tables:
[gate.md](gate.md) (per item), [gate.json](gate.json), [fidelity.md](fidelity.md).

- **Fidelity**: measured MFQ-2/OUS scores match the personas' targets on all 8
  traits on both models (Mistral 0.74 to 0.89, Qwen 0.59 to 0.84), so the
  measured labels the gate uses are sound.
- **Gate: 23 of 30 items kept.** 27 are above the entropy bar.

| Dropped | Why | Likely fix |
| --- | --- | --- |
| q0004 parent moving in | 79% pick the care home (90% on one model), weak tracking | make the care-home option cost something |
| q0005 trolley | still 84% "pull the lever" on Qwen (60% pooled) | keep revising; Mistral is balanced |
| q0012 party photo | 73% "message them politely" | the polite option is the obvious right answer |
| q0013 ventilator | 73% give it to the 30-year-old (88% on Qwen) | add a reason to favour first-come |
| q0021 struggling colleague | 1.17 bits, 72% "ask gently" on Qwen | just under the bar; tracks well (+0.73), worth a light edit |
| q0022 ex's new partner (slider) | does not track its keys (p 0.20) | rewrite or drop |
| q0027 scratched car | 1.06 bits, 63% "leave a note" | the honest option is the obvious right answer |

The revised items (q0009, q0014, q0018, q0020, q0024) and the new q0031 all pass.
q0001 and q0030, flagged at n = 20, pass at n = 100.
