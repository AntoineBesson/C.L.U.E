import { useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'
import { shuffle } from '../items'
import { SignalRecorder } from '../tracking/SignalRecorder'
import type { AnswerValue, ChoiceOption, Item, ResponseRecord } from '../types'

interface Props {
  item: Item
  tracking: boolean
  playerId: string
  sessionId: string
  onDone: (r: ResponseRecord) => void
}

type Phase = 'answering' | 'confirming'

export function Card({ item, tracking, playerId, sessionId, onDone }: Props) {
  const spec = item.answer
  const [presentedAt] = useState(() => new Date().toISOString())
  const [options] = useState<ChoiceOption[] | null>(() =>
    spec.type === 'choice' || spec.type === 'binary' ? shuffle(spec.options) : null,
  )
  const [askConfirm] = useState(() => Math.random() < CONFIG.confirmProbability)
  const recorder = useRef<SignalRecorder | null>(null)
  if (tracking && recorder.current === null) recorder.current = new SignalRecorder()
  const rec = recorder.current

  const [value, setValue] = useState<AnswerValue | null>(null)
  const [sliderTouched, setSliderTouched] = useState(false)
  const [phase, setPhase] = useState<Phase>('answering')
  const firstValue = useRef<AnswerValue | null>(null)
  const reconsidered = useRef(0)
  const promptMs = useRef(0)
  const promptOpenedAt = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rec) return
    const onBlur = () => rec.focusLost()
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [rec])

  const canValidate =
    spec.type === 'text' ? typeof value === 'string' && value.trim().length > 0 : value !== null

  function finish(final: AnswerValue) {
    onDone({
      playerId,
      sessionId,
      itemId: item.id,
      answerType: spec.type,
      value: final,
      firstValue: firstValue.current ?? final,
      optionOrder: options ? options.map((o) => o.key) : null,
      confirm: {
        shown: askConfirm,
        reconsidered: reconsidered.current,
        changedAfterPrompt: askConfirm && firstValue.current !== null && firstValue.current !== final,
        msOnPrompt: Math.round(promptMs.current),
      },
      prediction: null,
      signals: rec ? rec.summary() : null,
      presentedAt,
      answeredAt: new Date().toISOString(),
    })
  }

  function validate() {
    if (value === null || !canValidate) return
    rec?.validatePressed()
    if (firstValue.current === null) firstValue.current = value
    // Ask once per card: after "Let me think again", the next Validate is final.
    if (askConfirm && reconsidered.current === 0) {
      promptOpenedAt.current = performance.now()
      setPhase('confirming')
    } else {
      finish(value)
    }
  }

  function closePrompt() {
    promptMs.current += performance.now() - promptOpenedAt.current
  }

  return (
    <div
      ref={cardRef}
      className="panel card"
      onPointerMove={
        rec
          ? (e) => {
              const box = cardRef.current?.getBoundingClientRect()
              if (box) rec.pointerMove(e.clientX - box.left, e.clientY - box.top, box.width)
            }
          : undefined
      }
    >
      <p className="scenario">{item.scenario}</p>

      {options && (
        <div className={spec.type === 'binary' ? 'options binary' : 'options'}>
          {options.map((o) => (
            <button
              key={o.key}
              className={value === o.key ? 'option selected' : 'option'}
              disabled={phase !== 'answering'}
              onPointerEnter={() => rec?.hoverOption(o.key)}
              onClick={() => {
                rec?.selectOption(o.key, typeof value === 'string' ? value : null)
                setValue(o.key)
              }}
            >
              {o.text}
            </button>
          ))}
        </div>
      )}

      {spec.type === 'slider' && (
        <div className="slider">
          <p className="prompt">{spec.prompt}</p>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={typeof value === 'number' ? value : 50}
            disabled={phase !== 'answering'}
            aria-label={spec.prompt}
            onChange={(e) => {
              const v = Number(e.target.value)
              rec?.sliderInput(v)
              setValue(v)
            }}
            onPointerUp={() => {
              rec?.sliderCommit(!sliderTouched)
              setSliderTouched(true)
              if (value === null) setValue(50)
            }}
            onKeyUp={() => {
              rec?.sliderCommit(!sliderTouched)
              setSliderTouched(true)
            }}
          />
          <div className="slider-labels">
            <span>{spec.minLabel}</span>
            <output>{value === null ? '–' : value}</output>
            <span>{spec.maxLabel}</span>
          </div>
        </div>
      )}

      {spec.type === 'text' && (
        <div className="text">
          <label className="prompt" htmlFor={`t-${item.id}`}>
            {spec.prompt}
          </label>
          <textarea
            id={`t-${item.id}`}
            maxLength={spec.maxLength}
            rows={3}
            disabled={phase !== 'answering'}
            value={typeof value === 'string' ? value : ''}
            onPaste={() => rec?.paste()}
            onChange={(e) => {
              const prev = typeof value === 'string' ? value : ''
              rec?.textChange(prev, e.target.value)
              setValue(e.target.value)
            }}
          />
          <p className="hint">Please don&rsquo;t write names or anything that could identify you or someone else.</p>
        </div>
      )}

      {phase === 'answering' && (
        <button className="primary" disabled={!canValidate} onClick={validate}>
          Validate
        </button>
      )}

      {phase === 'confirming' && value !== null && (
        <div className="confirm" role="alertdialog" aria-label="Are you sure?">
          <p>Are you sure?</p>
          <div className="confirm-actions">
            <button
              onClick={() => {
                closePrompt()
                reconsidered.current++
                setPhase('answering')
              }}
            >
              Let me think again
            </button>
            <button
              className="primary"
              onClick={() => {
                closePrompt()
                finish(value)
              }}
            >
              Yes, validate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
