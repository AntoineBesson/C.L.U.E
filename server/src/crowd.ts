import type { CrowdStats, Item } from '../../game/src/types.ts'

const EPS = 0.01

export interface CrowdRow {
  value: unknown
  prediction: unknown
}

/**
 * Crowd statistics for one item from its responses: the answer split and the
 * geometric mean of predicted shares (the two inputs of the BTS score), or the
 * mean for slider items. Returns null below `minCrowd` responses, so small
 * groups are never published.
 */
export function computeCrowd(item: Item, rows: CrowdRow[], minCrowd: number): CrowdStats | null {
  const a = item.answer
  if (a.type === 'text') return null

  if (a.type === 'slider') {
    const values = rows.map((r) => r.value).filter((v): v is number => typeof v === 'number')
    if (values.length < minCrowd) return null
    const mean = values.reduce((s, v) => s + v, 0) / values.length
    return { kind: 'mean', source: 'humans', n: values.length, mean: round(mean, 1) }
  }

  const keys = a.options.map((o) => o.key)
  const counts: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]))
  const logSum: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]))
  let n = 0
  let nPred = 0
  for (const r of rows) {
    if (typeof r.value !== 'string' || !(r.value in counts)) continue
    counts[r.value]++
    n++
    const shares = predictionShares(r.prediction)
    if (shares) {
      nPred++
      for (const k of keys) logSum[k] += Math.log(Math.max(shares[k] ?? 0, EPS))
    }
  }
  if (n < minCrowd) return null

  return {
    kind: 'shares',
    source: 'humans',
    n,
    answerShare: Object.fromEntries(keys.map((k) => [k, round(counts[k] / n, 4)])),
    predictedShare: Object.fromEntries(
      keys.map((k) => [k, nPred ? round(Math.exp(logSum[k] / nPred), 4) : round(1 / keys.length, 4)]),
    ),
  }
}

function predictionShares(p: unknown): Record<string, number> | null {
  if (p && typeof p === 'object' && (p as { kind?: string }).kind === 'shares') {
    return (p as { shares: Record<string, number> }).shares
  }
  return null
}

function round(x: number, digits: number): number {
  const f = 10 ** digits
  return Math.round(x * f) / f
}
