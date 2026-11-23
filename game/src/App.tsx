import { useState } from 'react'
import { Card } from './components/Card'
import { ConsentScreen } from './components/ConsentScreen'
import { EndScreen } from './components/EndScreen'
import { Prediction } from './components/Prediction'
import { CONFIG } from './config'
import { pickSession } from './items'
import { defaultPrediction } from './scoring'
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
  const [consent, setConsent] = useState<Consent | null>(validConsent)
  const [session, setSession] = useState<Session>(newSession)
  /** Answer given, waiting for the crowd prediction. */
  const [pending, setPending] = useState<ResponseRecord | null>(null)

  function record(r: ResponseRecord) {
    saveResponse(r)
    setPending(null)
    setSession((s) => ({ ...s, responses: [...s.responses, r] }))
  }

  if (!consent) {
    return (
      <ConsentScreen
        onAccept={(c) => {
          saveConsent(c)
          setConsent(c)
        }}
      />
    )
  }

  const index = session.responses.length
  if (index >= session.items.length) {
    return (
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
    )
  }

  const item = session.items[index]
  return (
    <main>
      <p className="progress">
        Card {index + 1} of {session.items.length}
      </p>
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
  )
}
