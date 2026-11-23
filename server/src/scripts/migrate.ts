import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadConfig } from '../config.ts'
import { Store } from '../store.ts'

const dir = join(import.meta.dirname, '../../migrations')

export async function migrate(store: Store) {
  await store.pool.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
  )
  const { rows } = await store.pool.query('SELECT name FROM schema_migrations')
  const done = new Set(rows.map((r) => r.name))
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    if (done.has(file)) continue
    const client = await store.pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(readFileSync(join(dir, file), 'utf8'))
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`applied ${file}`)
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const store = Store.connect(loadConfig().databaseUrl)
  await migrate(store)
  await store.close()
}
