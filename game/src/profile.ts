import type { Item, ResponseRecord } from './types'

/**
 * A deliberately rough profile for the reveal: average of the trait keys
 * behind each answer. It is a placeholder for the nominal response model in
 * the spec, so the error bars are wide and labelled as such.
 */

export const TRAIT_LABELS: Record<string, string> = {
  care: 'Care',
  equality: 'Equality',
  proportionality: 'Proportionality',
  loyalty: 'Loyalty',
  authority: 'Authority',
  purity: 'Purity',
  instrumental_harm: 'Accepting harm for the greater good',
  impartial_beneficence: 'Impartial beneficence',
  machiavellianism: 'Machiavellianism',
  narcissism: 'Narcissism',
  psychopathy: 'Psychopathy',
  honesty_humility: 'Honesty-humility',
  emotionality: 'Emotionality',
  extraversion: 'Extraversion',
  agreeableness: 'Agreeableness',
  conscientiousness: 'Conscientiousness',
  openness: 'Openness',
}

export interface TraitEstimate {
  trait: string
  label: string
  /** -1 (low) to 1 (high). */
  value: number
  /** Half-width of a rough interval, shrinking with evidence. */
  spread: number
  /** Answers that touched this trait. */
  evidence: number
}

export function estimateTraits(items: Item[], responses: ResponseRecord[]): TraitEstimate[] {
  const byId = new Map(items.map((i) => [i.id, i]))
  const sum: Record<string, number> = {}
  const n: Record<string, number> = {}
  const add = (trait: string, v: number) => {
    sum[trait] = (sum[trait] ?? 0) + v
    n[trait] = (n[trait] ?? 0) + 1
  }

  for (const r of responses) {
    const item = byId.get(r.itemId)
    if (!item) continue
    const a = item.answer
    if ((a.type === 'choice' || a.type === 'binary') && typeof r.value === 'string') {
      const chosen = a.options.find((o) => o.key === r.value)
      // Choosing an option is evidence for its trait; with several options
      // the others are weak evidence against theirs.
      // One answer is one piece of evidence per trait, however many options key it.
      const perTrait: Record<string, number> = {}
      for (const o of a.options) {
        for (const [trait, w] of Object.entries(o.keyed)) {
          perTrait[trait] = (perTrait[trait] ?? 0) + (o === chosen ? w : -w / (a.options.length - 1))
        }
      }
      for (const [trait, v] of Object.entries(perTrait)) add(trait, Math.max(-1, Math.min(1, v)))
    } else if (a.type === 'slider' && typeof r.value === 'number') {
      const centred = (r.value - 50) / 50
      for (const [trait, w] of Object.entries(a.keyed)) add(trait, w * centred)
    }
  }

  return Object.keys(sum)
    .map((trait) => {
      const value = Math.max(-1, Math.min(1, sum[trait] / n[trait]))
      return {
        trait,
        label: TRAIT_LABELS[trait] ?? trait,
        value,
        spread: Math.min(1, 1 / Math.sqrt(n[trait])),
        evidence: n[trait],
      }
    })
    .sort((x, y) => Math.abs(y.value) - Math.abs(x.value))
}

export interface Uniqueness {
  /** Answers with crowd data that were used. */
  answers: number
  /** Identifying information, in bits, assuming answers are independent. */
  bits: number
  /** About one player in this many answers exactly like you. */
  oneIn: number
}

/**
 * Surprisal of the player's answers under the crowd split. Treating answers as
 * independent overstates uniqueness; the pilot's test-retest data corrects it.
 */
export function uniqueness(items: Item[], responses: ResponseRecord[]): Uniqueness {
  const byId = new Map(items.map((i) => [i.id, i]))
  let bits = 0
  let answers = 0
  for (const r of responses) {
    const crowd = byId.get(r.itemId)?.crowd
    if (crowd?.kind !== 'shares' || typeof r.value !== 'string') continue
    const share = crowd.answerShare[r.value]
    if (!share || share <= 0) continue
    bits += -Math.log2(share)
    answers++
  }
  return { answers, bits, oneIn: Math.max(1, Math.round(2 ** bits)) }
}
