import { createHash } from 'node:crypto'
import type { Item } from '../../game/src/types.ts'

/** Deterministic pseudo-random order for a given seed (same day, same order). */
export function seededOrder<T extends { id: string }>(xs: T[], seed: string): T[] {
  const h = (id: string) => createHash('sha256').update(`${seed}:${id}`).digest('hex')
  return [...xs].sort((a, b) => (h(a.id) < h(b.id) ? -1 : 1))
}

/** The shared items for a day: same for every player. */
export function drawShared(items: Item[], day: string, count: number): string[] {
  return seededOrder(items, `shared:${day}`)
    .slice(0, count)
    .map((i) => i.id)
}

/** Traits an item can tell us about. */
export function itemTraits(item: Item): string[] {
  const a = item.answer
  if (a.type === 'choice' || a.type === 'binary') {
    return [...new Set(a.options.flatMap((o) => Object.keys(o.keyed)))]
  }
  if (a.type === 'slider') return Object.keys(a.keyed)
  return []
}

/**
 * Adaptive picks. Placeholder for the spec's expected-entropy-reduction rule:
 * prefer unseen items that touch the traits this player has the least
 * evidence on. Ties break on a per-player, per-day order. Answered items
 * never come back: when unseen items run out, the set is shorter.
 */
export function drawAdaptive(
  items: Item[],
  answeredIds: Set<string>,
  exclude: Set<string>,
  playerSeed: string,
  count: number,
): string[] {
  const evidence: Record<string, number> = {}
  for (const item of items) {
    if (!answeredIds.has(item.id)) continue
    for (const t of itemTraits(item)) evidence[t] = (evidence[t] ?? 0) + 1
  }
  const candidates = seededOrder(
    items.filter((i) => !answeredIds.has(i.id) && !exclude.has(i.id)),
    playerSeed,
  )
  const gain = (i: Item) => {
    const ts = itemTraits(i)
    // Text items carry no keyed evidence; keep them last but still reachable.
    return ts.length ? ts.reduce((s, t) => s + 1 / (1 + (evidence[t] ?? 0)), 0) / ts.length : 0
  }
  return candidates
    .map((item, order) => ({ item, order, g: gain(item) }))
    .sort((x, y) => y.g - x.g || x.order - y.order)
    .map((c) => c.item.id)
    .slice(0, count)
}

/** Calendar day in Europe/Paris, as YYYY-MM-DD. */
export function today(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(now)
}
