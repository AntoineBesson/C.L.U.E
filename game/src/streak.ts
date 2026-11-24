/**
 * Daily streak: consecutive calendar days (Europe/Paris, like the server's
 * daily set) on which the player answered at least one solo card. Kept in
 * this browser only.
 */
export interface Streak {
  current: number
  best: number
  /** Last day played, YYYY-MM-DD. */
  lastDay: string | null
}

export const EMPTY_STREAK: Streak = { current: 0, best: 0, lastDay: null }

export function dayOf(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(d)
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000)
}

/** The streak after playing on `today`. */
export function played(s: Streak, today: string): Streak {
  if (s.lastDay === today) return s
  const gap = s.lastDay ? daysBetween(s.lastDay, today) : Infinity
  const current = gap === 1 ? s.current + 1 : 1
  return { current, best: Math.max(s.best, current), lastDay: today }
}

/** The streak as it stands today: broken if yesterday was missed. */
export function asOf(s: Streak, today: string): Streak {
  if (!s.lastDay) return s
  return daysBetween(s.lastDay, today) > 1 ? { ...s, current: 0 } : s
}

/** Played today already? */
export function doneToday(s: Streak, today: string): boolean {
  return s.lastDay === today
}

/** Hot hand: great reads (75+) in a row within a set. */
export const HOT_THRESHOLD = 75

export function hotHand(points: number[]): number {
  let n = 0
  for (let i = points.length - 1; i >= 0 && points[i] >= HOT_THRESHOLD; i--) n++
  return n
}
