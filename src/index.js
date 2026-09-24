import cors from 'cors'
import express from 'express'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'
import { startPolling } from './poller.js'
import { router } from './routes.js'
import { closeAllClients, startHeartbeat } from './sse.js'
import { loadHistory } from './store.js'

const app = express()

app.use(cors({ origin: config.corsOrigin }))
app.use('/api', router)

app.use(express.static(fileURLToPath(new URL('../public', import.meta.url))))

await loadHistory()

const pollTimer = startPolling()
const heartbeatTimer = startHeartbeat()

const server = app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`)
})

function shutdown() {
    pollTimer.stop()
    clearInterval(heartbeatTimer)
    closeAllClients()
    server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
