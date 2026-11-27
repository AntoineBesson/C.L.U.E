import { useEffect, useMemo, useState } from 'react'
import { crowdLabel } from '../crowd'
import { verdict } from '../feedback'
import { ITEMS, shuffle } from '../items'
import { packItems, type Pack } from '../packs'
import {
  cardPoints,
  MAX_PLAYERS,
  MIN_PLAYERS,
  roomPlayable,
  roomSplit,
  standings,
  targetSplit,
  type RoomTarget,
  type RoomTurn,
} from '../room'
import { getRoomSeen, markRoomSeen, randomId, resetRoomSeen } from '../storage'
import type { AnswerValue, Item } from '../types'
import { Confetti } from '../ui/Confetti'
import { Mascot } from '../ui/Mascot'
import { Progress } from '../ui/TopBar'
import { sfx } from '../ui/sound'
import { Card } from './Card'
import { Prediction } from './Prediction'

interface Setup {
  names: string[]
  cards: number
  target: RoomTarget
}

type Phase =
  | { kind: 'setup' }
  | { kind: 'handoff'; card: number; player: number }
  | { kind: 'answer'; card: number; player: number }
  | { kind: 'guess'; card: number; player: number; value: AnswerValue }
  | { kind: 'reveal'; card: number }
  | { kind: 'end' }

