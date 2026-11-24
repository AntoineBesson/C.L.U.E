import { normalise, predictionPoints } from './scoring'
import type { AnswerValue, CrowdPrediction, Item } from './types'

/**
 * Pass-and-play rooms: friends share one phone. Each player answers the card,
 * then guesses how others answered: either the room itself, or the database
 * (the simulated crowd) when that option is on.
 *
 * Room answers live in memory for the game only. They are not saved or sent:
 * the consent given on this device covers its owner, not their friends.
 */

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 8

export type RoomTarget = 'room' | 'database'

export interface RoomTurn {
  player: number
  value: AnswerValue
  prediction: CrowdPrediction
}

export type RoomSplit =
  | { kind: 'shares'; n: number; answerShare: Record<string, number> }
  | { kind: 'mean'; n: number; mean: number }

/** Cards that work in a room: something to guess, and a database split when that is the target. */
export function roomPlayable(item: Item, target: RoomTarget): boolean {
  if (item.answer.type === 'text') return false
  return target === 'room' || item.crowd !== undefined
}

/** How the room answered one card. */
export function roomSplit(item: Item, turns: RoomTurn[]): RoomSplit {
  const a = item.answer
  if (a.type === 'slider') {
    const vals = turns.map((t) => Number(t.value))
    return { kind: 'mean', n: vals.length, mean: vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : 50 }
  }
  const keys = a.type === 'text' ? [] : a.options.map((o) => o.key)
  const counts = Object.fromEntries(keys.map((k) => [k, 0]))
  for (const t of turns) if (typeof t.value === 'string' && t.value in counts) counts[t.value]++
  const n = Object.values(counts).reduce((x, y) => x + y, 0)
  return { kind: 'shares', n, answerShare: Object.fromEntries(keys.map((k) => [k, n ? counts[k] / n : 0])) }
}

/** The split a turn is scored against. */
export function targetSplit(item: Item, turns: RoomTurn[], target: RoomTarget): RoomSplit | null {
  if (target === 'room') return roomSplit(item, turns)
  const c = item.crowd
  if (!c) return null
  return c.kind === 'shares' ? { kind: 'shares', n: c.n, answerShare: c.answerShare } : { kind: 'mean', n: c.n, mean: c.mean }
}

/** 0 to 100, same scale as solo play. */
export function turnPoints(prediction: CrowdPrediction, split: RoomSplit): number {
  if (split.kind === 'shares' && prediction.kind === 'shares') {
    return predictionPoints(normalise(prediction.shares), split.answerShare)
  }
  if (split.kind === 'mean' && prediction.kind === 'mean') {
    return Math.max(0, Math.round(100 - Math.abs(prediction.mean - split.mean)))
  }
  return 0
}

/** Points per player for one card. */
export function cardPoints(item: Item, turns: RoomTurn[], target: RoomTarget): Record<number, number> {
  const split = targetSplit(item, turns, target)
  return Object.fromEntries(turns.map((t) => [t.player, split ? turnPoints(t.prediction, split) : 0]))
}

/** Players ranked by total points; ties share a place. */
export function standings(names: string[], totals: number[]): { name: string; total: number; place: number }[] {
  const rows = names.map((name, i) => ({ name, total: totals[i] ?? 0 })).sort((a, b) => b.total - a.total)
  return rows.map((r) => ({ ...r, place: rows.findIndex((x) => x.total === r.total) + 1 }))
}
