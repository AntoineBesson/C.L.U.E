import { useState } from 'react'
import { addEntry, LEADERBOARD_SIZE, placeOf, sanitiseName, type LeaderboardEntry, type SetScore } from '../leaderboard'
import { getLeaderboard, getNickname, randomId, saveLeaderboard, saveNickname } from '../storage'
import { sfx } from '../ui/sound'

const CROWD_NOTE: Record<LeaderboardEntry['crowd'], string> = {
  agents: 'vs simulated crowd',
  humans: 'vs real players',
  placeholder: 'vs made-up numbers',
  mixed: 'vs mixed crowds',
}

/** Local leaderboard: kept in this browser, never sent anywhere. */
export function Leaderboard({ set }: { set: SetScore }) {
  const [board, setBoard] = useState<LeaderboardEntry[]>(getLeaderboard)
  const [name, setName] = useState(getNickname)
  const [savedId, setSavedId] = useState<string | null>(null)
  const canSave = set.scores.length > 0 && savedId === null

  function save() {
    const clean = sanitiseName(name) || 'Anonymous'
    const entry: LeaderboardEntry = {
      id: randomId(),
      name: clean,
      average: set.average,
      total: set.total,
      guesses: set.scores.length,
      at: new Date().toISOString(),
      crowd: set.crowd,
    }
    const next = addEntry(board, entry)
    saveLeaderboard(next)
    saveNickname(clean)
    setBoard(next)
    setSavedId(entry.id)
    sfx.lock()
  }

  const top = board.slice(0, LEADERBOARD_SIZE)
  const place = savedId ? placeOf(board, savedId) : null
  const shownMine = savedId !== null && top.some((e) => e.id === savedId)
  const mine = savedId ? board.find((e) => e.id === savedId) : undefined

  return (
    <section className="leaderboard" aria-labelledby="board-title">
      <h2 id="board-title">Crowd readers leaderboard</h2>
      <p className="hint">
        Ranked by average points per guess. Kept on this device only: nothing here is sent anywhere.
      </p>
      {canSave && (
        <form
          className="board-form"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <input
            value={name}
            maxLength={20}
            placeholder="Your name or nickname"
            aria-label="Name for the leaderboard"
            onChange={(e) => setName(e.target.value)}
          />
          <button className="primary" type="submit">
            Add my score ({set.average})
          </button>
        </form>
      )}
      {place !== null && (
        <p className="tagline">
          {place === 1 ? 'New record! You are #1 on this device.' : `You placed #${place} of ${board.length}.`}
        </p>
      )}
      {top.length > 0 || set.scores.length > 0 ? (
        <ol className="board">
          {top.map((e, i) => (
            <li key={e.id} className={e.id === savedId ? 'me' : undefined}>
              <span className="place">#{i + 1}</span>
              <span className="who">
                {e.name}
                <small>
                  {e.guesses} guess{e.guesses === 1 ? '' : 'es'} · {new Date(e.at).toLocaleDateString()} · {CROWD_NOTE[e.crowd]}
                </small>
              </span>
              <span className="avg">
                {e.average} <small>avg</small>
              </span>
            </li>
          ))}
          {mine && !shownMine && (
            <li className="me">
              <span className="place">#{place}</span>
              <span className="who">{mine.name}</span>
              <span className="avg">
                {mine.average} <small>avg</small>
              </span>
            </li>
          )}
          {set.scores.length > 0 && (
            <li className="bot">
              <span className="place">🤖</span>
              <span className="who">
                Clu, always guessing an even split
                <small>on the cards you just played</small>
              </span>
              <span className="avg">
                {set.evenSplit} <small>avg</small>
              </span>
            </li>
          )}
        </ol>
      ) : (
        <p className="hint">No scores yet.</p>
      )}
    </section>
  )
}
