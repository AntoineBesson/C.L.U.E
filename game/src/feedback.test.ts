import { describe, expect, it } from 'vitest'
import { insight, SET_VERDICTS, tier, verdict, VERDICTS } from './feedback'
import { asOf, dayOf, doneToday, EMPTY_STREAK, hotHand, played } from './streak'
import { optionIndex } from './ui/keys'
import type { Item } from './types'

const item: Item = {
  id: 'qx', domain: 'work', intensity: 1, scenario: 's', lang: 'en', source: 't',
  answer: { type: 'choice', options: [
    { key: 'A', text: 'Listen politely.', keyed: { care: 1 } },
    { key: 'B', text: 'Walk off.', keyed: { care: -1 } },
  ] },
}

describe('feedback words', () => {
  it('has several versions for every tier', () => {
    for (const t of ['perfect', 'great', 'good', 'meh', 'miss'] as const) {
      expect(VERDICTS[t].length).toBeGreaterThanOrEqual(5)
      expect(SET_VERDICTS[t].length).toBeGreaterThanOrEqual(3)
    }
  })

  it('maps points to tiers and picks from the right list', () => {
    expect(tier(95)).toBe('perfect')
    expect(tier(10)).toBe('miss')
    expect(VERDICTS.great).toContain(verdict(80, () => 0.99))
  })

  it('names the option the guess missed most', () => {
    const crowd = { kind: 'shares' as const, source: 'agents' as const, n: 100, answerShare: { A: 0.2, B: 0.8 } }
    const s = insight(item, { kind: 'shares', shares: { A: 50, B: 50 } }, crowd, () => 0)
    expect(s).toContain('Walk off')
    expect(s).toContain('80%')
    expect(insight(item, { kind: 'shares', shares: { A: 20, B: 80 } }, crowd, () => 0)).toMatch(/within|almost exactly/)
  })

  it('says how far a slider guess was', () => {
    const crowd = { kind: 'mean' as const, source: 'agents' as const, n: 100, mean: 40 }
    const slider: Item = { ...item, answer: { type: 'slider', prompt: 'p', minLabel: 'a', maxLabel: 'b', keyed: { care: 1 } } }
    expect(insight(slider, { kind: 'mean', mean: 60 }, crowd, () => 0)).toContain('20 too high')
  })
})

describe('streaks', () => {
  it('counts consecutive days and resets after a gap', () => {
    let s = played(EMPTY_STREAK, '2026-11-24')
    s = played(s, '2026-11-24')
    expect(s.current).toBe(1)
    s = played(s, '2026-11-25')
    s = played(s, '2026-11-26')
    expect(s).toEqual({ current: 3, best: 3, lastDay: '2026-11-26' })
    expect(doneToday(s, '2026-11-26')).toBe(true)
    expect(asOf(s, '2026-11-27').current).toBe(3)
    expect(asOf(s, '2026-11-28').current).toBe(0)
    s = played(s, '2026-11-29')
    expect(s).toEqual({ current: 1, best: 3, lastDay: '2026-11-29' })
  })

  it('crosses month ends and uses the Paris day', () => {
    expect(played({ current: 2, best: 2, lastDay: '2026-11-30' }, '2026-12-01').current).toBe(3)
    expect(dayOf(new Date('2026-11-24T23:30:00Z'))).toBe('2026-11-25')
  })

  it('counts great reads in a row at the end', () => {
    expect(hotHand([90, 40, 80, 76])).toBe(2)
    expect(hotHand([90, 40])).toBe(0)
  })
})

describe('keyboard', () => {
  it('maps 1-4 and A-D to options', () => {
    expect(optionIndex('1')).toBe(0)
    expect(optionIndex('d')).toBe(3)
    expect(optionIndex('C')).toBe(2)
    expect(optionIndex('x')).toBeNull()
  })
})
