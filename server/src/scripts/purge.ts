import { loadConfig } from '../config.ts'
import { Store } from '../store.ts'

/** Run daily (cron): deletes data older than RETENTION_DAYS. */
const config = loadConfig()
const store = Store.connect(config.databaseUrl)
const n = await store.purge(config.retentionDays)
console.log(`purged ${n.responses} responses and ${n.players} players older than ${config.retentionDays} days`)
await store.close()
