import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Item } from '../../game/src/types.ts'
import { buildApp } from './app.ts'
import { loadConfig } from './config.ts'
import { migrate } from './scripts/migrate.ts'
import { Store } from './store.ts'

/**
 * Integration tests against a real Postgres. Set TEST_DATABASE_URL to a
 * throwaway database: the tests drop and recreate its public schema.
 * CI provides one (see .github/workflows/ci.yml).
 */
const url = process.env.TEST_DATABASE_URL
const items = JSON.parse(readFileSync(join(import.meta.dirname, '../../items/seed.json'), 'utf8')) as Item[]

const player = '11111111-1111-4111-8111-111111111111'
const session = '22222222-2222-4222-8222-222222222222'
const consent = {
  version: '2026-11-23',
  givenAt: '2026-11-23T08:00:00.000Z',
  adult: true,
  research: true,
  uncertaintyTracking: false,
}
const signals = {
  msToFirstInteraction: 900,
  msToFirstValidate: 2000,
  msTotal: 2500,
  answerChanges: 1,
  distinctOptionsTried: 2,
  optionHoverSwitches: 3,
  pointerTravel: 1.2,
  sliderReversals: 0,
  sliderTravel: 0,
  charsTyped: 0,
  charsDeleted: 0,
  pastes: 0,
  longestPauseMs: 800,
  focusLosses: 0,
}
const response = {
  playerId: player,
  sessionId: session,
  itemId: 'q0002',
  answerType: 'binary',
  value: 'A',
  firstValue: 'B',
  optionOrder: ['B', 'A'],
  confirm: { shown: true, reconsidered: 1, changedAfterPrompt: true, msOnPrompt: 1200 },
  prediction: { kind: 'shares', shares: { A: 0.6, B: 0.4 } },
  signals,
  presentedAt: '2026-11-23T08:01:00.000Z',
  answeredAt: '2026-11-23T08:01:05.000Z',
}

describe.skipIf(!url)('API (Postgres)', () => {
  let store: Store
  const config = { ...loadConfig({}), collectionEnabled: true, minCrowd: 1 }
  let app: ReturnType<typeof buildApp>

  beforeAll(async () => {
    store = Store.connect(url!)
    await store.pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
    await migrate(store)
    await store.upsertItems(items)
    app = buildApp(config, store)
  })
  afterAll(async () => {
    await app.close()
    await store.close()
  })

  it('refuses answers before consent', async () => {
    const res = await app.inject({ method: 'POST', url: '/responses', payload: response })
    expect(res.statusCode).toBe(403)
  })

  it('stores consent, then answers, and drops signals without the opt-in', async () => {
    expect((await app.inject({ method: 'PUT', url: `/players/${player}`, payload: consent })).statusCode).toBe(204)
    const res = await app.inject({ method: 'POST', url: '/responses', payload: response })
    expect(res.statusCode).toBe(201)
    const { rows } = await store.pool.query('SELECT signals, value FROM responses')
    expect(rows).toEqual([{ signals: null, value: 'A' }])
  })

  it('ignores a retried upload of the same card', async () => {
    const res = await app.inject({ method: 'POST', url: '/responses', payload: response })
    expect(res.json()).toEqual({ stored: false })
  })

  it('keeps signals when the player opted in', async () => {
    await app.inject({ method: 'PUT', url: `/players/${player}`, payload: { ...consent, uncertaintyTracking: true } })
    await app.inject({ method: 'POST', url: '/responses', payload: { ...response, itemId: 'q0005' } })
    const { rows } = await store.pool.query("SELECT signals FROM responses WHERE item_id = 'q0005'")
    expect(rows[0].signals).toEqual(signals)
  })

  it('rejects raw traces and answers that do not fit the item', async () => {
    const raw = { ...response, signals: { ...signals, keystrokes: [{ k: 'a', t: 1 }] } }
    expect((await app.inject({ method: 'POST', url: '/responses', payload: raw })).statusCode).toBe(400)
    const wrong = { ...response, itemId: 'q0003' } // a slider item
    expect((await app.inject({ method: 'POST', url: '/responses', payload: wrong })).statusCode).toBe(400)
    const badKey = { ...response, itemId: 'q0001', answerType: 'choice', value: 'Z' }
    expect((await app.inject({ method: 'POST', url: '/responses', payload: badKey })).statusCode).toBe(400)
  })

  it('serves a daily set without crowd numbers, and crowd stats on request', async () => {
    const res = await app.inject({ method: 'GET', url: `/items/today?playerId=${player}` })
    const body = res.json()
    expect(body.shared).toHaveLength(3)
    expect(body.adaptive).toHaveLength(2)
    expect(JSON.stringify(body)).not.toContain('answerShare')
    const ids = [...body.shared, ...body.adaptive].map((i: Item) => i.id)
    expect(new Set(ids).size).toBe(5)

    const crowd = (await app.inject({ method: 'GET', url: '/items/q0002/crowd' })).json()
    expect(crowd.crowd).toMatchObject({ kind: 'shares', source: 'humans', n: 1, answerShare: { A: 1, B: 0 } })
  })

  it('exports and deletes everything about a player', async () => {
    const exp = (await app.inject({ method: 'GET', url: `/players/${player}/export` })).json()
    expect(exp.responses).toHaveLength(2)
    expect((await app.inject({ method: 'DELETE', url: `/players/${player}` })).statusCode).toBe(204)
    const { rows } = await store.pool.query('SELECT count(*)::int AS n FROM responses')
    expect(rows[0].n).toBe(0)
  })

  it('accepts nothing when collection is off, but still allows deletion', async () => {
    const off = buildApp({ ...config, collectionEnabled: false }, store)
    expect((await off.inject({ method: 'PUT', url: `/players/${player}`, payload: consent })).statusCode).toBe(503)
    expect((await off.inject({ method: 'POST', url: '/responses', payload: response })).statusCode).toBe(503)
    expect((await off.inject({ method: 'DELETE', url: `/players/${player}` })).statusCode).toBe(204)
    await off.close()
  })
})
