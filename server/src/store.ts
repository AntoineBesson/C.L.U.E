import pg from 'pg'
import type { Item } from '../../game/src/types.ts'
import type { CrowdRow } from './crowd.ts'
import type { ConsentInput, ResponseInput } from './schemas.ts'

export interface PlayerRow {
  id: string
  consentVersion: string
  uncertaintyTracking: boolean
}

export class Store {
  constructor(readonly pool: pg.Pool) {}

  static connect(databaseUrl: string): Store {
    return new Store(new pg.Pool({ connectionString: databaseUrl }))
  }

  close() {
    return this.pool.end()
  }

  async upsertPlayer(id: string, c: ConsentInput) {
    await this.pool.query(
      `INSERT INTO players (id, consent_version, consent_given_at, uncertainty_tracking)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         consent_version = EXCLUDED.consent_version,
         consent_given_at = EXCLUDED.consent_given_at,
         uncertainty_tracking = EXCLUDED.uncertainty_tracking`,
      [id, c.version, c.givenAt, c.uncertaintyTracking],
    )
  }

  async getPlayer(id: string): Promise<PlayerRow | null> {
    const { rows } = await this.pool.query(
      'SELECT id, consent_version, uncertainty_tracking FROM players WHERE id = $1',
      [id],
    )
    return rows[0]
      ? { id: rows[0].id, consentVersion: rows[0].consent_version, uncertaintyTracking: rows[0].uncertainty_tracking }
      : null
  }

  /** Idempotent: a retried upload of the same card is ignored. Returns true if stored. */
  async insertResponse(r: ResponseInput): Promise<boolean> {
    const res = await this.pool.query(
      `INSERT INTO responses (player_id, session_id, item_id, answer_type, value, first_value,
         option_order, confirm, prediction, signals, presented_at, answered_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (player_id, session_id, item_id) DO NOTHING`,
      [
        r.playerId,
        r.sessionId,
        r.itemId,
        r.answerType,
        JSON.stringify(r.value),
        JSON.stringify(r.firstValue),
        r.optionOrder,
        JSON.stringify(r.confirm),
        r.prediction ? JSON.stringify(r.prediction) : null,
        r.signals ? JSON.stringify(r.signals) : null,
        r.presentedAt,
        r.answeredAt,
      ],
    )
    return (res.rowCount ?? 0) > 0
  }

  async activeItems(): Promise<Item[]> {
    const { rows } = await this.pool.query('SELECT data FROM items WHERE active ORDER BY id')
    return rows.map((r) => r.data as Item)
  }

  async getItem(id: string): Promise<Item | null> {
    const { rows } = await this.pool.query('SELECT data FROM items WHERE id = $1', [id])
    return rows[0] ? (rows[0].data as Item) : null
  }

  async upsertItems(items: Item[]) {
    for (const item of items) {
      await this.pool.query(
        `INSERT INTO items (id, data) VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
        [item.id, JSON.stringify(item)],
      )
    }
  }

  async crowdRows(itemId: string): Promise<CrowdRow[]> {
    const { rows } = await this.pool.query('SELECT value, prediction FROM responses WHERE item_id = $1', [itemId])
    return rows
  }

  async answeredItemIds(playerId: string): Promise<Set<string>> {
    const { rows } = await this.pool.query('SELECT DISTINCT item_id FROM responses WHERE player_id = $1', [
      playerId,
    ])
    return new Set(rows.map((r) => r.item_id as string))
  }

  /** Returns the day's shared items, storing `draw()` the first time the day is asked for. */
  async dailyShared(day: string, draw: () => string[]): Promise<string[]> {
    await this.pool.query(
      'INSERT INTO daily_sets (day, shared_item_ids) VALUES ($1, $2) ON CONFLICT (day) DO NOTHING',
      [day, draw()],
    )
    const { rows } = await this.pool.query('SELECT shared_item_ids FROM daily_sets WHERE day = $1', [day])
    return rows[0].shared_item_ids
  }

  async exportPlayer(id: string) {
    const player = await this.pool.query('SELECT * FROM players WHERE id = $1', [id])
    if (!player.rows[0]) return null
    const responses = await this.pool.query(
      'SELECT * FROM responses WHERE player_id = $1 ORDER BY answered_at',
      [id],
    )
    return { player: player.rows[0], responses: responses.rows }
  }

  /** Deletes the player and, by cascade, all their responses. */
  async deletePlayer(id: string): Promise<boolean> {
    const res = await this.pool.query('DELETE FROM players WHERE id = $1', [id])
    return (res.rowCount ?? 0) > 0
  }

  /** Deletes responses past retention, then players left with no responses and older than it. */
  async purge(retentionDays: number): Promise<{ responses: number; players: number }> {
    const r = await this.pool.query(
      `DELETE FROM responses WHERE received_at < now() - make_interval(days => $1)`,
      [retentionDays],
    )
    const p = await this.pool.query(
      `DELETE FROM players p WHERE created_at < now() - make_interval(days => $1)
         AND NOT EXISTS (SELECT 1 FROM responses r WHERE r.player_id = p.id)`,
      [retentionDays],
    )
    return { responses: r.rowCount ?? 0, players: p.rowCount ?? 0 }
  }
}
