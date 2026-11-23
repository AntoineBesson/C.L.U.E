/** Question bank types. Mirrors items/seed.json. */

export type TraitKeying = Record<string, number>

export interface ChoiceOption {
  key: string
  text: string
  keyed: TraitKeying
}

/** 2 to 4 options. Option order is shuffled at each presentation. */
export interface ChoiceAnswer {
  type: 'choice'
  options: ChoiceOption[]
}

/** Exactly two options, shown side by side. */
export interface BinaryAnswer {
  type: 'binary'
  options: [ChoiceOption, ChoiceOption]
}

/** Continuous 0 to 100 answer. 100 points toward the keyed direction. */
export interface SliderAnswer {
  type: 'slider'
  prompt: string
  minLabel: string
  maxLabel: string
  keyed: TraitKeying
}

/** Short free text. Not keyed: scored offline, if at all. */
export interface TextAnswer {
  type: 'text'
  prompt: string
  maxLength: number
}

export type AnswerSpec = ChoiceAnswer | BinaryAnswer | SliderAnswer | TextAnswer
export type AnswerType = AnswerSpec['type']

/**
 * What other players did on this item. Until the pilot runs, these are
 * placeholder numbers (source "placeholder"), later replaced by agent or
 * human statistics.
 */
export type CrowdStats =
  | {
      kind: 'shares'
      source: 'placeholder' | 'agents' | 'humans'
      n: number
      /** Share of players who chose each option (sums to 1). */
      answerShare: Record<string, number>
      /** Geometric mean of players' predicted shares, per option (BTS). */
      predictedShare: Record<string, number>
    }
  | {
      kind: 'mean'
      source: 'placeholder' | 'agents' | 'humans'
      n: number
      /** Mean slider answer. */
      mean: number
    }

export interface Item {
  crowd?: CrowdStats
  id: string
  domain: string
  intensity: 1 | 2 | 3
  scenario: string
  answer: AnswerSpec
  lang: string
  source: string
}

/** A chosen option key, a slider value, or the text typed. */
export type AnswerValue = string | number

/** Per-answer summary of how the player got to their answer. No raw traces. */
export interface UncertaintySignals {
  /** Card shown to first interaction with the answer control. */
  msToFirstInteraction: number | null
  /** Card shown to the first press of Validate. */
  msToFirstValidate: number | null
  /** Card shown to final validation. */
  msTotal: number
  /** Times the selected value changed (clicks on another option, slider releases, text edits). */
  answerChanges: number
  /** Distinct options picked (choice/binary) before validating. */
  distinctOptionsTried: number
  /** Times the pointer moved from one option to another. */
  optionHoverSwitches: number
  /** Pointer travel over the card, in card widths (no coordinates are kept). */
  pointerTravel: number
  /** Slider only: direction reversals while dragging, and total distance moved in points. */
  sliderReversals: number
  sliderTravel: number
  /** Text only: characters inserted and removed, and paste events. */
  charsTyped: number
  charsDeleted: number
  pastes: number
  /** Longest gap between two interactions. */
  longestPauseMs: number
  /** Times the page lost focus during the card (tab switch, other window). */
  focusLosses: number
}

export interface ConfirmRecord {
  /** Whether "Are you sure?" was shown for this card (randomised). */
  shown: boolean
  /** How many times the player chose to reconsider. */
  reconsidered: number
  /** Whether the final answer differs from the one first submitted. */
  changedAfterPrompt: boolean
  /** Time spent on the prompt(s), in ms. */
  msOnPrompt: number
}

export type CrowdPrediction =
  | { kind: 'shares'; shares: Record<string, number> }
  | { kind: 'mean'; mean: number }

export interface ResponseRecord {
  playerId: string
  sessionId: string
  itemId: string
  answerType: AnswerType
  /** Final answer. */
  value: AnswerValue
  /** First answer submitted, before any "Are you sure?" reconsideration. */
  firstValue: AnswerValue
  /** Option keys in the order shown (choice/binary). */
  optionOrder: string[] | null
  confirm: ConfirmRecord
  /** The player's guess of how others answered. Null for text items. */
  prediction: CrowdPrediction | null
  /** Present only when the player opted in to uncertainty tracking. */
  signals: UncertaintySignals | null
  presentedAt: string
  answeredAt: string
}

export interface Consent {
  version: string
  givenAt: string
  adult: true
  research: true
  /** Separate, optional opt-in. */
  uncertaintyTracking: boolean
}
