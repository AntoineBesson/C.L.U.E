import { useEffect, useState } from 'react'
import { estimateTraits, uniqueness } from '../profile'
import { SIMULATED_AGENTS } from '../crowd'
import { scoreSet } from '../leaderboard'
import { deleteAllData, exportData } from '../storage'
import type { Item, ResponseRecord } from '../types'
import { Leaderboard } from './Leaderboard'
import { Confetti } from '../ui/Confetti'
import { CountUp } from '../ui/CountUp'
import { Mascot } from '../ui/Mascot'
import { sfx } from '../ui/sound'

interface Props {
  items: Item[]
  responses: ResponseRecord[]
  tracking: boolean
  /** Unseen dilemmas left in the bank. */
  remaining: number
  onPlayAgain: () => void
  onDeleted: () => void
}

export function EndScreen({ items, responses, tracking, remaining, onPlayAgain, onDeleted }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  useEffect(() => sfx.fanfare(), [])
  const prompted = responses.filter((r) => r.confirm.shown)
  const changed = prompted.filter((r) => r.confirm.changedAfterPrompt).length
  const signals = responses.map((r) => r.signals).filter((s) => s !== null)
  const avgSeconds = signals.length
    ? signals.reduce((sum, s) => sum + (s.msToFirstValidate ?? s.msTotal), 0) / signals.length / 1000
    : null
  const set = scoreSet(items, responses)
  const { scores, total: points } = set
  const traits = estimateTraits(items, responses)
  const unique = uniqueness(items, responses)
  const placeholder = items.some((i) => i.crowd?.source === 'placeholder')
  const simulated = items.some((i) => i.crowd?.source === 'agents')
  const totalChanges = signals.reduce((sum, s) => sum + s.answerChanges, 0)

  function download() {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'clue-my-data.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <main>
      <Confetti />
      <div className="panel end">
      <div className="hero">
        <Mascot mood="happy" size={92} />
        <div>
          <h1>That&rsquo;s today&rsquo;s set!</h1>
          <p className="tagline">You answered {responses.length} dilemmas.</p>
        </div>
      </div>

      <div className="scoreboard">
        <div className="big-score">
          <CountUp value={points} />
          <span>points for reading the crowd</span>
        </div>
        {simulated && (
          <p className="hint">
            Simulated crowd: {SIMULATED_AGENTS} AI players with varied personalities stand in for real players until
            the study opens.
          </p>
        )}
        {placeholder && <p className="hint">Some crowd numbers are made up until players have answered them.</p>}
        <ol className="score-tiles">
          {scores.map((s, i) => (
            <li key={s.itemId} style={{ '--i': i } as React.CSSProperties}>
              <span className="tile-n">#{i + 1}</span>
              <strong>{s.prediction}</strong>
              <span className="tile-of">/100</span>
              {s.bonus > 0 && <span className="tile-bonus">+{s.bonus} truth bonus</span>}
              {s.sameAsYou !== null && (
                <span className="tile-same">{Math.round(s.sameAsYou * 100)}% answered like you</span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <Leaderboard set={set} />

      <h2>What {responses.length} answers say about you</h2>
      <p className="hint">
        A rough first guess from which options you picked. Wide bars mean little evidence; this gets sharper with
        every day you play.
      </p>
      <ul className="traits">
        {traits.map((t, i) => {
          const lo = Math.max(-1, t.value - t.spread)
          const hi = Math.min(1, t.value + t.spread)
          return (
            <li key={t.trait} style={{ '--i': i } as React.CSSProperties}>
              <div className="trait-top">
                <span className="trait-name">{t.label}</span>
                <span className="trait-lean">{t.value >= 0 ? 'leans high' : 'leans low'}</span>
              </div>
              <div
                className="trait-track"
                role="img"
                aria-label={`${t.label}: ${t.value.toFixed(2)} plus or minus ${t.spread.toFixed(2)}, from ${t.evidence} answer${t.evidence === 1 ? '' : 's'}`}
              >
                <span className="trait-range" style={{ left: `${(lo + 1) * 50}%`, width: `${(hi - lo) * 50}%` }} />
                <span className="trait-dot" style={{ left: `${(t.value + 1) * 50}%` }} />
              </div>
              <div className="trait-meta">
                {t.value.toFixed(2)} ± {t.spread.toFixed(2)} · {t.evidence} answer{t.evidence === 1 ? '' : 's'}
              </div>
            </li>
          )
        })}
      </ul>
      {unique.answers > 0 && (
        <div className="one-in">
          <p className="one-in-kicker">From {unique.answers} answers alone, about</p>
          <p className="one-in-big">
            1 in <CountUp value={unique.oneIn} />
          </p>
          <p>
            players would have answered exactly like you ({unique.bits.toFixed(1)} bits). Every extra answer narrows
            it down.
          </p>
        </div>
      )}

      <h2>What your answers already show</h2>
      <ul className="facts">
        <li>
          &ldquo;Are you sure?&rdquo; was asked on {prompted.length} of {responses.length} cards, and you changed
          your answer {changed} time{changed === 1 ? '' : 's'}.
        </li>
        {tracking && avgSeconds !== null && (
          <>
            <li>You took {avgSeconds.toFixed(1)} s on average before validating.</li>
            <li>You switched answers {totalChanges} time{totalChanges === 1 ? '' : 's'} before deciding.</li>
          </>
        )}
        {!tracking && <li>Hesitation tracking was off, so nothing about how you answered was recorded.</li>}
      </ul>

      <div className="actions">
        <button className="primary big" onClick={onPlayAgain}>
          {remaining > 0 ? `Play another set (${remaining} new dilemma${remaining === 1 ? '' : 's'} left)` : 'Play again'}
        </button>
        <button onClick={download}>Export my data</button>
        {!confirmDelete ? (
          <button className="danger" onClick={() => setConfirmDelete(true)}>
            Delete my data
          </button>
        ) : (
          <button
            className="danger"
            onClick={() => {
              deleteAllData()
              onDeleted()
            }}
          >
            Confirm: delete everything
          </button>
        )}
      </div>
      </div>
    </main>
  )
}
