export const config = {
    port: Number(process.env.PORT) || 3000,

    // open.er-api.com only refreshes about once a day, so polling faster is wasted
    pollIntervalMs: Number(process.env.POLL_INTERVAL_MS) || 30 * 60 * 1000,
    fetchTimeoutMs: 5_000,
    ratesApiUrl: process.env.RATES_API_URL || 'https://open.er-api.com/v6/latest/USD',

    heartbeatMs: 25_000,
    corsOrigin: process.env.CORS_ORIGIN || '*',

    historyFile: process.env.HISTORY_FILE || './data/history.json',
    maxHistoryEntries: 5000,
}
