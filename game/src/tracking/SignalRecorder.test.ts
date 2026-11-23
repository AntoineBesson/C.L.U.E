import { describe, expect, it } from 'vitest'
import { SignalRecorder } from './SignalRecorder'
import { textEditCounts } from './textDiff'

function clock() {
  let t = 1000
  return { now: () => t, advance: (ms: number) => (t += ms) }
}

describe('textEditCounts', () => {
  it('counts typing, deleting and replacing', () => {
    expect(textEditCounts('', 'abc')).toEqual({ inserted: 3, removed: 0 })
    expect(textEditCounts('abc', 'ab')).toEqual({ inserted: 0, removed: 1 })
    expect(textEditCounts('I would keep it', 'I would return it')).toEqual({ inserted: 6, removed: 4 })
  })
})

describe('SignalRecorder', () => {
  it('records hesitation and option changes', () => {
    const c = clock()
    const r = new SignalRecorder(c.now)
    c.advance(1500)
    r.selectOption('A', null)
    c.advance(4000)
    r.selectOption('C', 'A')
    c.advance(500)
    r.selectOption('A', 'C')
    r.validatePressed()
    const s = r.summary()
    expect(s.msToFirstInteraction).toBe(1500)
    expect(s.msToFirstValidate).toBe(6000)
    expect(s.answerChanges).toBe(2)
    expect(s.distinctOptionsTried).toBe(2)
    expect(s.longestPauseMs).toBe(4000)
  })

  it('counts slider reversals and travel', () => {
    const r = new SignalRecorder(clock().now)
    for (const v of [50, 60, 70, 65, 40, 55]) r.sliderInput(v)
    const s = r.summary()
    expect(s.sliderReversals).toBe(2)
    expect(s.sliderTravel).toBe(10 + 10 + 5 + 25 + 15)
  })

  it('counts characters typed and removed', () => {
    const r = new SignalRecorder(clock().now)
    r.textChange('', 'Keep')
    r.textChange('Keep', 'Kee')
    r.textChange('Kee', '')
    r.textChange('', 'Return it')
    const s = r.summary()
    expect(s.charsTyped).toBe(4 + 9)
    expect(s.charsDeleted).toBe(4)
  })

  it('keeps pointer travel without coordinates', () => {
    const r = new SignalRecorder(clock().now)
    r.pointerMove(0, 0, 100)
    r.pointerMove(30, 40, 100)
    expect(r.summary().pointerTravel).toBe(0.5)
    expect(JSON.stringify(r.summary())).not.toContain('30')
  })
})