/** Private pass-and-play room: friends share one phone. Nothing here is saved or sent. */
export function Room({ pack, onExit, setTopBar }: {
  pack: Pack
  onExit: () => void
  /** Lets the room put its progress in the top bar. */
  setTopBar: (node: React.ReactNode) => void
}) {
  const [setup, setSetup] = useState<Setup>({ names: ['', '', ''], cards: 5, target: 'room' })
  const [phase, setPhase] = useState<Phase>({ kind: 'setup' })
  const [items, setItems] = useState<Item[]>([])
  const [turns, setTurns] = useState<RoomTurn[][]>([])
  const [roomId, setRoomId] = useState(randomId)

  const names = setup.names.map((n, i) => n.trim().slice(0, 16) || `Player ${i + 1}`)
  const pool = useMemo(
    () => packItems(pack, ITEMS).filter((i) => roomPlayable(i, setup.target)),
    [pack, setup.target],
  )
  const [roomSeen, setRoomSeen] = useState(getRoomSeen)
  const fresh = pool.filter((i) => !roomSeen.has(i.id))

  const totals = names.map((_, p) =>
    turns.reduce((sum, cardTurns, c) => (items[c] ? sum + (cardPoints(items[c], cardTurns, setup.target)[p] ?? 0) : sum), 0),
  )

  const cardIndex = 'card' in phase ? phase.card : -1
  useEffect(() => {
    setTopBar(cardIndex >= 0 ? <Progress index={cardIndex} total={items.length} /> : null)
  }, [cardIndex, items.length, setTopBar])
  useEffect(() => () => setTopBar(null), [setTopBar])

  function start() {
    const picked = shuffle(fresh).slice(0, setup.cards)
    if (picked.length === 0) return
    picked.forEach((i) => markRoomSeen(i.id))
    setRoomSeen(getRoomSeen())
    setItems(picked)
    setTurns(picked.map(() => []))
    setRoomId(randomId())
    sfx.whoosh()
    setPhase({ kind: 'handoff', card: 0, player: 0 })
  }

  function nextAfterGuess(card: number, player: number) {
    if (player + 1 < names.length) setPhase({ kind: 'handoff', card, player: player + 1 })
    else setPhase({ kind: 'reveal', card })
  }

  if (phase.kind === 'setup') {
    const canAdd = setup.names.length < MAX_PLAYERS
    const canRemove = setup.names.length > MIN_PLAYERS
    return (
      <main>
        <div className="panel room-setup">
          <div className="hero">
            <Mascot mood="happy" size={80} />
            <div>
              <h1>Private room</h1>
              <p className="tagline">
                {pack.emoji} {pack.label} · pass the phone around
              </p>
            </div>
          </div>

          <h2>Who&rsquo;s playing?</h2>
          <ol className="room-names">
            {setup.names.map((n, i) => (
              <li key={i}>
                <input
                  value={n}
                  maxLength={16}
                  placeholder={`Player ${i + 1}`}
                  aria-label={`Player ${i + 1} name`}
                  onChange={(e) =>
                    setSetup((s) => ({ ...s, names: s.names.map((x, j) => (j === i ? e.target.value : x)) }))
                  }
                />
                {canRemove && (
                  <button
                    className="icon-x"
                    aria-label={`Remove player ${i + 1}`}
                    onClick={() => setSetup((s) => ({ ...s, names: s.names.filter((_, j) => j !== i) }))}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ol>
          {canAdd && (
            <button className="link-btn" onClick={() => setSetup((s) => ({ ...s, names: [...s.names, ''] }))}>
              + Add a player
            </button>
          )}

          <h2>What do you guess?</h2>
          <label className="toggle">
            <input
              type="checkbox"
              checked={setup.target === 'database'}
              onChange={(e) => setSetup((s) => ({ ...s, target: e.target.checked ? 'database' : 'room' }))}
            />
            <span className="toggle-track" aria-hidden="true" />
            <span>
              <strong>Database answers</strong>
              <small>
                {setup.target === 'database'
                  ? 'On: guess how the database answered (today, a simulated crowd of AI players).'
                  : 'Off: guess how the people in this room answered.'}
              </small>
            </span>
          </label>

          <h2>How many cards?</h2>
          <div className="seg" role="radiogroup" aria-label="Cards">
            {[3, 5, 10].map((n) => (
              <button
                key={n}
                role="radio"
                aria-checked={setup.cards === n}
                className={setup.cards === n ? 'selected' : undefined}
                onClick={() => setSetup((s) => ({ ...s, cards: n }))}
              >
                {n}
              </button>
            ))}
          </div>

          {fresh.length === 0 ? (
            <div className="room-empty">
              <p>Every card in this pack has been played in a room on this phone.</p>
              <button
                onClick={() => {
                  resetRoomSeen(pool.map((i) => i.id))
                  setRoomSeen(getRoomSeen())
                }}
              >
                Play this pack again
              </button>
            </div>
          ) : (
            <p className="hint">
              {fresh.length < setup.cards
                ? `Only ${fresh.length} new card${fresh.length === 1 ? '' : 's'} left in this pack.`
                : `${fresh.length} new cards in this pack.`}{' '}
              Answers stay on this phone for this game only: nothing is saved or sent.
            </p>
          )}

          <div className="actions">
            <button className="primary big" disabled={fresh.length === 0} onClick={start}>
              Start the room
            </button>
            <button onClick={onExit}>Back to menu</button>
          </div>
        </div>
      </main>
    )
  }

  if (phase.kind === 'handoff') {
    return (
      <main>
        <div className="panel handoff" key={`h-${phase.card}-${phase.player}`}>
          <p className="kicker">
            Card {phase.card + 1} of {items.length}
          </p>
          <Mascot mood="curious" size={96} />
          <h1>
            Pass the phone to
            <span className="handoff-name">{names[phase.player]}</span>
          </h1>
          <p className="hint">No peeking at the others&rsquo; answers!</p>
          <button
            className="primary big"
            autoFocus
            onClick={() => {
              sfx.pop()
              setPhase({ kind: 'answer', card: phase.card, player: phase.player })
            }}
          >
            I&rsquo;m {names[phase.player]}, show my card
          </button>
        </div>
      </main>
    )
  }

  if (phase.kind === 'answer') {
    const item = items[phase.card]
    return (
      <main>
        <p className="turn-label">{names[phase.player]}&rsquo;s turn</p>
        <Card
          key={`${roomId}-${item.id}-${phase.player}`}
          item={item}
          tracking={false}
          playerId="room"
          sessionId={roomId}
          onDone={(r) => setPhase({ kind: 'guess', card: phase.card, player: phase.player, value: r.value })}
        />
      </main>
    )
  }

  if (phase.kind === 'guess') {
    const item = items[phase.card]
    const toRoom = setup.target === 'room'
    return (
      <main>
        <p className="turn-label">{names[phase.player]}&rsquo;s turn</p>
        <Prediction
          key={`p-${roomId}-${item.id}-${phase.player}`}
          item={item}
          who={toRoom ? 'the room' : 'the database'}
          kicker={toRoom ? `${names.length} players` : 'Database'}
          title={toRoom ? 'Guess the room' : 'Guess the database'}
          onDone={(prediction) => {
            setTurns((ts) =>
              ts.map((t, c) => (c === phase.card ? [...t, { player: phase.player, value: phase.value, prediction }] : t)),
            )
            nextAfterGuess(phase.card, phase.player)
          }}
        />
      </main>
    )
  }

  if (phase.kind === 'reveal') {
    return (
      <RoomReveal
        item={items[phase.card]}
        turns={turns[phase.card]}
        names={names}
        totals={totals}
        target={setup.target}
        last={phase.card + 1 >= items.length}
        onNext={() =>
          phase.card + 1 < items.length
            ? setPhase({ kind: 'handoff', card: phase.card + 1, player: 0 })
            : setPhase({ kind: 'end' })
        }
      />
    )
  }

  const table = standings(names, totals)
  const winners = table.filter((r) => r.place === 1)
  return (
    <main>
      <Confetti />
      <div className="panel room-end">
        <div className="hero">
          <Mascot mood="happy" size={88} />
          <div>
            <h1>
              {winners.length === 1
                ? `${winners[0].name} reads people best!`
                : `${winners.map((w) => w.name).join(' and ')} tie for first!`}
            </h1>
            <p className="tagline">
              {items.length} cards · {setup.target === 'room' ? 'guessing the room' : 'guessing the database'}
            </p>
          </div>
        </div>
        <ol className="board podium">
          {table.map((r) => (
            <li key={r.name} className={r.place === 1 ? 'me' : undefined}>
              <span className="place">{r.place === 1 ? '🏆' : `#${r.place}`}</span>
              <span className="who">{r.name}</span>
              <span className="avg">
                {r.total} <small>pts</small>
              </span>
            </li>
          ))}
        </ol>
        <div className="actions">
          <button className="primary big" disabled={fresh.length === 0} onClick={start}>
            {fresh.length === 0 ? 'No new cards left in this pack' : 'Rematch, same players'}
          </button>
          <button onClick={() => setPhase({ kind: 'setup' })}>Change players or settings</button>
          <button onClick={onExit}>Back to menu</button>
        </div>
      </div>
    </main>
  )
}

function RoomReveal({ item, turns, names, totals, target, last, onNext }: {
  item: Item
  turns: RoomTurn[]
  names: string[]
  totals: number[]
  target: RoomTarget
  last: boolean
  onNext: () => void
}) {
  useEffect(() => sfx.fanfare(), [])
  const room = roomSplit(item, turns)
  const goal = targetSplit(item, turns, target)
  const pts = cardPoints(item, turns, target)
  const best = Math.max(...Object.values(pts))
  const [line] = useState(() => {
    const top = turns.filter((t) => pts[t.player] === best).map((t) => names[t.player])
    return `${top.join(' and ')}: ${verdict(best)}`
  })
  const a = item.answer
  const db = item.crowd

  return (
    <main>
      <div className="panel card reveal room-reveal">
        <div className="predict-head">
          <Mascot mood="happy" size={64} />
          <div>
            <p className="kicker">{target === 'room' ? 'How the room split' : db ? crowdLabel(db) : 'Database'}</p>
            <h2>The reveal</h2>
          </div>
        </div>
        <p className="scenario small">{item.scenario}</p>

        {room.kind === 'shares' && (a.type === 'choice' || a.type === 'binary') && (
          <ul className="reveal-bars">
            {a.options.map((o, i) => {
              const inRoom = room.answerShare[o.key] ?? 0
              const pct = Math.round(((goal?.kind === 'shares' ? goal.answerShare[o.key] : 0) ?? 0) * 100)
              const count = turns.filter((t) => t.value === o.key).length
              return (
                <li key={o.key} className={`reveal-row c${i}`} style={{ '--i': i } as React.CSSProperties}>
                  <div className="share-top">
                    <span className="share-text">{o.text}</span>
                    <output>{pct}%</output>
                  </div>
                  <div className="reveal-track">
                    <span className="reveal-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="reveal-meta">
                    {target === 'database'
                      ? `${count} in the room (${Math.round(inRoom * 100)}%)`
                      : `${count} of ${room.n} player${room.n === 1 ? '' : 's'}`}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {room.kind === 'mean' && a.type === 'slider' && (
          <div className="reveal-slider">
            <div className="reveal-track wide">
              {goal?.kind === 'mean' && <span className="reveal-mark crowd" style={{ left: `${goal.mean}%` }} />}
              {target === 'database' && <span className="reveal-mark guess" style={{ left: `${room.mean}%` }} />}
            </div>
            <div className="slider-labels">
              <span>{a.minLabel}</span>
              <span>{a.maxLabel}</span>
            </div>
            <ul className="reveal-legend">
              {goal?.kind === 'mean' && (
                <li className="crowd">
                  <b>{Math.round(goal.mean)}</b> {target === 'room' ? 'room average' : 'database average'}
                </li>
              )}
              {target === 'database' && (
                <li className="guess">
                  <b>{Math.round(room.mean)}</b> room average
                </li>
              )}
            </ul>
          </div>
        )}

        <p className="insight">{line}</p>
        <h3 className="room-points-title">Points this card</h3>
        <ul className="room-points">
          {turns.map((t) => {
            const note = t.prediction.kind === 'mean' ? `guessed ${t.prediction.mean}` : null
            return (
              <li key={t.player} className={pts[t.player] === best ? 'best' : undefined}>
                <span className="who">
                  {names[t.player]}
                  {note && <small>{note}</small>}
                </span>
                <span className="pts">+{pts[t.player]}</span>
                <span className="tot">{totals[t.player]} total</span>
              </li>
            )
          })}
        </ul>

        <button className="primary big" onClick={onNext} autoFocus>
          {last ? 'Final standings' : 'Next card'}
        </button>
      </div>
    </main>
  )
}
