import type { Consent, ResponseRecord } from './types'

/**
 * Prototype storage: the player's own browser only. Nothing is sent anywhere.
 * Every access is guarded: storage can be blocked or empty (private windows).
 */
const KEYS = {
  playerId: 'clue.playerId',
  consent: 'clue.consent',
  responses: 'clue.responses',
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: the session still works in memory */
  }
}

export function randomId(): string {
  return crypto.randomUUID()
}

/** Random pseudonymous ID; not derived from the device or browser. */
export function getPlayerId(): string {
  const existing = read<string>(KEYS.playerId)
  if (existing) return existing
  const id = randomId()
  write(KEYS.playerId, id)
  return id
}

export function getConsent(): Consent | null {
  return read<Consent>(KEYS.consent)
}

export function saveConsent(c: Consent) {
  write(KEYS.consent, c)
}

export function getResponses(): ResponseRecord[] {
  return read<ResponseRecord[]>(KEYS.responses) ?? []
}

export function saveResponse(r: ResponseRecord) {
  write(KEYS.responses, [...getResponses(), r])
}

export function exportData(): string {
  return JSON.stringify(
    { playerId: read<string>(KEYS.playerId), consent: getConsent(), responses: getResponses() },
    null,
    2,
  )
}

export function deleteAllData() {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  } catch {
    /* nothing stored */
  }
}
