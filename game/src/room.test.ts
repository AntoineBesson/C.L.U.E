import { describe, expect, it } from 'vitest'
import { ITEMS } from './items'
import { availablePacks, packItems, PACKS, RANDOM_PACK, THEMES } from './packs'
import { cardPoints, roomPlayable, roomSplit, standings, type RoomTurn } from './room'
import type { Item } from './types'

const binary: Item = {
  id: 'qx', domain: 'work', intensity: 1, scenario: 's', lang: 'en', source: 't',
  answer: { type: 'binary', options: [{ key: 'A', text: 'a', keyed: { care: 1 } }, { key: 'B', text: 'b', keyed: { care: -1 } }] },
  crowd: { kind: 'shares', source: 'agents', n: 100, answerShare: { A: 0.9, B: 0.1 } },
}
const slider: Item = {
  id: 'qs', domain: 'work', intensity: 1, scenario: 's', lang: 'en', source: 't',
  answer: { type: 'slider', prompt: 'p', minLabel: 'lo', maxLabel: 'hi', keyed: { care: 1 } },
}

describe('rooms', () => {
  const turns: RoomTurn[] = [
    { player: 0, value: 'A', prediction: { kind: 'shares', shares: { A: 50, B: 50 } } },
    { player: 1, value: 'B', prediction: { kind: 'shares', shares: { A: 90, B: 10 } } },
  ]

  it('splits the room by answer', () => {
    expect(roomSplit(binary, turns)).toEqual({ kind: 'shares', n: 2, answerShare: { A: 0.5, B: 0.5 } })
    const s = roomSplit(slider, [
      { player: 0, value: 20, prediction: { kind: 'mean', mean: 50 } },
      { player: 1, value: 60, prediction: { kind: 'mean', mean: 40 } },
    ])
    expect(s).toEqual({ kind: 'mean', n: 2, mean: 40 })
  })

  it('scores against the room when the database is off, and against the database when on', () => {
    const room = cardPoints(binary, turns, 'room')
    expect(room[0]).toBe(100)
    expect(room[1]).toBeLessThan(100)
    const db = cardPoints(binary, turns, 'database')
    expect(db[1]).toBe(100)
    expect(db[0]).toBeLessThan(100)
  })

  it('only plays cards with something to guess', () => {
    expect(roomPlayable(slider, 'room')).toBe(true)
    expect(roomPlayable(slider, 'database')).toBe(false) // no database split
    const text = ITEMS.find((i) => i.answer.type === 'text')
    if (text) expect(roomPlayable(text, 'room')).toBe(false)
  })

  it('ranks players, ties share a place', () => {
    expect(standings(['a', 'b', 'c'], [120, 180, 120])).toEqual([
      { name: 'b', total: 180, place: 1 },
      { name: 'a', total: 120, place: 2 },
      { name: 'c', total: 120, place: 2 },
    ])
  })
})

describe('packs', () => {
  it('covers every domain in the bank with a theme', () => {
    const themes = new Set(THEMES.map((t) => t.id))
    for (const i of ITEMS) expect(themes.has(i.domain), i.domain).toBe(true)
  })

  it('random mix is the whole bank, themes split it', () => {
    expect(packItems(RANDOM_PACK, ITEMS)).toHaveLength(ITEMS.length)
    const sum = THEMES.reduce((n, t) => n + packItems(t, ITEMS).length, 0)
    expect(sum).toBe(ITEMS.length)
    expect(availablePacks(ITEMS).length).toBeLessThanOrEqual(PACKS.length)
  })
})
