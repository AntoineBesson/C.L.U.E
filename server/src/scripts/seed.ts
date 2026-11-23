import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Item } from '../../../game/src/types.ts'
import { loadConfig } from '../config.ts'
import { Store } from '../store.ts'

/** Loads items/*.json into the items table (insert or update by id). */
const file = process.argv[2] ?? join(import.meta.dirname, '../../../items/seed.json')
const items = JSON.parse(readFileSync(file, 'utf8')) as Item[]
const store = Store.connect(loadConfig().databaseUrl)
await store.upsertItems(items)
console.log(`loaded ${items.length} items from ${file}`)
await store.close()
