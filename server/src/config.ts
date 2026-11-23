export interface Config {
  port: number
  databaseUrl: string
  /** Origin of the game, for CORS. */
  allowedOrigin: string
  /**
   * Master switch for storing player data. Off by default: no human data
   * should be collected before the DPIA and the ethics review are done.
   */
  collectionEnabled: boolean
  /** Crowd stats are published only once this many players answered an item. */
  minCrowd: number
  /** Responses older than this are deleted by `npm run purge`. */
  retentionDays: number
  sharedPerDay: number
  adaptivePerDay: number
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 8787),
    databaseUrl: env.DATABASE_URL ?? 'postgres://localhost:5432/clue',
    allowedOrigin: env.ALLOWED_ORIGIN ?? 'http://localhost:5173',
    collectionEnabled: env.COLLECTION_ENABLED === 'true',
    minCrowd: Number(env.MIN_CROWD ?? 20),
    retentionDays: Number(env.RETENTION_DAYS ?? 365),
    sharedPerDay: Number(env.SHARED_PER_DAY ?? 3),
    adaptivePerDay: Number(env.ADAPTIVE_PER_DAY ?? 2),
  }
}
