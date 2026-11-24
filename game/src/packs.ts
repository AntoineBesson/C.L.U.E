import type { Item } from './types'

/** A pack is a theme (one item domain) or the random mix of everything. */
export interface Pack {
  id: string
  label: string
  emoji: string
  blurb: string
}

export const RANDOM_PACK: Pack = { id: 'random', label: 'Random mix', emoji: '🎲', blurb: 'A bit of everything' }

export const THEMES: Pack[] = [
  { id: 'work', label: 'Work', emoji: '💼', blurb: 'Colleagues, bosses, credit' },
  { id: 'friends', label: 'Friends', emoji: '🍻', blurb: 'Loyalty and awkward truths' },
  { id: 'family', label: 'Family', emoji: '🏡', blurb: 'Parents, siblings, duty' },
  { id: 'money', label: 'Money', emoji: '💸', blurb: 'Sharing, owing, keeping' },
  { id: 'online', label: 'Online', emoji: '📱', blurb: 'Posts, privacy, screenshots' },
  { id: 'everyday', label: 'Everyday', emoji: '☕', blurb: 'Small choices, real stakes' },
  { id: 'sacrificial', label: 'Tough calls', emoji: '⚖️', blurb: 'Lives on the line' },
]

export const PACKS: Pack[] = [RANDOM_PACK, ...THEMES]

export function packById(id: string): Pack {
  return PACKS.find((p) => p.id === id) ?? RANDOM_PACK
}

export function packItems(pack: Pack, bank: readonly Item[]): Item[] {
  return pack.id === RANDOM_PACK.id ? [...bank] : bank.filter((i) => i.domain === pack.id)
}

/** Themes that have at least one card in the bank. */
export function availablePacks(bank: readonly Item[]): Pack[] {
  return PACKS.filter((p) => packItems(p, bank).length > 0)
}
