import { useEffect } from 'react'
import { crowdLabel } from '../crowd'
import { normalise, scoreCard } from '../scoring'
import type { Item, ResponseRecord } from '../types'
import { CountUp } from '../ui/CountUp'
import { Mascot } from '../ui/Mascot'
import { sfx } from '../ui/sound'

/** Right after the guess: how the crowd actually split, next to the player's guess. */
export function Reveal({ item, response, onNext, last }: {
  item: Item
  response: ResponseRecord
  onNext: () => void
  last: boolean
}) {
  const score = scoreCard(item, response)
  const crowd = item.crowd
  const a = item.answer
  const pts = score ? score.prediction + score.bonus : 0
  useEffect(() => {
    if (pts >= 75) sfx.fanfare()
    else sfx.lock()
  }, [pts])
  if (!crowd || !score) return null

  const verdict =
    pts >= 90 ? 'Spot on!' : pts >= 75 ? 'Great read!' : pts >= 55 ? 'Not bad.' : pts >= 35 ? 'Hmm, close-ish.' : 'The crowd surprised you!'

  const p = response.prediction
  return (
    <div className="panel card reveal">
      <div className="predict-head">
        <Mascot mood={pts >= 55 ? 'happy' : 'unsure'} size={64} />
        <div>
          <p className="kicker">{crowdLabel(crowd)}</p>
          <h2>{verdict}</h2>
        </div>
        <div className="reveal-score" aria-label={`${pts} points out of 100`}>
          <CountUp value={pts} />
          <span>/100</span>
        </div>
      </div>
      <p className="scenario small">{item.scenario}</p>

      {crowd.kind === 'shares' && p?.kind === 'shares' && (a.type === 'choice' || a.type === 'binary') && (
        <ul className="reveal-bars">
          {a.options.map((o, i) => {
            const real = Math.round((crowd.answerShare[o.key] ?? 0) * 100)
            const guess = Math.round((normalise(p.shares)[o.key] ?? 0) * 100)
            const mine = response.value === o.key
            return (
              <li key={o.key} className={`reveal-row c${i}${mine ? ' mine' : ''}`} style={{ '--i': i } as React.CSSProperties}>
                <div className="share-top">
                  <span className="share-text">
                    {o.text}
                    {mine && <span className="you-tag">your answer</span>}
                  </span>
                  <output>{real}%</output>
                </div>
                <div className="reveal-track" role="img" aria-label={`Crowd ${real}%, your guess ${guess}%`}>
                  <span className="reveal-fill" style={{ width: `${real}%` }} />
                  <span className="reveal-guess" style={{ left: `${guess}%` }} title={`Your guess: ${guess}%`} />
                </div>
                <div className="reveal-meta">you guessed {guess}%</div>
              </li>
            )
          })}
        </ul>
      )}

      {crowd.kind === 'mean' && p?.kind === 'mean' && a.type === 'slider' && (
        <div className="reveal-slider">
          <div className="reveal-track wide" role="img" aria-label={`Crowd average ${crowd.mean}, your guess ${p.mean}, your answer ${response.value}`}>
            <span className="reveal-mark you" style={{ left: `${Number(response.value)}%` }} />
            <span className="reveal-mark guess" style={{ left: `${p.mean}%` }} />
            <span className="reveal-mark crowd" style={{ left: `${crowd.mean}%` }} />
          </div>
          <div className="slider-labels">
            <span>{a.minLabel}</span>
            <span>{a.maxLabel}</span>
          </div>
          <ul className="reveal-legend">
            <li className="crowd"><b>{Math.round(crowd.mean)}</b> crowd average</li>
            <li className="guess"><b>{p.mean}</b> your guess</li>
            <li className="you"><b>{response.value}</b> your answer</li>
          </ul>
        </div>
      )}

      {score.sameAsYou !== null && (
        <p className="hint">
          {Math.round(score.sameAsYou * 100)}% answered like you.
          {score.bonus > 0 && <> Your answer was more common than predicted: +{score.bonus} truth bonus.</>}
        </p>
      )}
      <button className="primary big" onClick={onNext} autoFocus>
        {last ? 'See my results' : 'Next dilemma'}
      </button>
    </div>
  )
}
