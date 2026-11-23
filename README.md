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
4. For choice, binary and slider cards, the player then **predicts the
   crowd**: how players split across the options, or the average slider
   value. Text cards skip this step.

## Scoring and the reveal

Logic lives in plain modules, separate from the UI:

- `game/src/scoring.ts`: the answer is never scored. Prediction points use the
  Bayesian Truth Serum prediction score, `100 * exp(Σ x_j log(y_j / x_j))`
  (100 for an exact guess). A bonus, `50 * log(x_k / ȳ_k)` clipped at 0, rewards
  an answer that turned out more common than the crowd predicted. Slider
  cards score `100 - |guess - mean|`. Clipping the bonus at 0 trades a little
  of BTS's incentive guarantee for never showing negative points.
- `game/src/profile.ts`: a rough trait profile (average keyed direction of
  the chosen options, ±1/√n) and "one in N" from the surprisal of the
  player's answers under the crowd split, assuming independent answers. Both
  are placeholders for the models in the spec.
- Crowd numbers come from `crowd` on each item in `items/seed.json`. They are
  marked `"source": "placeholder"` until agent or human data replaces them.

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
