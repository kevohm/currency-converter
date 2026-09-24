// One place that defines the shape sent to clients (SSE and REST)
export function createRateEvent(entry) {
    return {
        type: 'rates.updated',
        timestamp: entry.timestamp,
        rates: entry.rates,
    }
}
