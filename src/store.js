import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { config } from './config.js'

let history = []

export async function loadHistory() {
    try {
        history = JSON.parse(await readFile(config.historyFile, 'utf8'))
        console.log(`Loaded ${history.length} history entries`)
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error // a missing file is fine on first run, anything else is not
        }
    }
}

export function getCurrent() {
    return history.at(-1) ?? null
}

export function getHistory(limit) {
    return history.slice(-limit)
}

function hasChanged(next) {
    const current = getCurrent()

    if (!current) {
        return true
    }

    return Object.keys(next).some((key) => next[key] !== current.rates[key])
}

async function persist() {
    // Write to a temp file then rename, so a crash never leaves a half-written file
    const tmp = `${config.historyFile}.tmp`

    await mkdir(dirname(config.historyFile), { recursive: true })
    await writeFile(tmp, JSON.stringify(history))
    await rename(tmp, config.historyFile)
}

// Returns the new entry, or null if the rates haven't changed
export async function saveRates(rates) {
    if (!hasChanged(rates)) {
        return null
    }

    const entry = { timestamp: new Date().toISOString(), rates }

    history.push(entry)

    if (history.length > config.maxHistoryEntries) {
        history = history.slice(-config.maxHistoryEntries)
    }

    try {
        await persist()
    } catch (error) {
        // Keep serving from memory even if the disk write fails
        console.error('Failed to write history file', error)
    }

    return entry
}
