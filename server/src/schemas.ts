import { z } from 'zod'

const answerValue = z.union([z.string().max(500), z.number().min(0).max(100)])
const count = z.number().int().min(0).max(1_000_000)
const ms = z.number().min(0).max(86_400_000)

export const consentSchema = z.object({
  version: z.string().min(1).max(40),
  givenAt: z.string().datetime(),
  adult: z.literal(true),
  research: z.literal(true),
  uncertaintyTracking: z.boolean(),
})

/** Exactly the summary fields; anything else (raw traces) is rejected. */
export const signalsSchema = z
  .object({
    msToFirstInteraction: ms.nullable(),
    msToFirstValidate: ms.nullable(),
    msTotal: ms,
    answerChanges: count,
    distinctOptionsTried: count,
    optionHoverSwitches: count,
    pointerTravel: z.number().min(0).max(1_000_000),
    sliderReversals: count,
    sliderTravel: count,
    charsTyped: count,
    charsDeleted: count,
    pastes: count,
    longestPauseMs: ms,
    focusLosses: count,
  })
  .strict()

export const predictionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('shares'), shares: z.record(z.string().max(4), z.number().min(0).max(1)) }),
  z.object({ kind: z.literal('mean'), mean: z.number().min(0).max(100) }),
])

export const responseSchema = z
  .object({
    playerId: z.string().uuid(),
    sessionId: z.string().uuid(),
    itemId: z.string().min(1).max(40),
    answerType: z.enum(['choice', 'binary', 'slider', 'text']),
    value: answerValue,
    firstValue: answerValue,
    optionOrder: z.array(z.string().max(4)).max(4).nullable(),
    confirm: z
      .object({
        shown: z.boolean(),
        reconsidered: count,
        changedAfterPrompt: z.boolean(),
        msOnPrompt: ms,
      })
      .strict(),
    prediction: predictionSchema.nullable(),
    signals: signalsSchema.nullable(),
    presentedAt: z.string().datetime(),
    answeredAt: z.string().datetime(),
  })
  .strict()

export type ResponseInput = z.infer<typeof responseSchema>
export type ConsentInput = z.infer<typeof consentSchema>
