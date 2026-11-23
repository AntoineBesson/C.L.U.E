-- C.L.U.E. initial schema. Pseudonymous: no names, emails, IP addresses or
-- device data are stored anywhere in this database.

CREATE TABLE players (
  id                   uuid PRIMARY KEY,           -- random, generated in the browser
  consent_version      text        NOT NULL,
  consent_given_at     timestamptz NOT NULL,
  uncertainty_tracking boolean     NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE items (
  id         text PRIMARY KEY,
  data       jsonb   NOT NULL,                     -- the item as in items/*.json
  active     boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE responses (
  id           bigserial PRIMARY KEY,
  player_id    uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  session_id   uuid NOT NULL,
  item_id      text NOT NULL REFERENCES items(id),
  answer_type  text NOT NULL CHECK (answer_type IN ('choice', 'binary', 'slider', 'text')),
  value        jsonb NOT NULL,
  first_value  jsonb NOT NULL,
  option_order text[],
  confirm      jsonb NOT NULL,
  prediction   jsonb,
  signals      jsonb,                              -- null unless the player opted in
  presented_at timestamptz NOT NULL,
  answered_at  timestamptz NOT NULL,
  received_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (player_id, session_id, item_id)
);
CREATE INDEX responses_item_idx ON responses (item_id);
CREATE INDEX responses_received_idx ON responses (received_at);

-- Shared items for a given day, fixed once drawn so every player sees the same.
CREATE TABLE daily_sets (
  day             date PRIMARY KEY,
  shared_item_ids text[] NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

