import { buildApp } from './app.ts'
import { loadConfig } from './config.ts'
import { Store } from './store.ts'

const config = loadConfig()
const store = Store.connect(config.databaseUrl)
const app = buildApp(config, store, { logger: true })

app.listen({ port: config.port, host: '0.0.0.0' }).then(() => {
  app.log.info(`collection ${config.collectionEnabled ? 'ENABLED' : 'disabled'}`)
})
