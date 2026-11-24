import seed from '../../items/seed.json'
import { simulatedFor, withSimulatedCrowd } from './crowd'
import type { Item } from './types'

/** Draft batches (items/drafts/*.json). Only drafts that passed the agent gate are played. */
const draftFiles = import.meta.glob<{ default: Item[] }>('../../items/drafts/*.json', { eager: true })
export const DRAFTS: Item[] = Object.values(draftFiles).flatMap((m) => m.default)

const SEED = seed as Item[]
const seedIds = new Set(SEED.map((i) => i.id))

/** Every playable item: the seed bank, plus drafts that passed the gate on their current wording. */
export const ITEMS: Item[] = [
  ...SEED,
  ...DRAFTS.filter((d) => !seedIds.has(d.id) && simulatedFor(d)?.gate === true),
].map((i) => withSimulatedCrowd(i))

export function shuffle<T>(xs: readonly T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Up to n items this player has not seen yet. Never repeats a card: when
 * fewer than n are left, the set is shorter; when none are left, it is empty
 * and the game says the bank is done.
 */
export function pickSession(n: number, seen: ReadonlySet<string>, bank: readonly Item[] = ITEMS): Item[] {
  return shuffle(bank.filter((i) => !seen.has(i.id))).slice(0, n)
}

/**
 * Today's cards from the server, minus any this player has seen on this
 * device, topped up from the local bank. The server only knows answers it
 * stored, and stores none while collection is off.
 */
export function mergeServerSet(
  server: Item[],
  n: number,
  seen: ReadonlySet<string>,
  bank: readonly Item[] = ITEMS,
): Item[] {
  const fresh = server.filter((i) => !seen.has(i.id)).slice(0, n).map((i) => withSimulatedCrowd(i))
  const taken = new Set([...seen, ...fresh.map((i) => i.id)])
  return [...fresh, ...pickSession(n - fresh.length, taken, bank)]
}
