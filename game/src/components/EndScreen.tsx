import { useEffect, useState } from 'react'
import { deleteAllData, exportData } from '../storage'
import type { ResponseRecord } from '../types'
import { Confetti } from '../ui/Confetti'
import { Mascot } from '../ui/Mascot'
import { sfx } from '../ui/sound'

interface Props {
  responses: ResponseRecord[]
  tracking: boolean
  onPlayAgain: () => void
  onDeleted: () => void
}

export function EndScreen({ responses, tracking, onPlayAgain, onDeleted }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  useEffect(() => sfx.fanfare(), [])
  const prompted = responses.filter((r) => r.confirm.shown)
  const changed = prompted.filter((r) => r.confirm.changedAfterPrompt).length
  const signals = responses.map((r) => r.signals).filter((s) => s !== null)
  const avgSeconds = signals.length
    ? signals.reduce((sum, s) => sum + (s.msToFirstValidate ?? s.msTotal), 0) / signals.length / 1000
    : null
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
        <h1>That&rsquo;s today&rsquo;s set!</h1>
      </div>
      <p className="lede">
        You answered {responses.length} dilemmas. The profile reveal will appear here once the models exist.
      </p>

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
