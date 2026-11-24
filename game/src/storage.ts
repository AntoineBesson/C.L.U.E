import { deletePlayer, putConsent, sendResponse } from './api'
import type { LeaderboardEntry } from './leaderboard'
import { dayOf, EMPTY_STREAK, played, type Streak } from './streak'
import type { Consent, ResponseRecord } from './types'

/**
 * The player's browser is the primary copy. When VITE_API_URL is set, consent,
 * answers and deletion are also sent to the server (see api.ts).
 * Every access is guarded: storage can be blocked or empty (private windows).
 */
const KEYS = {
  playerId: 'clue.playerId',
  consent: 'clue.consent',
  responses: 'clue.responses',
  /** Ids of every card shown on this device, so none comes back. */
  seen: 'clue.seenItems',
  seenResetAt: 'clue.seenResetAt',
  /** Cards skipped in solo play (ids only). */
  skipped: 'clue.skipped',
  /** Cards already played in pass-and-play rooms on this device (ids only, no answers). */
  roomSeen: 'clue.roomSeen',
  /** Local guess-the-crowd leaderboard (never sent anywhere). */
  leaderboard: 'clue.leaderboard',
  /** Daily play streak. */
  streak: 'clue.streak',
  /** Last name typed for the leaderboard. */
  nickname: 'clue.nickname',
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
  void putConsent(getPlayerId(), c)
}

export function getResponses(): ResponseRecord[] {
  return read<ResponseRecord[]>(KEYS.responses) ?? []
}

export function getStreak(): Streak {
  return read<Streak>(KEYS.streak) ?? EMPTY_STREAK
}

export function saveResponse(r: ResponseRecord) {
  write(KEYS.responses, [...getResponses(), r])
  write(KEYS.streak, played(getStreak(), dayOf(new Date())))
  void sendResponse(r)
}

/** Cards already shown on this device: those marked when shown, plus every answer since that card was last reset. */
export function getSeenIds(): Set<string> {
  const resetAt = read<Record<string, string>>(KEYS.seenResetAt) ?? {}
  const answered = getResponses()
    .filter((r) => r.answeredAt > (resetAt[r.itemId] ?? ''))
    .map((r) => r.itemId)
  return new Set([...(read<string[]>(KEYS.seen) ?? []), ...answered])
}

export function markSeen(itemId: string) {
  const seen = read<string[]>(KEYS.seen) ?? []
  if (!seen.includes(itemId)) write(KEYS.seen, [...seen, itemId])
}

/** Lets these cards be played again (a finished pack). Answers are kept. */
export function resetSeen(itemIds: string[]) {
  const drop = new Set(itemIds)
  const now = new Date().toISOString()
  write(KEYS.seen, (read<string[]>(KEYS.seen) ?? []).filter((id) => !drop.has(id)))
  const resetAt = read<Record<string, string>>(KEYS.seenResetAt) ?? {}
  write(KEYS.seenResetAt, { ...resetAt, ...Object.fromEntries(itemIds.map((id) => [id, now])) })
}

export function markSkipped(itemId: string) {
  const skipped = read<string[]>(KEYS.skipped) ?? []
  if (!skipped.includes(itemId)) write(KEYS.skipped, [...skipped, itemId])
}

export function getRoomSeen(): Set<string> {
  return new Set(read<string[]>(KEYS.roomSeen) ?? [])
}

export function markRoomSeen(itemId: string) {
  const seen = read<string[]>(KEYS.roomSeen) ?? []
  if (!seen.includes(itemId)) write(KEYS.roomSeen, [...seen, itemId])
}

export function resetRoomSeen(itemIds: string[]) {
  const drop = new Set(itemIds)
  write(KEYS.roomSeen, [...getRoomSeen()].filter((id) => !drop.has(id)))
}

export function getLeaderboard(): LeaderboardEntry[] {
  return read<LeaderboardEntry[]>(KEYS.leaderboard) ?? []
}

export function saveLeaderboard(entries: LeaderboardEntry[]) {
  write(KEYS.leaderboard, entries)
}

export function getNickname(): string {
  return read<string>(KEYS.nickname) ?? ''
}

export function saveNickname(name: string) {
  write(KEYS.nickname, name)
}

export function exportData(): string {
  return JSON.stringify(
    {
      playerId: read<string>(KEYS.playerId),
      consent: getConsent(),
      responses: getResponses(),
      seenItems: read<string[]>(KEYS.seen) ?? [],
      skippedItems: read<string[]>(KEYS.skipped) ?? [],
      roomSeenItems: read<string[]>(KEYS.roomSeen) ?? [],
      leaderboard: getLeaderboard(),
      streak: getStreak(),
    },
    null,
    2,
  )
}

export function deleteAllData() {
  const id = read<string>(KEYS.playerId)
  if (id) void deletePlayer(id)
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  } catch {
    /* nothing stored */
  }
}
