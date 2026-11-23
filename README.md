# C.L.U.E.

A daily dilemma game and research project: how few answers does it take to
profile someone, how sure are they of those answers, and can they be
recognised again from answers alone? The game ends with a reveal that shows
players what their choices gave away.

The full research spec (research questions, ethics and legal framework,
modelling plan) lives in the project folder as *Dilemma Profiling Game Project
Spec*. Changes to it are logged in [`docs/decisions/`](docs/decisions/).

## Layout

| Path | What |
| --- | --- |
| `game/` | The playable prototype: Vite + React + TypeScript, static, no backend yet |
| `items/` | The question bank (`seed.json`), shared by the game and the agent harness |
| `docs/decisions/` | Design decisions and why they were made |

Still to come, per the spec: `agents/` (persona specs), `harness/` (LLM
answering runs), `models/` (profiling and re-identification).

## Run the game

```sh
cd game
npm install
npm run dev      # http://localhost:5173
npm test         # signal recorder unit tests
npm run build
```

## How a card works

1. The scenario appears with one of four answer types: **choice** (2–4
   options, order shuffled each time), **binary**, **slider** (0–100) or
   **text** (short free text).
2. The player presses **Validate**.
3. On a random half of cards (`confirmProbability` in `game/src/config.ts`),
   the game asks **"Are you sure?"**. The player can confirm or go back once.
   Whether the prompt was shown, and whether the answer changed, is stored for
   every card, so the effect of the prompt can be measured.

## Consent and what is recorded

The first screen asks for three things: 18 or older, consent to record
answers for research, and a **separate, optional** opt-in for hesitation
tracking. Players who decline tracking can still play.

With tracking on, each answer gets a short summary (`UncertaintySignals` in
`game/src/types.ts`): time to first interaction and to validation, answer
changes, options tried, pointer travel, slider reversals, characters typed and
deleted, pastes, longest pause, tab switches. Keystrokes, typing rhythm and
mouse coordinates are never stored. See
[decision 0001](docs/decisions/0001-uncertainty-tracking.md) for why, and what
would change it.

In this prototype all data stays in the player's browser (`localStorage`),
with **Export my data** and **Delete my data** on the end screen. Nothing
should be sent to a server before the DPIA and the ethics review are done.

## Response record

```jsonc
{
  "playerId": "random uuid",
  "sessionId": "random uuid",
  "itemId": "q0003",
  "answerType": "slider",
  "value": 72,
  "firstValue": 85,            // before "Are you sure?"
  "optionOrder": null,         // option keys as shown, for choice/binary
  "confirm": { "shown": true, "reconsidered": 1, "changedAfterPrompt": true, "msOnPrompt": 2140 },
  "signals": { "msToFirstInteraction": 1830, "answerChanges": 2, "sliderReversals": 3, "...": 0 },
  "presentedAt": "...",
  "answeredAt": "..."
}
```
