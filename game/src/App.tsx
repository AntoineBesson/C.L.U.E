import { useEffect, useState } from 'react'
import { apiEnabled, fetchCrowd, fetchToday } from './api'
import { Card } from './components/Card'
import { ConsentScreen } from './components/ConsentScreen'
import { EndScreen } from './components/EndScreen'
import { Prediction } from './components/Prediction'
import { Reveal } from './components/Reveal'
import { CONFIG } from './config'
import { ITEMS, mergeServerSet, pickSession } from './items'
import { defaultPrediction } from './scoring'
import { Backdrop } from './ui/Backdrop'
import { Mascot } from './ui/Mascot'
import { Progress, TopBar } from './ui/TopBar'
import {
  getConsent,
  getPlayerId,
  getSeenIds,
  markSeen,
  randomId,
  resetSeen,
  saveConsent,
  saveResponse,
} from './storage'
import type { Consent, Item, ResponseRecord } from './types'

interface Session {
  id: string
  items: Item[]
  responses: ResponseRecord[]
  /** Waiting for today's cards from the server (only when the API is configured). */
  loading: boolean
}

/** A new set of cards the player has never seen on this device. */
function newSession(): Session {
  const items = pickSession(CONFIG.cardsPerSession, getSeenIds())
  return { id: randomId(), items, responses: [], loading: apiEnabled && items.length > 0 }
}

function unseenLeft(): number {
  const seen = getSeenIds()
  return ITEMS.filter((i) => !seen.has(i.id)).length
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
  const [session, setSession] = useState<Session>(newSession)
  /** Answer given, waiting for the crowd prediction. */
  const [pending, setPending] = useState<ResponseRecord | null>(null)
  /** Guess locked in: showing how the crowd split before the next card. */
  const [revealing, setRevealing] = useState<ResponseRecord | null>(null)

  // Today's cards come from the server when it is configured and reachable;
  // otherwise the local bank picked in newSession() is kept.
  const loadFor = consent && session.loading ? session.id : null
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

  const index = session.responses.length
  const current = session.items[index] as Item | undefined
  // Mark a card as seen as soon as it is shown, so it never comes back, even if the set is abandoned.
  const currentId = consent && !session.loading ? current?.id : undefined
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
    return (
      <>
      <TopBar />
      <main>
        <div className="panel done-bank">
          <Mascot mood="happy" size={96} />
          <h1>You&rsquo;ve seen every dilemma!</h1>
          <p className="lede">
            All {ITEMS.length} cards in the bank have been played on this device, and none will repeat. New ones are
            on the way.
          </p>
          <div className="actions">
            <button
              className="primary big"
              onClick={() => {
                resetSeen()
                setSession(newSession())
              }}
            >
              Play them all again
            </button>
          </div>
          <p className="hint">Your past answers and leaderboard scores are kept.</p>
        </div>
      </main>
      </>
    )
  }

  if (index >= session.items.length) {
    return (
      <>
      <TopBar />
      <EndScreen
        items={session.items}
        responses={session.responses}
        tracking={consent.uncertaintyTracking}
        remaining={unseenLeft()}
        onPlayAgain={() => setSession(newSession())}
        onDeleted={() => {
          setConsent(null)
          setSession(newSession())
        }}
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
      />
      )}
    </main>
    </>
  )
}
