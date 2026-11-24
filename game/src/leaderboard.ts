import { defaultPrediction, scoreCard, type CardScore } from './scoring'
import type { CrowdSource, Item, ResponseRecord } from './types'

/**
 * Local guess-the-crowd leaderboard. It lives in this browser only and is
 * never sent to the server (server collection is off until the ethics
 * review). Several people sharing a device each type a name.
 *
 * Sets differ in length (text cards have no guess), so entries rank by the
 * average score per guess, 0 to 100 plus any truth bonus.
 */
export interface LeaderboardEntry {
  id: string
  name: string
  /** Average points per guessed card, rounded. */
  average: number
  /** Total points over the set. */
  total: number
  guesses: number
  at: string
  /** Which crowd the set was scored against. */
  crowd: CrowdSource | 'mixed'
}

export const LEADERBOARD_SIZE = 10
const KEEP = 50

export interface SetScore {
  scores: CardScore[]
  total: number
  average: number
  /** What Clu scores by always guessing an even split, on the same cards. */
  evenSplit: number
  crowd: LeaderboardEntry['crowd']
}

export function scoreSet(items: Item[], responses: ResponseRecord[]): SetScore {
  const byId = new Map(items.map((i) => [i.id, i]))
  const scores: CardScore[] = []
  const baseline: number[] = []
  const sources = new Set<CrowdSource>()
  for (const r of responses) {
    const item = byId.get(r.itemId)
    if (!item) continue
    const s = scoreCard(item, r)
    if (!s) continue
    scores.push(s)
    if (item.crowd) sources.add(item.crowd.source)
    const even = scoreCard(item, { ...r, prediction: defaultPrediction(item) })
    baseline.push(even ? even.prediction : 0)
  }
  const total = scores.reduce((sum, s) => sum + s.prediction + s.bonus, 0)
  const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0)
  return {
    scores,
    total,
    average: scores.length ? Math.round(total / scores.length) : 0,
    evenSplit: avg(baseline),
    crowd: sources.size === 1 ? [...sources][0] : sources.size ? 'mixed' : 'placeholder',
  }
}

function rank(a: LeaderboardEntry, b: LeaderboardEntry): number {
  return b.average - a.average || b.total - a.total || (a.at < b.at ? -1 : 1)
}

/** Adds an entry, keeps the best ones, and returns the list in rank order. */
export function addEntry(board: LeaderboardEntry[], entry: LeaderboardEntry): LeaderboardEntry[] {
  return [...board.filter((e) => e.id !== entry.id), entry].sort(rank).slice(0, KEEP)
}

/** 1-based place of an entry, or null. */
export function placeOf(board: LeaderboardEntry[], id: string): number | null {
  const i = [...board].sort(rank).findIndex((e) => e.id === id)
  return i < 0 ? null : i + 1
}

export function sanitiseName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 20)
}
