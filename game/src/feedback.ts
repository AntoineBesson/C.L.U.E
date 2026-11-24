import { normalise } from './scoring'
import type { CrowdPrediction, CrowdStats, Item } from './types'

/**
 * Words for how a guess went. Several versions per tier, picked at random,
 * so the reveal does not say the same thing every card.
 */

export type Tier = 'perfect' | 'great' | 'good' | 'meh' | 'miss'

export function tier(points: number): Tier {
  if (points >= 90) return 'perfect'
  if (points >= 75) return 'great'
  if (points >= 55) return 'good'
  if (points >= 35) return 'meh'
  return 'miss'
}

export const VERDICTS: Record<Tier, string[]> = {
  perfect: [
    'Spot on!',
    'Mind reader!',
    'Did you peek?',
    'Bullseye!',
    'You are the crowd.',
    'Uncanny.',
    'Nailed it.',
  ],
  great: [
    'Great read!',
    'Sharp instincts.',
    'Very close!',
    'You know people.',
    'Smooth.',
    'Almost psychic.',
  ],
  good: [
    'Not bad.',
    'Decent read.',
    'In the right ballpark.',
    'Half a mind reader.',
    'Getting warmer.',
  ],
  meh: [
    'Hmm, close-ish.',
    'The crowd had other ideas.',
    'A bit off.',
    'Some of it landed.',
    'People are tricky.',
  ],
  miss: [
    'The crowd surprised you!',
    'Plot twist!',
    'Nobody saw that coming. Well, you didn’t.',
    'Way off, but bold.',
    'People are strange.',
    'That one got away.',
  ],
}

/** Words for a whole set, from its average score. */
export const SET_VERDICTS: Record<Tier, string[]> = {
  perfect: ['You read the room like a book.', 'Crowd whisperer.', 'Frighteningly accurate.'],
  great: ['A seriously good read of people.', 'Strong set: you get how people think.', 'Impressive people sense.'],
  good: ['A solid set.', 'More right than wrong.', 'Decent people sense, room to grow.'],
  meh: ['People kept surprising you.', 'A tricky set.', 'The crowd was hard to read today.'],
  miss: ['The crowd thinks nothing like you expect.', 'A humbling set.', 'People: still a mystery.'],
}

export function pick<T>(xs: readonly T[], rand: () => number = Math.random): T {
  return xs[Math.floor(rand() * xs.length) % xs.length]
}

export function verdict(points: number, rand?: () => number): string {
  return pick(VERDICTS[tier(points)], rand)
}

export function setVerdict(average: number, rand?: () => number): string {
  return pick(SET_VERDICTS[tier(average)], rand)
}

function quote(text: string): string {
  const t = text.replace(/\.$/, '')
  return `“${t.length > 48 ? t.slice(0, 46).trimEnd() + '…' : t}”`
}

/**
 * One sentence on where the guess was most off (or how close it was), e.g.
 * "You expected 22% for "Walk off mid-story"; it was 48%."
 */
export function insight(item: Item, prediction: CrowdPrediction, crowd: CrowdStats, rand?: () => number): string | null {
  const a = item.answer
  if (crowd.kind === 'mean' && prediction.kind === 'mean') {
    const diff = Math.round(prediction.mean - crowd.mean)
    const real = Math.round(crowd.mean)
    if (Math.abs(diff) <= 3) return pick([`Average ${real}: you were within ${Math.max(1, Math.abs(diff))}.`, `${real} on average. Dead on.`], rand)
    return diff > 0
      ? pick([`You guessed ${prediction.mean}, the average was ${real}: ${diff} too high.`, `People sat lower than you thought: ${real}, not ${prediction.mean}.`], rand)
      : pick([`You guessed ${prediction.mean}, the average was ${real}: ${-diff} too low.`, `People went further than you thought: ${real}, not ${prediction.mean}.`], rand)
  }
  if (crowd.kind !== 'shares' || prediction.kind !== 'shares' || (a.type !== 'choice' && a.type !== 'binary')) return null
  const guess = normalise(prediction.shares)
  let worst = a.options[0]
  let gap = 0
  for (const o of a.options) {
    const d = (crowd.answerShare[o.key] ?? 0) - (guess[o.key] ?? 0)
    if (Math.abs(d) > Math.abs(gap)) {
      gap = d
      worst = o
    }
  }
  const real = Math.round((crowd.answerShare[worst.key] ?? 0) * 100)
  const g = Math.round((guess[worst.key] ?? 0) * 100)
  if (Math.abs(gap) < 0.06) return pick(['Every option within 5 points.', 'Your split was almost exactly right.'], rand)
  return gap > 0
    ? pick([
        `You underestimated ${quote(worst.text)}: ${real}%, not ${g}%.`,
        `${quote(worst.text)} was more popular than you thought (${real}% vs your ${g}%).`,
      ], rand)
    : pick([
        `You overestimated ${quote(worst.text)}: only ${real}%, not ${g}%.`,
        `Fewer picked ${quote(worst.text)} than you thought (${real}% vs your ${g}%).`,
      ], rand)
}
