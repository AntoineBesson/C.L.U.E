import type { Consent, CrowdStats, Item, ResponseRecord } from './types'

/**
 * Thin client for the server in ../server. With no VITE_API_URL set, every
 * call is a no-op and the game stays fully local. When the server answers
 * "collection_disabled", data simply stays in the browser.
 */
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')

export const apiEnabled = Boolean(BASE)

const OUTBOX = 'clue.outbox'

async function call(path: string, init?: RequestInit): Promise<Response | null> {
  if (!BASE) return null
  try {
    return await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    return null // offline: callers decide whether to retry
  }
}

export async function putConsent(playerId: string, consent: Consent): Promise<void> {
  await call(`/players/${playerId}`, { method: 'PUT', body: JSON.stringify(consent) })
}

function readOutbox(): ResponseRecord[] {
  try {
    return JSON.parse(localStorage.getItem(OUTBOX) ?? '[]') as ResponseRecord[]
  } catch {
    return []
  }
}

function writeOutbox(rs: ResponseRecord[]) {
  try {
    if (rs.length) localStorage.setItem(OUTBOX, JSON.stringify(rs))
    else localStorage.removeItem(OUTBOX)
  } catch {
    /* storage blocked */
  }
}

/** Sends a response, and any earlier ones that failed to send. Network errors keep them queued. */
export async function sendResponse(r: ResponseRecord): Promise<void> {
  if (!BASE) return
  const queue = [...readOutbox(), r]
  const left: ResponseRecord[] = []
  for (const item of queue) {
    const res = await call('/responses', { method: 'POST', body: JSON.stringify(item) })
    // Retry later when the server is unreachable or failing, or the consent call
    // has not landed yet (403). Other 4xx errors and "collection disabled" (503)
    // will not get better by retrying.
    if (!res || res.status === 403 || (res.status >= 500 && res.status !== 503)) left.push(item)
  }
  writeOutbox(left)
}

export async function deletePlayer(playerId: string): Promise<void> {
  writeOutbox([])
  await call(`/players/${playerId}`, { method: 'DELETE' })
}

/** Today's items from the server, or null to fall back to the local bank. */
export async function fetchToday(playerId: string): Promise<Item[] | null> {
  const res = await call(`/items/today?playerId=${encodeURIComponent(playerId)}`)
  if (!res?.ok) return null
  const body = (await res.json()) as { shared: Item[]; adaptive: Item[] }
  return [...body.shared, ...body.adaptive]
}

/** Crowd stats for an item, fetched after the player has answered it. */
export async function fetchCrowd(itemId: string): Promise<CrowdStats | null> {
  const res = await call(`/items/${encodeURIComponent(itemId)}/crowd`)
  if (!res?.ok) return null
  return ((await res.json()) as { crowd: CrowdStats | null }).crowd
}
