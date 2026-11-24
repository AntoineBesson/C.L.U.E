import { useCallback, useEffect, useState } from 'react'
import { apiEnabled, fetchCrowd, fetchToday } from './api'
import { Card } from './components/Card'
import { ConsentScreen } from './components/ConsentScreen'
import { EndScreen } from './components/EndScreen'
import { Menu } from './components/Menu'
import { Prediction } from './components/Prediction'
import { Reveal } from './components/Reveal'
import { Room } from './components/Room'
import { CONFIG } from './config'
import { ITEMS, mergeServerSet, pickSession } from './items'
import { packItems, RANDOM_PACK, type Pack } from './packs'
import { defaultPrediction } from './scoring'
import { Backdrop } from './ui/Backdrop'
import { Mascot } from './ui/Mascot'
import { Progress, TopBar } from './ui/TopBar'
import {
  getConsent,
  getPlayerId,
  getSeenIds,
  markSeen,
  markSkipped,
  randomId,
  resetSeen,
  saveConsent,
  saveResponse,
} from './storage'
import type { Consent, Item, ResponseRecord } from './types'

interface Session {
  id: string
  pack: Pack
  items: Item[]
  responses: ResponseRecord[]
  /** Cards passed with "Skip this one". */
  skipped: string[]
  /** Waiting for today's cards from the server (only when the API is configured). */
  loading: boolean
}

type Mode = { kind: 'menu' } | { kind: 'solo'; session: Session } | { kind: 'room'; pack: Pack }

/** A new set of cards from this pack that the player has never seen on this device. */
function newSession(pack: Pack): Session {
  const items = pickSession(CONFIG.cardsPerSession, getSeenIds(), packItems(pack, ITEMS))
  // The server's daily set mixes every theme, so it is only used for the random mix.
  const loading = apiEnabled && items.length > 0 && pack.id === RANDOM_PACK.id
  return { id: randomId(), pack, items, responses: [], skipped: [], loading }
}

function unseenLeft(pack: Pack): number {
  const seen = getSeenIds()
  return packItems(pack, ITEMS).filter((i) => !seen.has(i.id)).length
}

function validConsent(): Consent | null {
  const c = getConsent()
  return c && c.version === CONFIG.consentVersion ? c : null
}

export default function App() {
  return (
    <>
      <Backdrop />
      <Game />
    </>
  )
}

function Game() {
  const [consent, setConsent] = useState<Consent | null>(validConsent)
  const [mode, setMode] = useState<Mode>({ kind: 'menu' })
  const [lastPack, setLastPack] = useState<Pack>(RANDOM_PACK)
  const [roomBar, setRoomBar] = useState<React.ReactNode>(null)
  const setTopBar = useCallback((n: React.ReactNode) => setRoomBar(n), [])

  if (!consent) {
    return (
      <>
        <TopBar />
        <ConsentScreen
          onAccept={(c) => {
            saveConsent(c)
            setConsent(c)
          }}
        />
      </>
    )
  }

  if (mode.kind === 'room') {
    return (
      <>
        <TopBar>{roomBar}</TopBar>
        <Room pack={mode.pack} setTopBar={setTopBar} onExit={() => setMode({ kind: 'menu' })} />
      </>
    )
  }

  if (mode.kind === 'solo') {
    return (
      <Solo
        key={mode.session.id}
        consent={consent}
        initial={mode.session}
        onMenu={() => setMode({ kind: 'menu' })}
        onNewSession={(pack) => setMode({ kind: 'solo', session: newSession(pack) })}
        onDeleted={() => {
          setConsent(null)
          setMode({ kind: 'menu' })
        }}
      />
    )
  }

  return (
    <>
      <TopBar />
      <Menu
        initialPack={lastPack}
        onSolo={(pack) => {
          setLastPack(pack)
          setMode({ kind: 'solo', session: newSession(pack) })
        }}
        onRoom={(pack) => {
          setLastPack(pack)
          setMode({ kind: 'room', pack })
        }}
      />
    </>
  )
}

