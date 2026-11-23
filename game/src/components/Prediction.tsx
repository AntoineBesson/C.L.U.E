import { useState } from 'react'
import { defaultPrediction, normalise } from '../scoring'
import type { CrowdPrediction, Item } from '../types'

/**
 * "How did everyone else answer?" Shown after the player's own answer.
 * Plain markup on purpose: the visual design lives in the frontend thread.
 */
export function Prediction({ item, onDone }: { item: Item; onDone: (p: CrowdPrediction) => void }) {
  const [pred, setPred] = useState<CrowdPrediction>(() => defaultPrediction(item)!)
  const a = item.answer

  if (pred.kind === 'mean' && a.type === 'slider') {
    return (
      <div className="panel card prediction">
        <p className="scenario">{item.scenario}</p>
        <p className="prompt">What will other players answer on average?</p>
        <input
          type="range"
          min={0}
          max={100}
          value={pred.mean}
          aria-label="Predicted average"
          onChange={(e) => setPred({ kind: 'mean', mean: Number(e.target.value) })}
        />
        <div className="slider-labels">
          <span>{a.minLabel}</span>
          <output>{pred.mean}</output>
          <span>{a.maxLabel}</span>
        </div>
        <button className="primary" onClick={() => onDone(pred)}>
          Lock in my guess
        </button>
      </div>
    )
  }

  if (pred.kind === 'shares' && (a.type === 'choice' || a.type === 'binary')) {
    const shares = normalise(pred.shares)
    return (
      <div className="panel card prediction">
        <p className="scenario">{item.scenario}</p>
        <p className="prompt">How do you think other players split?</p>
        {a.options.map((o) => (
          <label key={o.key} className="share">
            <span>{o.text}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={pred.shares[o.key]}
              aria-label={`Share for: ${o.text}`}
              onChange={(e) =>
                setPred({ kind: 'shares', shares: { ...pred.shares, [o.key]: Number(e.target.value) } })
              }
            />
            <output>{Math.round(shares[o.key] * 100)}%</output>
          </label>
        ))}
        <button className="primary" onClick={() => onDone({ kind: 'shares', shares })}>
          Lock in my guess
        </button>
      </div>
    )
  }
  return null
}
