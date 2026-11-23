import { describe, expect, it } from 'vitest'
import { estimateTraits, uniqueness } from './profile'
import { btsBonus, normalise, predictionPoints, scoreCard } from './scoring'
import type { CrowdStats, Item, ResponseRecord } from './types'

const crowd: Extract<CrowdStats, { kind: 'shares' }> = {
  kind: 'shares',
  source: 'placeholder',
  n: 0,
  answerShare: { A: 0.7, B: 0.3 },
  predictedShare: { A: 0.5, B: 0.45 },
}

const binary: Item = {
  id: 'b',
  domain: 'money',
  intensity: 1,
  scenario: '',
  lang: 'en',
  source: 'test',
  crowd,
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
  crowd: { kind: 'mean', source: 'placeholder', n: 0, mean: 40 },
  answer: { type: 'slider', prompt: '', minLabel: '', maxLabel: '', keyed: { loyalty: 1 } },
}

function resp(itemId: string, value: string | number, prediction: ResponseRecord['prediction']): ResponseRecord {
  return {
    playerId: 'p',
    sessionId: 's',
    itemId,
    answerType: 'binary',
    value,
    firstValue: value,
    optionOrder: null,
    confirm: { shown: false, reconsidered: 0, changedAfterPrompt: false, msOnPrompt: 0 },
    prediction,
    signals: null,
    presentedAt: '',
    answeredAt: '',
  }
}

describe('scoring', () => {
  it('normalises slider weights to shares', () => {
    expect(normalise({ A: 30, B: 10 })).toEqual({ A: 0.75, B: 0.25 })
    expect(normalise({ A: 0, B: 0 })).toEqual({ A: 0.5, B: 0.5 })
  })

  it('gives 100 for an exact prediction and less otherwise', () => {
    expect(predictionPoints({ A: 0.7, B: 0.3 }, crowd.answerShare)).toBe(100)
    const worse = predictionPoints({ A: 0.3, B: 0.7 }, crowd.answerShare)
    const closer = predictionPoints({ A: 0.6, B: 0.4 }, crowd.answerShare)
    expect(worse).toBeLessThan(closer)
    expect(closer).toBeLessThan(100)
  })

  it('awards the truth-serum bonus only to surprisingly common answers', () => {
    expect(btsBonus('A', crowd)).toBeGreaterThan(0) // 0.70 chose it, 0.50 predicted
    expect(btsBonus('B', crowd)).toBe(0) // 0.30 chose it, 0.45 predicted
  })

  it('scores slider predictions by distance to the crowd mean', () => {
    expect(scoreCard(slider, resp('s', 80, { kind: 'mean', mean: 55 }))?.prediction).toBe(85)
  })
})

describe('reveal', () => {
  it('leans traits toward the chosen option', () => {
    const t = estimateTraits([binary, slider], [resp('b', 'A', null), resp('s', 100, null)])
    const hh = t.find((x) => x.trait === 'honesty_humility')!
    expect(hh.value).toBeGreaterThan(0)
    expect(t.find((x) => x.trait === 'loyalty')!.value).toBe(1)
    // A binary item keys both options, but it is still one answer.
    expect(hh.evidence).toBe(1)
  })

  it('turns rare answers into more identifying bits', () => {
    const common = uniqueness([binary], [resp('b', 'A', null)])
    const rare = uniqueness([binary], [resp('b', 'B', null)])
    expect(rare.bits).toBeGreaterThan(common.bits)
    expect(rare.oneIn).toBe(3)
  })
})
