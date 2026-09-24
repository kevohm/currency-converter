import { Router } from 'express'
import { config } from './config.js'
import { createRateEvent } from './events.js'
import { addClient } from './sse.js'
import { getCurrent, getHistory } from './store.js'

export const router = Router()

router.get('/rates', (_req, res) => {
    const current = getCurrent()

    if (!current) {
        res.status(503).json({ error: 'Rates not available yet' })
        return
    }

    res.json(createRateEvent(current))
})

router.get('/rates/history', (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), config.maxHistoryEntries)

    res.json(getHistory(limit))
})

router.get('/rates/stream', (req, res) => {
    const current = getCurrent()

    addClient(req, res, current ? createRateEvent(current) : null)
})
