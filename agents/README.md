# Personas

`personas.json` holds the 20 Phase 0 personas. It is generated, not hand-edited:

```sh
cd harness
python -m clue_harness.personas --n 20 --seed 2026 > ../agents/personas.json
```

A test checks that the committed file matches the generator, so change the
generator (`harness/clue_harness/personas.py`) and regenerate.

## Format

```jsonc
{
  "persona_id": "p018",
  "archetype": "dark-triad",          // "sampled", or one of the extreme archetypes
  "target_traits": {                  // z-scores on all 17 dimensions (names as in game/src/profile.ts)
    "care": -1.41, "machiavellianism": 2.27, "...": 0.0
  },
  "demographics": { "age_bracket": "30-39", "country": "GB", "occupation": "sales manager" },
  "backstory": "You are Yanis, 33, a sales manager from the United Kingdom. ...",
  "behaviour": [                      // plain-language lines, strongest trait first
    "You rarely feel guilty, and you act on impulse even when someone could get hurt.",
    "..."
  ],
  "seed": 1234567                     // for anything stochastic per persona
}
```

An agent is a persona played by one model (`agent_id` = `persona_id@backend`
in the run output), so the persona × model crossing in the spec falls out of
running every persona on every backend.

## How personas are made

- **Targets.** 17 sampled personas draw their targets from a multivariate
  normal with rough literature correlations (`harness/clue_harness/traits.py`;
  to be refitted on the pilot). Three are extreme archetypes, one each of
  dark-triad, hyper-utilitarian and purity-driven, so the tails are covered
  (the spec asks for about 10%; with 20 personas that would leave one
  archetype out).
- **Behaviour, never labels.** Each trait with |z| ≥ 0.5 adds one behaviour
  sentence, |z| ≥ 1.2 adds two. Sentences describe what the person does
  ("you keep useful information to yourself and use it when it gives you
  leverage"), never a trait name or number. A test rejects prompts that
  contain trait names.
- **Backstory.** Name, age, job, country, household and two personal details,
  drawn without repeats, so two personas with similar traits still differ
  (RQ2 needs this).
- **Prompt.** `system_prompt()` joins the backstory, the behaviour lines and
  an instruction to answer as the person really would, not as looks best.

Targets are not labels. Labels come from each agent's measured questionnaire
scores; targets are only used to write prompts and to report persona fidelity.
