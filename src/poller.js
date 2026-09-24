import { config } from './config.js'
import { createRateEvent } from './events.js'
import { fetchRates } from './rates-service.js'
import { broadcast } from './sse.js'
import { saveRates } from './store.js'


const HOUR = 60 * 60 * 1000
const BUFFER = 60 * 1000          // wait a minute past the published refresh time
const MIN_DELAY = 5 * 60 * 1000   // never poll more often than this
const RETRY_DELAY = 10 * 60 * 1000

let timer = null
let running = false

function delayUntil(nextUpdateMs) {
    if (!nextUpdateMs) return HOUR

    const untilRefresh = nextUpdateMs - Date.now() + BUFFER
    return Math.min(HOUR, Math.max(MIN_DELAY, untilRefresh))
}

export async function updateRates() {
    if (running) return
    running = true

    let delay = RETRY_DELAY

    try {
        const { rates, nextUpdateMs } = await fetchRates()
        delay = delayUntil(nextUpdateMs)

        const entry = await saveRates(rates)
        if (entry) {
            broadcast(createRateEvent(entry))
            console.log('Rates updated', rates)
        }
    } catch (error) {
        console.error('Failed to update rates', error)
    } finally {
        running = false
        timer = setTimeout(() => void updateRates(), delay)
    }
}

export function startPolling() {
    void updateRates()
    return { stop: () => clearTimeout(timer) }
}

