import { describe, expect, it } from 'vitest'
import type { Item } from '../../game/src/types.ts'
import { computeCrowd } from './crowd.ts'
import { drawAdaptive, drawShared, today } from './daily.ts'

const binary: Item = {
  id: 'b',
  domain: 'money',
  intensity: 1,
  scenario: '',
  lang: 'en',
  source: 'test',
  answer: {
    type: 'binary',
    options: [
      { key: 'A', text: '', keyed: { honesty_humility: 1 } },
      { key: 'B', text: '', keyed: { honesty_humility: -1 } },
    ],
  },
}
const slider: Item = {
  ...binary,
  id: 's',
  answer: { type: 'slider', prompt: '', minLabel: '', maxLabel: '', keyed: { loyalty: 1 } },
}
const text: Item = { ...binary, id: 't', answer: { type: 'text', prompt: '', maxLength: 10 } }

describe('computeCrowd', () => {
  it('hides items below the minimum crowd', () => {
    expect(computeCrowd(binary, [{ value: 'A', prediction: null }], 2)).toBeNull()
  })

  it('computes the split and the geometric mean of predictions', () => {
    const rows = [
      { value: 'A', prediction: { kind: 'shares', shares: { A: 0.8, B: 0.2 } } },
      { value: 'A', prediction: { kind: 'shares', shares: { A: 0.2, B: 0.8 } } },
      { value: 'B', prediction: null },
      { value: 'Z', prediction: null }, // not an option: ignored
    ]
    const c = computeCrowd(binary, rows, 3)
    expect(c).toMatchObject({ kind: 'shares', n: 3, answerShare: { A: 0.6667, B: 0.3333 } })
    expect(c?.kind === 'shares' && c.predictedShare?.A).toBe(0.4) // sqrt(0.8 * 0.2)
  })

  it('averages slider answers and ignores text items', () => {
    expect(computeCrowd(slider, [{ value: 20, prediction: null }, { value: 60, prediction: null }], 2)).toMatchObject({
      kind: 'mean',
      mean: 40,
    })
    expect(computeCrowd(text, [{ value: 'hi', prediction: null }], 0)).toBeNull()
  })
})

describe('daily set', () => {
  const items = Array.from({ length: 10 }, (_, i) => ({ ...binary, id: `q${i}` }))

  it('draws the same shared items for everyone on a day', () => {
    expect(drawShared(items, '2026-11-23', 3)).toEqual(drawShared(items, '2026-11-23', 3))
    expect(drawShared(items, '2026-11-23', 3)).not.toEqual(drawShared(items, '2026-11-24', 3))
  })

  it('prefers unseen items on traits with little evidence', () => {
    const pool = [binary, slider, text]
    // Already answered the honesty item: loyalty (slider) should come first, text last.
    expect(drawAdaptive(pool, new Set(['b']), new Set(), 'p', 2)).toEqual(['s', 't'])
    // Bank exhausted: never repeat an answered item, return fewer instead.
    expect(drawAdaptive(pool, new Set(['b', 's']), new Set(['t']), 'p', 2)).toEqual([])
    expect(drawAdaptive(pool, new Set(['b']), new Set(['t']), 'p', 2)).toEqual(['s'])
  })

  it('uses the Paris calendar day', () => {
    expect(today(new Date('2026-11-23T23:30:00Z'))).toBe('2026-11-24')
  })
})
