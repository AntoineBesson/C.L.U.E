import { useEffect, useState } from 'react'
import { apiEnabled, fetchCrowd, fetchToday } from './api'
import { Card } from './components/Card'
import { ConsentScreen } from './components/ConsentScreen'
import { EndScreen } from './components/EndScreen'
import { Prediction } from './components/Prediction'
import { CONFIG } from './config'
import { pickSession } from './items'
import { defaultPrediction } from './scoring'
import { Backdrop } from './ui/Backdrop'
import { Mascot } from './ui/Mascot'
import { Progress, TopBar } from './ui/TopBar'
import { getConsent, getPlayerId, randomId, saveConsent, saveResponse } from './storage'
import type { Consent, Item, ResponseRecord } from './types'

interface Session {
  id: string
  items: Item[]
  responses: ResponseRecord[]
  /** Waiting for today's cards from the server (only when the API is configured). */
  loading: boolean
}

function newSession(): Session {
  return { id: randomId(), items: pickSession(CONFIG.cardsPerSession), responses: [], loading: apiEnabled }
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

  // Today's cards come from the server when it is configured and reachable;
  // otherwise the local bank picked in newSession() is kept.
  const loadFor = consent && session.loading ? session.id : null
  useEffect(() => {
    if (!loadFor) return
    let live = true
    void fetchToday(getPlayerId()).then((items) => {
      if (!live) return
      setSession((s) =>
        s.id === loadFor ? { ...s, loading: false, items: items && items.length ? items : s.items } : s,
      )
    })
    return () => {
      live = false
    }
  }, [loadFor])

  function record(r: ResponseRecord) {
    saveResponse(r)
    setPending(null)
    setSession((s) => ({ ...s, responses: [...s.responses, r] }))
    // Crowd numbers are fetched only once the player has answered and guessed.
    if (apiEnabled) {
      void fetchCrowd(r.itemId).then((crowd) => {
        if (!crowd) return
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

  const index = session.responses.length
  if (index >= session.items.length) {
    return (
      <>
      <TopBar />
      <EndScreen
        items={session.items}
        responses={session.responses}
        tracking={consent.uncertaintyTracking}
        onPlayAgain={() => setSession(newSession())}
        onDeleted={() => {
          setConsent(null)
          setSession(newSession())
        }}
      />
      </>
    )
  }

  const item = session.items[index]
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
          onDone={(prediction) => record({ ...pending, prediction })}
        />
      ) : (
      <Card
        key={`${session.id}-${item.id}`}
        item={item}
        tracking={consent.uncertaintyTracking}
        playerId={getPlayerId()}
        sessionId={session.id}
        onDone={(r) => (defaultPrediction(item) ? setPending(r) : record(r))}
      />
      )}
    </main>
    </>
  )
}
