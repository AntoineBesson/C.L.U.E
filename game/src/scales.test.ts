import { describe, expect, it } from 'vitest'
import mfq2 from '../../items/scales/mfq2.json'
import ous from '../../items/scales/ous.json'
import { TRAIT_LABELS } from './profile'

interface ScaleItem {
  id: string
  n: number
  trait: string
  reversed: boolean
  text: Record<string, string>
}
interface Scale {
  id: string
  response: { min: number; max: number; labels: Record<string, string[]> }
  items: ScaleItem[]
}

/** Item count per trait, from the published scales. */
const EXPECTED: Record<string, Record<string, number>> = {
  mfq2: { care: 6, equality: 6, proportionality: 6, loyalty: 6, authority: 6, purity: 6 },
  ous: { impartial_beneficence: 5, instrumental_harm: 4 },
}

describe.each([mfq2, ous].map((s) => [s.id, s as Scale] as const))('scale %s', (id, scale) => {
  it('numbers items 1..N in published order with matching ids', () => {
    scale.items.forEach((item, i) => {
      expect(item.n).toBe(i + 1)
      expect(item.id).toBe(`${id}_${String(i + 1).padStart(2, '0')}`)
    })
  })

  it('keys every item to a known trait, with the published counts', () => {
    const count: Record<string, number> = {}
    for (const item of scale.items) {
      expect(Object.keys(TRAIT_LABELS)).toContain(item.trait)
      count[item.trait] = (count[item.trait] ?? 0) + 1
    }
    expect(count).toEqual(EXPECTED[id])
  })

  it('has text and response labels for every language it declares', () => {
    const langs = Object.keys(scale.response.labels)
    expect(langs).toContain('en')
    for (const lang of langs) {
      expect(scale.response.labels[lang].length).toBe(scale.response.max - scale.response.min + 1)
      for (const item of scale.items) expect(item.text[lang]?.trim(), `${item.id} ${lang}`).toBeTruthy()
    }
  })
})
