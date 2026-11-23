# 0002: Server, and a switch that keeps collection off

- **Status:** accepted
- **Date:** 2026-11-23

## Context

The game needs a backend for crowd statistics (the BTS score needs everyone's
answers and predictions), a shared daily set and the "one in N" figure. The
spec says no human data before the DPIA and the ethics review, and asks for
EU-hosted Postgres, pseudonymous IDs and deletion on request.

## Decision

- `server/`: Fastify + Postgres, one small codebase, sharing its types with
  the game (`game/src/types.ts`).
- `COLLECTION_ENABLED` defaults to `false`. While off, the server refuses
  consent and answers (`503`), and the game keeps everything local. Export and
  delete always work.
- The browser holds the primary copy and an outbox; the server write is
  idempotent per (player, session, item), so retries are safe.
- Crowd numbers are not sent with the day's items, only through
  `/items/:id/crowd` after answering, and only once `MIN_CROWD` players
  answered an item.
- Server-side enforcement of the tracking opt-in: signals are dropped for
  players who did not opt in, and only the summary fields are accepted.

## Open

- Hosting provider (EU) and who is the data controller (see the spec's open
  questions).
- Whether the player ID alone is enough protection for export and delete, or
  whether we add a separate deletion secret.
