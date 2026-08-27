// ============================================================
// TRADENOVAX - BOT STRATEGIES
// ============================================================

// ============================================================
// STRATEGY EXECUTION ENGINE
// ============================================================

const STRATEGIES = {

    // ===== EVEN/ODD =====
    even_odd: {
        name: 'Even/Odd',
        execute: async (bot) => {
            const price = await getDerivPrice(bot.symbol)
            const lastDigit = Math.floor(price) % 10
            const isEven = lastDigit % 2 === 0
            
            // Get historical data for confidence
            const history = await getLastDigits(bot.symbol, bot.ticks || 120)
            const evenCount = history.filter(d => d % 2 === 0).length
            const evenPercent = (evenCount / history.length) * 100
            
            if (evenPercent >= 60) {
                return await placeTrade({
                    symbol: bot.symbol,
                    type: 'CALL',
                    amount: bot.amount,
                    duration: bot.duration || 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            } else if (evenPercent <= 40) {
                return await placeTrade({
                    symbol: bot.symbol,
                    type: 'PUT',
                    amount: bot.amount,
                    duration: bot.duration || 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            }
            return null
        }
    },

    // ===== OVER/UNDER =====
    over_under: {
        name: 'Over/Under',
        execute: async (bot) => {
            const price = await getDerivPrice(bot.symbol)
            const lastDigit = Math.floor(price) % 10
            
            const history = await getLastDigits(bot.symbol, bot.ticks || 120)
            const overCount = history.filter(d => d > 5).length
            const overPercent = (overCount / history.length) * 100
            
            if (overPercent >= 60) {
                return await placeTrade({
                    symbol: bot.symbol,
                    type: 'CALL',
                    amount: bot.amount,
                    duration: bot.duration || 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            } else if (overPercent <= 40) {
                return await placeTrade({
                    symbol: bot.symbol,
                    type: 'PUT',
                    amount: bot.amount,
                    duration: bot.duration || 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            }
            return null
        }
    },

    // ===== RISE/FALL =====
    rise_fall: {
        name: 'Rise/Fall',
        execute: async (bot) => {
            const prices = await getHistoricalPrices(bot.symbol, bot.ticks || 120)
            if (prices.length < 2) return null
            
            const rises = prices.filter((p, i) => i > 0 && p > prices[i-1]).length
            const risePercent = (rises / (prices.length - 1)) * 100
            
            if (risePercent >= 60) {
                return await placeTrade({
                    symbol: bot.symbol,
                    type: 'CALL',
                    amount: bot.amount,
                    duration: bot.duration || 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            } else if (risePercent <= 40) {
                return await placeTrade({
                    symbol: bot.symbol,
                    type: 'PUT',
                    amount: bot.amount,
                    duration: bot.duration || 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            }
            return null
        }
    },

    // ===== MATCHES/DIFFERS =====
    matches_differs: {
        name: 'Matches/Differs',
        execute: async (bot) => {
            const digit = bot.targetDigit || 5
            const price = await getDerivPrice(bot.symbol)
            const lastDigit = Math.floor(price) % 10
            
            const history = await getLastDigits(bot.symbol, bot.ticks || 120)
            const matches = history.filter(d => d === digit).length
            const matchPercent = (matches / history.length) * 100
            
            if (matchPercent >= 60) {
                return await placeTrade({
                    symbol: bot.symbol,
                    type: 'CALL',
                    amount: bot.amount,
                    duration: bot.duration || 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            } else if (matchPercent <= 40) {
                return await placeTrade({
                    symbol: bot.symbol,
                    type: 'PUT',
                    amount: bot.amount,
                    duration: bot.duration || 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            }
            return null
        }
    },

    // ===== PARITY REVERSAL =====
    parity_reversal: {
        name: 'Parity Reversal',
        execute: async (bot) => {
            const price = await getDerivPrice(bot.symbol)
            const lastDigit = Math.floor(price) % 10
            const isEven = lastDigit % 2 === 0
            
            // If Even, trade Odd (reversal)
            if (isEven) {
                return await placeTrade({
                    symbol: bot.symbol,
                    type: 'PUT',
                    amount: bot.amount,
                    duration: bot.duration || 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            } else {
                return await placeTrade({
                    symbol: bot.symbol,
                    type: 'CALL',
                    amount: bot.amount,
                    duration: bot.duration || 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            }
        }
    },

    // ===== DIGIT RANGE REVERSAL =====
    digit_range_reversal: {
        name: 'Digit Range Reversal',
        execute: async (bot) => {
            const price = await getDerivPrice(bot.symbol)
            const lastDigit = Math.floor(price) % 10
            
            // If digit < 4, trade Over 4 (reversal)
            if (lastDigit < 4) {
                return await placeTrade({
                    symbol: bot.symbol,
                    type: 'CALL',
                    amount: bot.amount,
                    duration: bot.duration || 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            } else if (lastDigit > 5) {
                return await placeTrade({
                    symbol: bot.symbol,
                    type: 'PUT',
                    amount: bot.amount,
                    duration: bot.duration || 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            }
            return null
        }
    },

    // ===== DIRECTION REVERSAL =====
    direction_reversal: {
        name: 'Direction Reversal',
        execute: async (bot) => {
            const prices = await getHistoricalPrices(bot.symbol, 10)
            if (prices.length < 2) return null
            
            const lastChange = prices[prices.length - 1] - prices[prices.length - 2]
            const isRising = lastChange > 0
            
            // If rising, trade Fall (reversal)
            if (isRising) {
                return await placeTrade({
                    symbol: bot.symbol,
                    type: 'PUT',
                    amount: bot.amount,
                    duration: bot.duration || 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            } else {
                return await placeTrade({
                    symbol: bot.symbol,
                    type: 'CALL',
                    amount: bot.amount,
                    duration: bot.duration || 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            }
        }
    }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function getLastDigits(symbol, count) {
    const prices = await getHistoricalPrices(symbol, count)
    return prices.map(p => Math.floor(p) % 10)
}

async function getHistoricalPrices(symbol, count) {
    try {
        const response = await fetch('https://api.deriv.com/v1/ticks_history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ticks_history: symbol,
                end: 'latest',
                start: new Date(Date.now() - 3600000).toISOString(),
                subscribe: 0,
                granularity: 60
            })
        })
        const data = await response.json()
        return data?.candles?.map(c => c.close) || []
    } catch (error) {
        return []
    }
}

async function getDerivPrice(symbol) {
    try {
        const response = await fetch('https://api.deriv.com/v1/tick', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticks: symbol, subscribe: 0 })
        })
        const data = await response.json()
        return data?.tick?.quote || 0
    } catch (error) {
        return 0
    }
}

// ============================================================
// EXPORTS
// ============================================================

window.strategies = {
    STRATEGIES,
    getLastDigits,
    getHistoricalPrices,
    getDerivPrice
}

console.log('🧠 Strategies module loaded')
