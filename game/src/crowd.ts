import simulated from '../../items/crowd/simulated.json'
import type { CrowdStats, Item } from './types'

/**
 * The simulated crowd: how the AI players (personas x models) answered each
 * item, from items/crowd/simulated.json (built by harness/clue_harness/crowd.py).
 * It stands in for real players until the pilot runs, and the game says so.
 *
 * Each split carries a fingerprint of the item text the agents saw. If an
 * item is reworded after the run, the fingerprint no longer matches and the
 * split is ignored, so players are never scored against answers to another
 * question.
 */

export interface SimulatedEntry {
  fingerprint: string
  run: string
  crowd: CrowdStats
  /** Whether the item passed the Phase 1 gate on this run. */
  gate?: boolean
}

interface SimulatedFile {
  generated: string
  runs: { run: string; commit: string | null; items: number; agents: number }[]
  items: Record<string, SimulatedEntry>
}

export const SIMULATED = simulated as unknown as SimulatedFile

/** FNV-1a (32 bit) over the text a player sees. Mirrors harness/clue_harness/crowd.py. */
export function fingerprint(item: Item): string {
  const a = item.answer
  const parts = [item.scenario]
  if (a.type === 'choice' || a.type === 'binary') {
    const opts = [...a.options].sort((x, y) => (x.key < y.key ? -1 : x.key > y.key ? 1 : 0))
    parts.push(...opts.map((o) => `${o.key}:${o.text}`))
  } else if (a.type === 'slider') {
    parts.push(a.prompt, a.minLabel, a.maxLabel)
  } else {
    parts.push(a.prompt)
  }
  let h = 0x811c9dc5
  for (const b of new TextEncoder().encode(parts.join('\n'))) {
    h ^= b
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

/** The simulated entry for this item, if one matches its current text. */
export function simulatedFor(item: Item, file: SimulatedFile = SIMULATED): SimulatedEntry | null {
  const e = file.items[item.id]
  return e && e.fingerprint === fingerprint(item) ? e : null
}

/** Uses the simulated crowd where one matches, else keeps the item's own (placeholder) numbers. */
export function withSimulatedCrowd(item: Item, file: SimulatedFile = SIMULATED): Item {
  const e = simulatedFor(item, file)
  return e ? { ...item, crowd: e.crowd } : item
}

/** Agents behind the simulated crowd (the largest run). */
export const SIMULATED_AGENTS = Math.max(0, ...SIMULATED.runs.map((r) => r.agents))

/** Short label for where a crowd split comes from. */
export function crowdLabel(c: CrowdStats): string {
  if (c.source === 'agents') return `Simulated crowd: ${c.n} AI players`
  if (c.source === 'humans') return `${c.n} players`
  return 'Made-up numbers (no players yet)'
}