function Solo({ consent, initial, onMenu, onNewSession, onDeleted }: {
  consent: Consent
  initial: Session
  onMenu: () => void
  onNewSession: (pack: Pack) => void
  onDeleted: () => void
}) {
  const [session, setSession] = useState<Session>(initial)
  /** Answer given, waiting for the crowd prediction. */
  const [pending, setPending] = useState<ResponseRecord | null>(null)
  /** Guess locked in: showing how the crowd split before the next card. */
  const [revealing, setRevealing] = useState<ResponseRecord | null>(null)

  // Today's cards come from the server when it is configured and reachable;
  // otherwise the local bank picked in newSession() is kept.
  const loadFor = session.loading ? session.id : null
  useEffect(() => {
    if (!loadFor) return
    let live = true
    void fetchToday(getPlayerId()).then((items) => {
      if (!live) return
      setSession((s) =>
        s.id === loadFor
          ? {
              ...s,
              loading: false,
              items: items && items.length ? mergeServerSet(items, CONFIG.cardsPerSession, getSeenIds()) : s.items,
            }
          : s,
      )
    })
    return () => {
      live = false
    }
  }, [loadFor])

  const index = session.responses.length + session.skipped.length
  const current = session.items[index] as Item | undefined
  // Mark a card as seen as soon as it is shown, so it never comes back, even if the set is abandoned.
  const currentId = !session.loading ? current?.id : undefined
  useEffect(() => {
    if (currentId) markSeen(currentId)
  }, [currentId])

  function record(r: ResponseRecord, item: Item) {
    saveResponse(r)
    setPending(null)
    if (r.prediction && item.crowd) setRevealing(r)
    setSession((s) => ({ ...s, responses: [...s.responses, r] }))
    // Crowd numbers are fetched only once the player has answered and guessed.
    // Real players' numbers replace the simulated crowd; the server's placeholders do not.
    if (apiEnabled) {
      void fetchCrowd(r.itemId).then((crowd) => {
        if (!crowd || (crowd.source !== 'humans' && item.crowd)) return
        setSession((s) => ({ ...s, items: s.items.map((i) => (i.id === r.itemId ? { ...i, crowd } : i)) }))
      })
    }
  }

  function skip(item: Item) {
    markSkipped(item.id)
    setSession((s) => ({ ...s, skipped: [...s.skipped, item.id] }))
  }

  if (session.loading) {
    return (
      <>
        <TopBar />
        <main>
          <div className="panel loading" role="status">
            <Mascot mood="curious" size={88} />
            <p>Shuffling today&rsquo;s dilemmas&hellip;</p>
          </div>
        </main>
      </>
    )
  }

  if (revealing) {
    const item = session.items.find((i) => i.id === revealing.itemId)!
    return (
      <>
        <TopBar>
          <Progress index={index - 1} total={session.items.length} />
        </TopBar>
        <main>
          <Reveal
            key={`r-${session.id}-${item.id}`}
            item={item}
            response={revealing}
            last={index >= session.items.length}
            onNext={() => setRevealing(null)}
          />
        </main>
      </>
    )
  }

  if (session.items.length === 0) {
    const pack = session.pack
    return (
      <>
        <TopBar />
        <main>
          <div className="panel done-bank">
            <Mascot mood="happy" size={96} />
            <h1>
              You&rsquo;ve seen every {pack.id === RANDOM_PACK.id ? 'dilemma' : `${pack.label} dilemma`}!
            </h1>
            <p className="lede">
              All {packItems(pack, ITEMS).length} cards {pack.id === RANDOM_PACK.id ? 'in the bank' : 'in this pack'}{' '}
              have been played on this device, and none will repeat. New ones are on the way.
            </p>
            <div className="actions">
              <button
                className="primary big"
                onClick={() => {
                  resetSeen(packItems(pack, ITEMS).map((i) => i.id))
                  onNewSession(pack)
                }}
              >
                Play them all again
              </button>
              <button onClick={onMenu}>Choose another pack</button>
            </div>
            <p className="hint">Your past answers and leaderboard scores are kept.</p>
          </div>
        </main>
      </>
    )
  }

  if (index >= session.items.length) {
    const answered = new Set(session.responses.map((r) => r.itemId))
    return (
      <>
        <TopBar />
        <EndScreen
          items={session.items.filter((i) => answered.has(i.id))}
          responses={session.responses}
          tracking={consent.uncertaintyTracking}
          remaining={unseenLeft(session.pack)}
          packLabel={session.pack.id === RANDOM_PACK.id ? null : session.pack.label}
          onPlayAgain={() => onNewSession(session.pack)}
          onMenu={onMenu}
          onDeleted={onDeleted}
        />
      </>
    )
  }

  const item = current!
  return (
    <>
      <TopBar>
        <Progress index={index} total={session.items.length} />
      </TopBar>
      <main>
        {pending ? (
          <Prediction
            key={`p-${session.id}-${item.id}`}
            item={item}
            onDone={(prediction) => record({ ...pending, prediction }, item)}
          />
        ) : (
          <Card
            key={`${session.id}-${item.id}`}
            item={item}
            tracking={consent.uncertaintyTracking}
            playerId={getPlayerId()}
            sessionId={session.id}
            onDone={(r) => (defaultPrediction(item) ? setPending(r) : record(r, item))}
            onSkip={() => skip(item)}
          />
        )}
      </main>
    </>
  )
}
