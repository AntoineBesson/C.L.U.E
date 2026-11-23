import seed from '../../items/seed.json'
import type { Item } from './types'

export const ITEMS = seed as Item[]

export function shuffle<T>(xs: readonly T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Placeholder for the daily set (3 shared + 2 adaptive in the spec). */
export function pickSession(n: number): Item[] {
  return shuffle(ITEMS).slice(0, n)
}
