import type { UncertaintySignals } from '../types'
import { textEditCounts } from './textDiff'

/**
 * Turns one card's interactions into a small set of uncertainty summaries.
 *
 * Privacy rule: this class keeps running totals only. It never stores
 * keystroke timings, key identities, pointer coordinates or paths, so the
 * output cannot be replayed as a typing or mouse "signature".
 */
export class SignalRecorder {
  private readonly now: () => number
  private readonly start: number
  private lastEvent: number
  private firstInteraction: number | null = null
  private firstValidate: number | null = null

  private answerChanges = 0
  private readonly optionsTried = new Set<string>()
  private hoverSwitches = 0
  private lastHovered: string | null = null
  private pointerTravel = 0
  private lastPointer: { x: number; y: number } | null = null

  private sliderReversals = 0
  private sliderTravel = 0
  private lastSlider: number | null = null
  private lastSliderDir = 0

  private charsTyped = 0
  private charsDeleted = 0
  private pastes = 0
  private longestPause = 0
  private focusLosses = 0

  constructor(now: () => number = () => performance.now()) {
    this.now = now
    this.start = now()
    this.lastEvent = this.start
  }

  private touch(isAnswerInteraction: boolean) {
    const t = this.now()
    this.longestPause = Math.max(this.longestPause, t - this.lastEvent)
    this.lastEvent = t
    if (isAnswerInteraction && this.firstInteraction === null) {
      this.firstInteraction = t - this.start
    }
  }

  /** A choice or binary option was selected. */
  selectOption(key: string, previous: string | null) {
    this.touch(true)
    this.optionsTried.add(key)
    if (previous !== null && previous !== key) this.answerChanges++
  }

  /** Pointer entered an option. */
  hoverOption(key: string) {
    if (this.lastHovered !== null && this.lastHovered !== key) this.hoverSwitches++
    this.lastHovered = key
  }

  /**
   * Pointer moved over the card. Coordinates are normalised by the card width,
   * added to a running distance, and dropped.
   */
  pointerMove(x: number, y: number, cardWidth: number) {
    if (cardWidth <= 0) return
    const p = { x: x / cardWidth, y: y / cardWidth }
    if (this.lastPointer) {
      this.pointerTravel += Math.hypot(p.x - this.lastPointer.x, p.y - this.lastPointer.y)
    }
    this.lastPointer = p
  }

  /** Slider moved (fires continuously while dragging). */
  sliderInput(value: number) {
    this.touch(true)
    if (this.lastSlider !== null) {
      const delta = value - this.lastSlider
      if (delta !== 0) {
        const dir = Math.sign(delta)
        if (this.lastSliderDir !== 0 && dir !== this.lastSliderDir) this.sliderReversals++
        this.lastSliderDir = dir
        this.sliderTravel += Math.abs(delta)
      }
    }
    this.lastSlider = value
  }

  /** Slider released on a value. Counts as an answer change after the first. */
  sliderCommit(isFirst: boolean) {
    if (!isFirst) this.answerChanges++
  }

  /** Text field changed from `prev` to `next`. */
  textChange(prev: string, next: string) {
    this.touch(true)
    const { inserted, removed } = textEditCounts(prev, next)
    this.charsTyped += inserted
    this.charsDeleted += removed
    if (prev.length > 0 && (inserted > 0 || removed > 0)) this.answerChanges++
  }

  paste() {
    this.pastes++
  }

  focusLost() {
    this.focusLosses++
  }

  /** Validate was pressed (before any "Are you sure?" prompt). */
  validatePressed() {
    this.touch(false)
    if (this.firstValidate === null) this.firstValidate = this.now() - this.start
  }

  summary(): UncertaintySignals {
    return {
      msToFirstInteraction: round(this.firstInteraction),
      msToFirstValidate: round(this.firstValidate),
      msTotal: Math.round(this.now() - this.start),
      answerChanges: this.answerChanges,
      distinctOptionsTried: this.optionsTried.size,
      optionHoverSwitches: this.hoverSwitches,
      pointerTravel: Math.round(this.pointerTravel * 100) / 100,
      sliderReversals: this.sliderReversals,
      sliderTravel: Math.round(this.sliderTravel),
      charsTyped: this.charsTyped,
      charsDeleted: this.charsDeleted,
      pastes: this.pastes,
      longestPauseMs: Math.round(this.longestPause),
      focusLosses: this.focusLosses,
    }
  }
}

function round(v: number | null): number | null {
  return v === null ? null : Math.round(v)
}
