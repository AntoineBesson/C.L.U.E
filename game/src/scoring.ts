import type { CrowdPrediction, CrowdStats, Item, ResponseRecord } from './types'

/**
 * Scoring follows the spec: the answer itself is never scored. Players earn
 * points for predicting the crowd, plus a Bayesian Truth Serum bonus when
 * their own answer turns out more common than the crowd predicted
 * (Prelec, Science 2004).
 */

const EPS = 0.01

export interface CardScore {
  itemId: string
  /** 0 to 100: how close the prediction landed. */
  prediction: number
  /** 0 or more: BTS information bonus for the player's own answer. */
  bonus: number
  /** Share of the crowd that answered like the player (choice/binary only). */
  sameAsYou: number | null
}

/** Rescale non-negative weights to shares that sum to 1. */
export function normalise(weights: Record<string, number>): Record<string, number> {
  const total = Object.values(weights).reduce((a, b) => a + Math.max(0, b), 0)
  const keys = Object.keys(weights)
  return Object.fromEntries(
    keys.map((k) => [k, total > 0 ? Math.max(0, weights[k]) / total : 1 / keys.length]),
  )
}

/**
 * BTS prediction score, exp(sum_j x_j * log(y_j / x_j)), mapped to 0-100.
 * Equals 100 when the prediction matches the actual split exactly.
 */
export function predictionPoints(predicted: Record<string, number>, actual: Record<string, number>): number {
  let s = 0
  for (const [k, x] of Object.entries(actual)) {
    if (x <= 0) continue
    s += x * Math.log(Math.max(predicted[k] ?? 0, EPS) / x)
  }
  return Math.round(100 * Math.exp(s))
}

/**
 * BTS information score for the chosen option, log(x_k / y_k), where y_k is
 * the geometric mean of everyone's predictions. Shown only when positive:
 * a "surprisingly common" answer earns points, any other answer earns none.
 */
export function btsBonus(choice: string, crowd: Extract<CrowdStats, { kind: 'shares' }>): number {
  const x = crowd.answerShare[choice] ?? 0
  const y = crowd.predictedShare[choice] ?? 0
  if (x <= 0) return 0
  return Math.max(0, Math.round(50 * Math.log(x / Math.max(y, EPS))))
}

export function scoreCard(item: Item, r: ResponseRecord): CardScore | null {
  const crowd = item.crowd
  const p = r.prediction
  if (!crowd || !p) return null
  if (crowd.kind === 'shares' && p.kind === 'shares' && typeof r.value === 'string') {
    return {
      itemId: item.id,
      prediction: predictionPoints(normalise(p.shares), crowd.answerShare),
      bonus: btsBonus(r.value, crowd),
      sameAsYou: crowd.answerShare[r.value] ?? 0,
    }
  }
  if (crowd.kind === 'mean' && p.kind === 'mean') {
    return {
      itemId: item.id,
      prediction: Math.max(0, Math.round(100 - Math.abs(p.mean - crowd.mean))),
      bonus: 0,
      sameAsYou: null,
    }
  }
  return null
}

export function defaultPrediction(item: Item): CrowdPrediction | null {
  const a = item.answer
  if (a.type === 'choice' || a.type === 'binary') {
    return { kind: 'shares', shares: Object.fromEntries(a.options.map((o) => [o.key, 50])) }
  }
  if (a.type === 'slider') return { kind: 'mean', mean: 50 }
  return null
}
