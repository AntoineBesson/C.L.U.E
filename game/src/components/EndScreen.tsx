import { useState } from 'react'
import { estimateTraits, uniqueness } from '../profile'
import { scoreCard } from '../scoring'
import { deleteAllData, exportData } from '../storage'
import type { Item, ResponseRecord } from '../types'

interface Props {
  items: Item[]
  responses: ResponseRecord[]
  tracking: boolean
  onPlayAgain: () => void
  onDeleted: () => void
}

export function EndScreen({ items, responses, tracking, onPlayAgain, onDeleted }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const prompted = responses.filter((r) => r.confirm.shown)
  const changed = prompted.filter((r) => r.confirm.changedAfterPrompt).length
  const signals = responses.map((r) => r.signals).filter((s) => s !== null)
  const avgSeconds = signals.length
    ? signals.reduce((sum, s) => sum + (s.msToFirstValidate ?? s.msTotal), 0) / signals.length / 1000
    : null
  const byId = new Map(items.map((i) => [i.id, i]))
  const scores = responses.map((r) => scoreCard(byId.get(r.itemId)!, r)).filter((s) => s !== null)
  const points = scores.reduce((sum, s) => sum + s.prediction + s.bonus, 0)
  const traits = estimateTraits(items, responses)
  const unique = uniqueness(items, responses)
  const placeholder = items.some((i) => i.crowd?.source === 'placeholder')
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
      <div className="panel">
      <h1>That&rsquo;s today&rsquo;s set</h1>
      <p className="lede">
        You answered {responses.length} dilemmas and scored <strong>{points}</strong> points for reading the crowd.
        {placeholder && ' (Crowd numbers are placeholders until real players have played.)'}
      </p>

      <h2>Your score</h2>
      <ul>
        {scores.map((s) => (
          <li key={s.itemId}>
            Prediction {s.prediction}/100
            {s.bonus > 0 && <> + {s.bonus} truth bonus</>}
            {s.sameAsYou !== null && <> · {Math.round(s.sameAsYou * 100)}% answered like you</>}
          </li>
        ))}
      </ul>

      <h2>What {responses.length} answers say about you</h2>
      <p className="hint">
        A rough first guess from which options you picked. Wide bars mean little evidence; this gets sharper with
        every day you play.
      </p>
      <ul className="traits">
        {traits.map((t) => (
          <li key={t.trait}>
            {t.label}: {t.value >= 0 ? 'leans high' : 'leans low'} ({t.value.toFixed(2)} ± {t.spread.toFixed(2)},{' '}
            {t.evidence} answer{t.evidence === 1 ? '' : 's'})
          </li>
        ))}
      </ul>
      {unique.answers > 0 && (
        <p>
          From {unique.answers} answers alone, about <strong>one player in {unique.oneIn.toLocaleString()}</strong>{' '}
          would have answered exactly like you ({unique.bits.toFixed(1)} bits). Every extra answer narrows it down.
        </p>
      )}

      <h2>What your answers already show</h2>
      <ul>
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
        <button className="primary" onClick={onPlayAgain}>
          Play another set
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
