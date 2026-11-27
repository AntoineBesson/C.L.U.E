import { useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'
import { shuffle } from '../items'
import { SignalRecorder } from '../tracking/SignalRecorder'
import type { AnswerValue, ChoiceOption, Item, ResponseRecord } from '../types'
import { Mascot } from '../ui/Mascot'
import { optionIndex, useKeys } from '../ui/keys'
import { sfx } from '../ui/sound'

const DOMAIN_LABELS: Record<string, string> = {
  work: 'Work', money: 'Money', friends: 'Friends', family: 'Family', online: 'Online', everyday: 'Everyday', sacrificial: 'Tough call',
}

interface Props {
  item: Item
  tracking: boolean
  playerId: string
  sessionId: string
  onDone: (r: ResponseRecord) => void
  /** When given, a "Skip" button lets the player pass on this card. */
  onSkip?: () => void
}

type Phase = 'answering' | 'confirming'

export function Card({ item, tracking, playerId, sessionId, onDone, onSkip }: Props) {
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
    sfx.whoosh()
  }, [])

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
      sfx.hmm()
      setPhase('confirming')
    } else {
      sfx.lock()
      finish(value)
    }
  }

  function closePrompt() {
    promptMs.current += performance.now() - promptOpenedAt.current
  }

  function choose(o: ChoiceOption) {
    rec?.selectOption(o.key, typeof value === 'string' ? value : null)
    if (value !== o.key) sfx.pop()
    setValue(o.key)
  }

  function reconsider() {
    closePrompt()
    sfx.back()
    reconsidered.current++
    setPhase('answering')
  }

  function confirmYes() {
    if (value === null) return
    closePrompt()
    sfx.lock()
    finish(value)
  }

  // Keyboard: 1-4 or A-D picks an option (as labelled on screen), Enter validates,
  // S skips. On "Are you sure?": Enter or Y validates, Esc or N reconsiders.
  useKeys((e) => {
    const onButton = e.target instanceof HTMLButtonElement
    const k = e.key.toLowerCase()
    if (phase === 'confirming') {
      if ((e.key === 'Enter' && !onButton) || k === 'y') {
        confirmYes()
        return true
      }
      if (e.key === 'Escape' || k === 'n') {
        reconsider()
        return true
      }
      return false
    }
    if (e.key === 'Enter' && !onButton) {
      validate()
      return true
    }
    if (onSkip && k === 's') {
      sfx.back()
      onSkip()
      return true
    }
    const i = optionIndex(e.key)
    if (options && i !== null && i < options.length) {
      choose(options[i])
      return true
    }
    return false
  })

  return (
    <div
      ref={cardRef}
      className={phase === 'confirming' ? 'panel card is-confirming' : 'panel card'}
      onPointerMove={
        rec
          ? (e) => {
              const box = cardRef.current?.getBoundingClientRect()
              if (box) rec.pointerMove(e.clientX - box.left, e.clientY - box.top, box.width)
            }
          : undefined
      }
    >
      <div className="card-tags">
        <span className={`chip domain-${item.domain}`}>{DOMAIN_LABELS[item.domain] ?? item.domain}</span>
        <span className="chip heat" aria-label={`Intensity ${item.intensity} of 3`}>
          {[1, 2, 3].map((n) => (
            <i key={n} className={n <= item.intensity ? 'on' : ''} />
          ))}
        </span>
      </div>
      <p className="scenario">{item.scenario}</p>

      {options && (
        <div className={spec.type === 'binary' ? 'options binary' : 'options'}>
          {options.map((o, i) => (
            <button
              key={o.key}
              className={value === o.key ? `option c${i} selected` : `option c${i}`}
              style={{ '--i': i } as React.CSSProperties}
              disabled={phase !== 'answering'}
              onPointerEnter={() => rec?.hoverOption(o.key)}
              onClick={() => choose(o)}
            >
              <span className="badge" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="option-text">{o.text}</span>
            </button>
          ))}
        </div>
      )}

      {spec.type === 'slider' && (
        <div className="slider">
          <p className="prompt">{spec.prompt}</p>
          <div className="slider-bubble" aria-hidden="true">
            <span style={{ left: `${typeof value === 'number' ? value : 50}%` }} className={value === null ? 'unset' : ''}>
              {value === null ? '?' : value}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={typeof value === 'number' ? value : 50}
            disabled={phase !== 'answering'}
            aria-label={spec.prompt}
            style={{ '--pct': `${typeof value === 'number' ? value : 50}%` } as React.CSSProperties}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (v % 10 === 0) sfx.tick()
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
          <p className="counter" aria-hidden="true">
            {typeof value === 'string' ? value.length : 0}/{spec.maxLength}
          </p>
          <p className="hint">Please don&rsquo;t write names or anything that could identify you or someone else.</p>
        </div>
      )}

      {phase === 'answering' && (
        <button className="primary big" disabled={!canValidate} onClick={validate}>
          Validate
        </button>
      )}
      {phase === 'answering' && (
        <p className="kbd-hint" aria-hidden="true">
          {options ? (
            <>
              <kbd>1</kbd>-<kbd>{options.length}</kbd> or <kbd>A</kbd>-<kbd>{String.fromCharCode(64 + options.length)}</kbd> to pick ·{' '}
            </>
          ) : null}
          <kbd>Enter</kbd> to validate{onSkip ? <> · <kbd>S</kbd> to skip</> : null}
        </p>
      )}
      {phase === 'answering' && onSkip && (
        <button
          className="link-btn skip"
          onClick={() => {
            sfx.back()
            onSkip()
          }}
        >
          Skip this one
        </button>
      )}

      {phase === 'confirming' && value !== null && (
        <div className="confirm" role="alertdialog" aria-label="Are you sure?">
          <Mascot mood="unsure" size={72} />
          <p>Are you sure?</p>
          <div className="confirm-actions">
            <button
              onClick={reconsider}
            >
              Let me think again
            </button>
            <button
              className="primary"
              onClick={confirmYes}
            >
              Yes, validate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
