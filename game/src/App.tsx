import { useState } from 'react'
import { Card } from './components/Card'
import { ConsentScreen } from './components/ConsentScreen'
import { EndScreen } from './components/EndScreen'
import { CONFIG } from './config'
import { pickSession } from './items'
import { Backdrop } from './ui/Backdrop'
import { Progress, TopBar } from './ui/TopBar'
import { getConsent, getPlayerId, randomId, saveConsent, saveResponse } from './storage'
import type { Consent, Item, ResponseRecord } from './types'

interface Session {
  id: string
  items: Item[]
  responses: ResponseRecord[]
}

function newSession(): Session {
  return { id: randomId(), items: pickSession(CONFIG.cardsPerSession), responses: [] }
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

  const index = session.responses.length
  if (index >= session.items.length) {
    return (
      <>
      <TopBar />
      <EndScreen
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
      <Card
        key={`${session.id}-${item.id}`}
        item={item}
        tracking={consent.uncertaintyTracking}
        playerId={getPlayerId()}
        sessionId={session.id}
        onDone={(r) => {
          saveResponse(r)
          setSession((s) => ({ ...s, responses: [...s.responses, r] }))
        }}
      />
    </main>
    </>
  )
}
