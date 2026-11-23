/**
 * Tiny synthesised sound effects (Web Audio, no audio files).
 * Purely cosmetic: nothing here records or reports anything.
 */
const MUTE_KEY = 'clue.ui.muted'

let ctx: AudioContext | null = null
let muted = readMuted()
const listeners = new Set<(m: boolean) => void>()

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function isMuted() {
  return muted
}

export function setMuted(m: boolean) {
  muted = m
  try {
    localStorage.setItem(MUTE_KEY, m ? '1' : '0')
  } catch {
    /* preference only */
  }
  listeners.forEach((l) => l(m))
}

export function onMutedChange(l: (m: boolean) => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

function audio(): AudioContext | null {
  if (muted) return null
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

interface Note {
  freq: number
  /** seconds after start */
  at: number
  dur: number
  type?: OscillatorType
  gain?: number
  /** pitch slide target */
  to?: number
}

function play(notes: Note[]) {
  const a = audio()
  if (!a) return
  const t0 = a.currentTime + 0.01
  for (const n of notes) {
    const osc = a.createOscillator()
    const g = a.createGain()
    osc.type = n.type ?? 'triangle'
    osc.frequency.setValueAtTime(n.freq, t0 + n.at)
    if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, t0 + n.at + n.dur)
    const peak = n.gain ?? 0.18
    g.gain.setValueAtTime(0.0001, t0 + n.at)
    g.gain.exponentialRampToValueAtTime(peak, t0 + n.at + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur)
    osc.connect(g).connect(a.destination)
    osc.start(t0 + n.at)
    osc.stop(t0 + n.at + n.dur + 0.02)
  }
}

export const sfx = {
  /** Picking an option. */
  pop: () => play([{ freq: 520, to: 880, at: 0, dur: 0.09, type: 'sine', gain: 0.22 }]),
  /** Slider tick. */
  tick: () => play([{ freq: 1200, at: 0, dur: 0.03, type: 'square', gain: 0.03 }]),
  /** Validating an answer. */
  lock: () =>
    play([
      { freq: 660, at: 0, dur: 0.1 },
      { freq: 990, at: 0.08, dur: 0.16 },
    ]),
  /** The "Are you sure?" prompt. */
  hmm: () =>
    play([
      { freq: 330, to: 300, at: 0, dur: 0.16, type: 'sine' },
      { freq: 300, to: 360, at: 0.16, dur: 0.22, type: 'sine' },
    ]),
  /** Going back to think again. */
  back: () => play([{ freq: 700, to: 420, at: 0, dur: 0.14, type: 'sine', gain: 0.15 }]),
  /** New card slides in. */
  whoosh: () => play([{ freq: 200, to: 600, at: 0, dur: 0.18, type: 'sine', gain: 0.07 }]),
  /** End of the set. */
  fanfare: () =>
    play([
      { freq: 523, at: 0, dur: 0.14 },
      { freq: 659, at: 0.12, dur: 0.14 },
      { freq: 784, at: 0.24, dur: 0.14 },
      { freq: 1047, at: 0.36, dur: 0.4, gain: 0.2 },
    ]),
}
