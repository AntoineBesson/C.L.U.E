# Question bank

`seed.json` holds the hand-written seed dilemmas (Phase 0 of the spec). The
game, the server (`npm run seed` in `server/`) and the agent harness all read
it.

## Rules (checked by `game/src/items.test.ts`)

- `id` is `q` plus four digits, unique.
- `scenario` is at most 60 words. `intensity`: 1 everyday, 2 costly, 3
  life-and-death.
- `choice` has 2 to 4 options, `binary` exactly 2. Every option is keyed to at
  least one trait direction (`+1` or `-1`). Option order is shuffled at every
  presentation, so the key letter carries no meaning.
- `slider` keys the 100 end of the scale; 50 is neutral.
- `text` items are not keyed and take no crowd prediction. Keep them rare: free
  text is the hardest answer type to justify in the DPIA.
- Trait names are the 17 dimensions in `game/src/profile.ts` (`TRAIT_LABELS`).
  Every trait must appear in at least 3 items.
- No politics or religion; no option should be the obviously "nice" one.
- `crowd` is optional. Seed values marked `"source": "placeholder"` are made
  up and must be replaced by agent or pilot statistics.
