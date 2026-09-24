import { config } from './config.js'

const clients = new Set()

export function addClient(req, res, initialEvent) {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // stop nginx buffering the stream
    })

    res.flushHeaders()

    clients.add(res)

    // Send the current rates straight away, if we have any yet
    if (initialEvent) {
        res.write(`data: ${JSON.stringify(initialEvent)}\n\n`)
    }

    req.on('close', () => {
        clients.delete(res)
    })
}

export function broadcast(event) {
    const message = `data: ${JSON.stringify(event)}\n\n`

    for (const client of clients) {
        client.write(message)
    }
}

// Comment lines keep proxies and load balancers from closing idle connections
export function startHeartbeat() {
    return setInterval(() => {
        for (const client of clients) {
            client.write(': ping\n\n')
        }
    }, config.heartbeatMs)
}

export function closeAllClients() {
    for (const client of clients) {
        client.end()
    }

    clients.clear()
}
