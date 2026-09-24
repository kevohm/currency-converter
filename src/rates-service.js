import { config } from './config.js'

const REQUIRED_CURRENCIES = ['KES', 'EUR', 'GBP']

function isExchangeRateResponse(value) {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    if (typeof value.rates !== 'object' || value.rates === null) {
        return false
    }

    // Only validate the currencies we actually use
    return REQUIRED_CURRENCIES.every((code) => {
        const rate = value.rates[code]
        return Number.isFinite(rate) && rate > 0
    })
}

export async function fetchRates() {
    const response = await fetch(config.ratesApiUrl, {
        signal: AbortSignal.timeout(config.fetchTimeoutMs),
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates (HTTP ${response.status})`)
    }

    const data = await response.json()

    if (!isExchangeRateResponse(data)) {
        throw new Error('Invalid exchange rate response')
    }

    const { KES, EUR, GBP } = data.rates

    // API rates are per 1 USD, so cross rates are KES / other
return {
    rates: {
        USD_KES: KES,
        EUR_KES: KES / EUR,
        GBP_KES: KES / GBP,
    },
    nextUpdateMs: Number.isFinite(data.time_next_update_unix)
        ? data.time_next_update_unix * 1000
        : null,
}
}
