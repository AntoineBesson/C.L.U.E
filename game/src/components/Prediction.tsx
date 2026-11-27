import { useEffect, useRef, useState } from 'react'
import { defaultPrediction, normalise } from '../scoring'
import type { CrowdPrediction, Item } from '../types'
import { Mascot } from '../ui/Mascot'
import { optionIndex, useKeys } from '../ui/keys'
import { sfx } from '../ui/sound'

/** "How did everyone else answer?" Shown after the player's own answer. */
export function Prediction({
  item,
  onDone,
  who = 'other players',
  kicker = 'Bonus round',
  title = 'Guess the crowd',
}: {
  item: Item
  onDone: (p: CrowdPrediction) => void
  /** Who is being guessed, e.g. "other players" or "the room". */
  who?: string
  kicker?: string
  title?: string
}) {
  const [pred, setPred] = useState<CrowdPrediction>(() => defaultPrediction(item)!)
  const a = item.answer
  useEffect(() => sfx.whoosh(), [])

  const header = (
    <div className="predict-head">
      <Mascot mood="curious" size={64} />
      <div>
        <p className="kicker">{kicker}</p>
        <h2>{title}</h2>
      </div>
    </div>
  )

  function lockIn(p: CrowdPrediction) {
    sfx.lock()
    onDone(p)
  }

  // Keyboard: Enter locks in; 1-4 jumps to that option's slider (then arrows adjust it).
  const box = useRef<HTMLDivElement>(null)
  useKeys((e) => {
    if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) {
      lockIn(pred.kind === 'shares' ? { kind: 'shares', shares: normalise(pred.shares) } : pred)
      return true
    }
    const i = /^[1-9]$/.test(e.key) ? optionIndex(e.key) : null
    const sliders = box.current?.querySelectorAll<HTMLInputElement>('input[type=range]')
    if (i !== null && sliders && i < sliders.length) {
      sliders[i].focus()
      return true
    }
    return false
  })
  const hint = (
    <p className="kbd-hint" aria-hidden="true">
      {pred.kind === 'shares' && (
        <>
          <kbd>1</kbd>-<kbd>{Object.keys(pred.shares).length}</kbd> pick a bar, <kbd>←</kbd>
          <kbd>→</kbd> adjust ·{' '}
        </>
      )}
      <kbd>Enter</kbd> to lock in
    </p>
  )

  if (pred.kind === 'mean' && a.type === 'slider') {
    return (
      <div className="panel card prediction" ref={box}>
        {header}
        <p className="scenario small">{item.scenario}</p>
        <p className="prompt">What will {who} answer on average?</p>
        <div className="slider">
          <div className="slider-bubble" aria-hidden="true">
            <span style={{ left: `${pred.mean}%` }}>{pred.mean}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={pred.mean}
            aria-label="Predicted average"
            style={{ '--pct': `${pred.mean}%` } as React.CSSProperties}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (v % 10 === 0) sfx.tick()
              setPred({ kind: 'mean', mean: v })
            }}
          />
          <div className="slider-labels">
            <span>{a.minLabel}</span>
            <output>{pred.mean}</output>
            <span>{a.maxLabel}</span>
          </div>
        </div>
        <button className="primary big" onClick={() => lockIn(pred)}>
          Lock in my guess
        </button>
        {hint}
      </div>
    )
  }

  if (pred.kind === 'shares' && (a.type === 'choice' || a.type === 'binary')) {
    const shares = normalise(pred.shares)
    return (
      <div className="panel card prediction" ref={box}>
        {header}
        <p className="scenario small">{item.scenario}</p>
        <p className="prompt">How do you think {who} split?</p>
        <div className="shares">
          {a.options.map((o, i) => {
            const pct = Math.round(shares[o.key] * 100)
            return (
              <label key={o.key} className={`share c${i}`}>
                <span className="share-top">
                  <span className="share-text">{o.text}</span>
                  <output>{pct}%</output>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={pred.shares[o.key]}
                  aria-label={`Share for: ${o.text}`}
                  style={{ '--pct': `${pred.shares[o.key]}%` } as React.CSSProperties}
                  onChange={(e) =>
                    setPred({ kind: 'shares', shares: { ...pred.shares, [o.key]: Number(e.target.value) } })
                  }
                />
              </label>
            )
          })}
        </div>
        <button className="primary big" onClick={() => lockIn({ kind: 'shares', shares })}>
          Lock in my guess
        </button>
        {hint}
      </div>
    )
  }
  return null
}
