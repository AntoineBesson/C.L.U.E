# 0001: Behavioural uncertainty tracking

- **Status:** accepted, provisional (revisit once the CNIL position is clear)
- **Date:** 2026-11-23
- **Decided by:** Antoine

## Context

The original spec (Nov 22) ruled out every behavioural signal (timing, mouse,
typing) because the CNIL treats behavioural traits used to single someone out
as sensitive biometric data, and the re-identification result is stronger if
answers alone suffice.

We now also want to measure how *uncertain* players are about each answer:
hesitation, answer changes, characters typed and deleted, pointer movement.
These signals only make sense for real human players; synthetic agents have
none.

## Decision

1. Uncertainty tracking is a **separate, optional opt-in** on the consent
   screen, unchecked by default. Declining it does not stop anyone playing.
2. The game records **per-answer summaries only**: counts and durations
   (see `UncertaintySignals` in `game/src/types.ts`). It never stores keystroke
   timings, which keys were pressed, pointer coordinates or paths.
3. Summaries are used to study uncertainty, **not as features for the
   re-identification matcher** (RQ2), which stays answers-only.
4. In this prototype, everything stays in the player's browser (local
   storage) with export and delete buttons. No server collection until the
   DPIA and ethics review are done.

## Why summaries rather than raw traces

Raw keystroke dynamics and mouse paths are close to a biometric signature.
Summaries such as "3 answer changes, 12 characters deleted, 4.2 s before the
first click" still measure doubt but are much weaker identifiers. This keeps
the DPIA simpler, and moving to raw traces later is a code change, not a
redesign.

## What would change this

- CNIL or DPO advice that summaries are also biometric data → drop tracking or
  keep it lab-only.
- Advice that raw traces are acceptable under explicit consent → add an
  opt-in raw mode behind a second checkbox.

## Related changes on the same day

- **Answer types:** 2–4 option choice, binary, 0–100 slider, short free text.
  Free text goes against the spec's minimisation rule; the text box warns
  players not to write anything identifying, and text answers need their own
  line in the DPIA.
- **"Are you sure?" prompt:** shown on a random share of cards
  (`confirmProbability` in `game/src/config.ts`) so its effect on answers can be
  estimated against cards without it. Whether it was shown, and whether the
  player changed their answer, is recorded for every card. The prompt wording
  is neutral and never claims something false (e.g. "most people changed").
