import { describe, expect, it } from 'vitest'
import { ITEMS } from './items'
import { TRAIT_LABELS } from './profile'

/** Checks every item in items/seed.json against the spec's rules for the bank. */
describe('question bank', () => {
  it('has unique ids of the form q0000', () => {
    const ids = ITEMS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^q\d{4}$/)
  })

  it.each(ITEMS.map((i) => [i.id, i] as const))('%s follows the item rules', (_id, item) => {
    expect(item.scenario.split(/\s+/).length).toBeLessThanOrEqual(60)
    expect([1, 2, 3]).toContain(item.intensity)
    const a = item.answer
    const traits: string[] = []
    if (a.type === 'choice' || a.type === 'binary') {
      expect(a.options.length).toBeGreaterThanOrEqual(2)
      expect(a.options.length).toBeLessThanOrEqual(a.type === 'binary' ? 2 : 4)
      const keys = a.options.map((o) => o.key)
      expect(new Set(keys).size).toBe(keys.length)
      for (const o of a.options) {
        expect(Object.keys(o.keyed).length).toBeGreaterThan(0)
        traits.push(...Object.keys(o.keyed))
      }
      if (item.crowd?.kind === 'shares') expect(Object.keys(item.crowd.answerShare).sort()).toEqual([...keys].sort())
    }
    if (a.type === 'slider') traits.push(...Object.keys(a.keyed))
    for (const t of traits) expect(Object.keys(TRAIT_LABELS)).toContain(t)
  })

  it('covers every trait at least 3 times', () => {
    const count: Record<string, number> = {}
    for (const item of ITEMS) {
      const a = item.answer
      const ts = new Set<string>()
      if (a.type === 'choice' || a.type === 'binary') a.options.forEach((o) => Object.keys(o.keyed).forEach((t) => ts.add(t)))
      if (a.type === 'slider') Object.keys(a.keyed).forEach((t) => ts.add(t))
      ts.forEach((t) => (count[t] = (count[t] ?? 0) + 1))
    }
    for (const t of Object.keys(TRAIT_LABELS)) expect(count[t] ?? 0, t).toBeGreaterThanOrEqual(3)
  })
})
