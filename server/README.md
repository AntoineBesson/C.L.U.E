# C.L.U.E. server

Fastify + Postgres API for the game. It stores consent and answers, serves the
daily set, computes crowd statistics, and handles export and deletion.

**Collection is off by default** (`COLLECTION_ENABLED=false`): the server then
refuses consent and answers with `503 collection_disabled`, and the game keeps
everything in the player's browser. Turn it on only after the DPIA and the
ethics review.

## Run locally

```sh
cp .env.example .env        # then edit; the npm scripts load it
npm install
createdb clue
npm run migrate             # applies migrations/*.sql
npm run seed                # loads ../items/seed.json (or pass a file)
COLLECTION_ENABLED=true npm run dev
```

Point the game at it with `VITE_API_URL=http://localhost:8787 npm run dev` in
`game/`.

Tests: `npm test` runs the pure tests; the API tests also need
`TEST_DATABASE_URL` pointing at a throwaway database (they drop its schema).
CI runs both against a Postgres service.

## Endpoints

| Method | Path | What |
| --- | --- | --- |
| GET | `/health` | `{ ok, collectionEnabled }` |
| PUT | `/players/:id` | Record consent. The ID is a random UUID made in the browser |
| POST | `/responses` | Store one `ResponseRecord`. Idempotent per player, session and item |
| GET | `/items/today?playerId=` | 3 shared items (same for everyone that day, Paris time) + 2 adaptive picks. No crowd numbers |
| GET | `/items/:id/crowd` | Answer split and mean prediction, once `MIN_CROWD` players answered; otherwise the item's placeholder |
| GET | `/players/:id/export` | Everything stored about a player |
| DELETE | `/players/:id` | Delete the player and all their answers |

Export and delete work even with collection off.

## Privacy safeguards in the code

- No IP addresses, user agents, query strings or player IDs in logs: only the
  route pattern and status code. `trustProxy` is off.
- Hesitation signals are dropped server-side unless the player opted in, and
  the schema rejects any field beyond the per-answer summaries (no raw
  keystrokes or mouse traces).
- Answers are checked against the item (valid option, slider range, text
  length).
- Crowd stats below `MIN_CROWD` players are never published.
- `npm run purge` deletes data older than `RETENTION_DAYS`; run it daily.
- The player ID is the only key to a player's data. Anyone holding it can
  export or delete that data, so it must stay in the player's browser.

## Not yet

- Hosting (the spec asks for EU hosting) and a deployment config.
- Rate limiting, and a scheduled purge job.
- The adaptive pick is a heuristic (least-covered traits), not yet the
  expected-entropy rule from the spec.
