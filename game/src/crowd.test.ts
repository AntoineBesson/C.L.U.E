import { describe, expect, it } from 'vitest'
import { fingerprint, SIMULATED, simulatedFor, withSimulatedCrowd } from './crowd'
import { DRAFTS, ITEMS, mergeServerSet, pickSession } from './items'
import { addEntry, placeOf, sanitiseName, scoreSet, type LeaderboardEntry } from './leaderboard'
import type { Item, ResponseRecord } from './types'

describe('simulated crowd', () => {
  it('fingerprints the same way as the Python generator', () => {
    const q1 = ITEMS.find((i) => i.id === 'q0001')!
    expect(fingerprint(q1)).toBe(SIMULATED.items.q0001.fingerprint)
  })

  it('gives every scorable card in the bank an AI-player split', () => {
    for (const item of ITEMS) {
      if (item.answer.type === 'text') continue
      expect(item.crowd?.source, item.id).toBe('agents')
    }
  })

  it('drops a split when the item was reworded after the run', () => {
    const q1 = ITEMS.find((i) => i.id === 'q0001')!
    const reworded: Item = { ...q1, scenario: q1.scenario + ' Again.', crowd: undefined }
    expect(simulatedFor(reworded)).toBeNull()
    expect(withSimulatedCrowd(reworded).crowd).toBeUndefined()
  })

  it('plays only drafts that passed the gate on their current wording', () => {
    const ids = new Set(ITEMS.map((i) => i.id))
    for (const d of DRAFTS) {
      const e = simulatedFor(d)
      expect(ids.has(d.id), d.id).toBe(e?.gate === true)
    }
  })

  it('has no truth-bonus predictions for agents', () => {
    for (const e of Object.values(SIMULATED.items)) {
      if (e.crowd.kind === 'shares') expect(e.crowd.predictedShare).toBeUndefined()
    }
  })
})

describe('no repeated cards', () => {
  it('never picks a seen card, across many sets', () => {
    const seen = new Set<string>()
    let sets = 0
    for (;;) {
      const set = pickSession(5, seen)
      if (set.length === 0) break
      for (const i of set) {
        expect(seen.has(i.id)).toBe(false)
        seen.add(i.id)
      }
      sets++
    }
    expect(seen.size).toBe(ITEMS.length)
    expect(sets).toBe(Math.ceil(ITEMS.length / 5))
  })

  it('removes seen cards from the server set and tops it up', () => {
    const [a, b] = ITEMS
    const merged = mergeServerSet([a, b], 3, new Set([a.id]))
    expect(merged.map((i) => i.id)).not.toContain(a.id)
    expect(merged[0].id).toBe(b.id)
    expect(merged).toHaveLength(3)
    expect(new Set(merged.map((i) => i.id)).size).toBe(3)
  })
})

function response(item: Item, prediction: ResponseRecord['prediction'], value: string | number): ResponseRecord {
  return {
    playerId: 'p', sessionId: 's', itemId: item.id, answerType: item.answer.type, value, firstValue: value,
    optionOrder: null, confirm: { shown: false, reconsidered: 0, changedAfterPrompt: false, msOnPrompt: 0 },
    prediction, signals: null, presentedAt: '', answeredAt: '',
  }
}

describe('leaderboard', () => {
  const item: Item = {
    id: 'qx', domain: 'work', intensity: 1, scenario: 's', lang: 'en', source: 't',
    answer: { type: 'binary', options: [{ key: 'A', text: 'a', keyed: { care: 1 } }, { key: 'B', text: 'b', keyed: { care: -1 } }] },
    crowd: { kind: 'shares', source: 'agents', n: 100, answerShare: { A: 0.8, B: 0.2 } },
  }

  it('scores a perfect guess 100 and an even split lower', () => {
    const s = scoreSet([item], [response(item, { kind: 'shares', shares: { A: 80, B: 20 } }, 'A')])
    expect(s.average).toBe(100)
    expect(s.evenSplit).toBeLessThan(100)
    expect(s.crowd).toBe('agents')
  })

  it('ranks by average, keeps the place of an entry', () => {
    const e = (id: string, average: number): LeaderboardEntry => ({
      id, name: id, average, total: average * 5, guesses: 5, at: `2026-11-24T00:00:0${id.length}Z`, crowd: 'agents',
    })
    let board: LeaderboardEntry[] = []
    board = addEntry(board, e('a', 60))
    board = addEntry(board, e('bb', 80))
    board = addEntry(board, e('ccc', 70))
    expect(board.map((x) => x.id)).toEqual(['bb', 'ccc', 'a'])
    expect(placeOf(board, 'ccc')).toBe(2)
  })

  it('cleans names', () => {
    expect(sanitiseName('  Ana   Lou  ')).toBe('Ana Lou')
    expect(sanitiseName('x'.repeat(40))).toHaveLength(20)
  })
})
