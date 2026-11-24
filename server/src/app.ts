import cors from '@fastify/cors'
import Fastify, { type FastifyReply } from 'fastify'
import { z } from 'zod'
import type { Item } from '../../game/src/types.ts'
import type { Config } from './config.ts'
import { computeCrowd } from './crowd.ts'
import { drawAdaptive, drawShared, today } from './daily.ts'
import { consentSchema, responseSchema, type ResponseInput } from './schemas.ts'
import type { Store } from './store.ts'

const uuid = z.string().uuid()

export function buildApp(config: Config, store: Store, opts: { logger?: boolean } = {}) {
  const app = Fastify({
    // Logs never carry IP addresses, query strings or player IDs: only the route pattern.
    logger: opts.logger
      ? {
          serializers: {
            req: (req) => ({ method: req.method, route: req.routeOptions?.url }),
            res: (res) => ({ statusCode: res.statusCode }),
          },
        }
      : false,
    trustProxy: false,
    bodyLimit: 16 * 1024,
  })

  app.register(cors, { origin: config.allowedOrigin, methods: ['GET', 'POST', 'PUT', 'DELETE'] })

  const collectionOff = (reply: FastifyReply) =>
    reply.code(503).send({
      error: 'collection_disabled',
      message: 'Data collection is off until the ethics review is complete. Answers stay in your browser.',
    })

  app.get('/health', async () => ({ ok: true, collectionEnabled: config.collectionEnabled }))

  /** Record or update consent. The player ID is random and generated in the browser. */
  app.put<{ Params: { id: string } }>('/players/:id', async (req, reply) => {
    if (!config.collectionEnabled) return collectionOff(reply)
    const id = uuid.safeParse(req.params.id)
    const consent = consentSchema.safeParse(req.body)
    if (!id.success || !consent.success) return reply.code(400).send({ error: 'invalid_consent' })
    await store.upsertPlayer(id.data, consent.data)
    return reply.code(204).send()
  })

  app.post('/responses', async (req, reply) => {
    if (!config.collectionEnabled) return collectionOff(reply)
    const parsed = responseSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_response', issues: parsed.error.issues })
    const r = parsed.data

    const player = await store.getPlayer(r.playerId)
    if (!player) return reply.code(403).send({ error: 'no_consent' })
    const item = await store.getItem(r.itemId)
    if (!item) return reply.code(400).send({ error: 'unknown_item' })
    const problem = checkAgainstItem(item, r)
    if (problem) return reply.code(400).send({ error: 'invalid_response', message: problem })

    // Without the opt-in, hesitation signals are dropped, whatever the client sent.
    const stored = await store.insertResponse({ ...r, signals: player.uncertaintyTracking ? r.signals : null })
    return reply.code(stored ? 201 : 200).send({ stored })
  })

  /** Today's cards: shared items for everyone, then adaptive picks for this player. */
  app.get<{ Querystring: { playerId?: string } }>('/items/today', async (req, reply) => {
    const items = await store.activeItems()
    const day = today()
    const shared = await store.dailyShared(day, () => drawShared(items, day, config.sharedPerDay))
    let answered = new Set<string>()
    let seed = `anon:${day}`
    if (req.query.playerId) {
      const id = uuid.safeParse(req.query.playerId)
      if (!id.success) return reply.code(400).send({ error: 'invalid_player' })
      answered = await store.answeredItemIds(id.data)
      seed = `${id.data}:${day}`
    }
    // A player never gets a card twice: shared cards they already answered are
    // skipped, and adaptive picks fill their places.
    const sharedFresh = shared.filter((id) => !answered.has(id))
    const want = config.adaptivePerDay + shared.length - sharedFresh.length
    const adaptive = drawAdaptive(items, answered, new Set(shared), seed, want)
    const byId = new Map(items.map((i) => [i.id, i]))
    // Crowd stats are left out on purpose: they are revealed only after answering.
    const strip = ({ crowd: _crowd, ...rest }: Item) => rest
    return {
      day,
      shared: sharedFresh.flatMap((id) => (byId.has(id) ? [strip(byId.get(id)!)] : [])),
      adaptive: adaptive.map((id) => strip(byId.get(id)!)),
    }
  })

  /** Crowd split for one item: live once enough players answered, else the item's placeholder. */
  app.get<{ Params: { id: string } }>('/items/:id/crowd', async (req, reply) => {
    const item = await store.getItem(req.params.id)
    if (!item) return reply.code(404).send({ error: 'unknown_item' })
    const live = computeCrowd(item, await store.crowdRows(item.id), config.minCrowd)
    return { itemId: item.id, crowd: live ?? item.crowd ?? null }
  })

  /** GDPR access and portability: always available, even with collection off. */
  app.get<{ Params: { id: string } }>('/players/:id/export', async (req, reply) => {
    const id = uuid.safeParse(req.params.id)
    if (!id.success) return reply.code(400).send({ error: 'invalid_player' })
    const data = await store.exportPlayer(id.data)
    return data ? data : reply.code(404).send({ error: 'not_found' })
  })

  /** GDPR erasure: deletes the player and every response. Always available. */
  app.delete<{ Params: { id: string } }>('/players/:id', async (req, reply) => {
    const id = uuid.safeParse(req.params.id)
    if (!id.success) return reply.code(400).send({ error: 'invalid_player' })
    await store.deletePlayer(id.data)
    return reply.code(204).send()
  })

  return app
}

/** The answer must fit the item it claims to answer. */
export function checkAgainstItem(item: Item, r: ResponseInput): string | null {
  const a = item.answer
  if (a.type !== r.answerType) return `item ${item.id} is a ${a.type} item`
  if (a.type === 'choice' || a.type === 'binary') {
    const keys = new Set(a.options.map((o) => o.key))
    if (typeof r.value !== 'string' || !keys.has(r.value)) return 'value is not an option of this item'
    if (typeof r.firstValue !== 'string' || !keys.has(r.firstValue)) return 'firstValue is not an option'
    if (r.prediction && r.prediction.kind !== 'shares') return 'prediction must be shares'
    if (r.prediction?.kind === 'shares' && !Object.keys(r.prediction.shares).every((k) => keys.has(k))) {
      return 'prediction has unknown options'
    }
  }
  if (a.type === 'slider') {
    if (typeof r.value !== 'number' || typeof r.firstValue !== 'number') return 'slider value must be a number'
    if (r.prediction && r.prediction.kind !== 'mean') return 'prediction must be a mean'
  }
  if (a.type === 'text') {
    if (typeof r.value !== 'string' || r.value.length > a.maxLength) return 'text too long'
    if (r.prediction) return 'text items take no prediction'
  }
  return null
}
