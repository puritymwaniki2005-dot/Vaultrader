// ============================================================
// TRADENOVAX - BOT CRUD OPERATIONS
// ============================================================

// ============================================================
// BOT TYPES
// ============================================================

const BOT_TYPES = {
    QUICK: 'quick',
    PREMIUM: 'premium',
    FREE: 'free',
    SMART: 'smart',
    AUTOMATED: 'automated'
}

const BOT_STRATEGIES = {
    EVEN_ODD: 'even_odd',
    OVER_UNDER: 'over_under',
    RISE_FALL: 'rise_fall',
    MATCHES_DIFFERS: 'matches_differs',
    PARITY_REVERSAL: 'parity_reversal',
    DIGIT_RANGE_REVERSAL: 'digit_range_reversal',
    DIRECTION_REVERSAL: 'direction_reversal'
}

// ============================================================
// BOT TEMPLATES - COMPLETE LIST
// ============================================================

const BOT_TEMPLATES = [

    // ===== 1. VERTEX DIGITS (QUICK) =====
    {
        id: 'vertex-digits',
        name: 'Vertex Digits',
        type: BOT_TYPES.QUICK,
        strategy: BOT_STRATEGIES.OVER_UNDER,
        description: 'Extreme-digit Over/Under strategy for the Volatility 100 Index with recovery and risk controls.',
        icon: '⚡',
        symbol: 'R_100',
        indicator: 'none',
        timeframe: '1m',
        amount: 0.5,
        max_trades: 20,
        stop_loss: 5,
        take_profit: 10,
        status: 'stopped',
        badge: 'QUICK BOT'
    },

    // ===== 2. PROFITS MINER BOT (QUICK) =====
    {
        id: 'profits-miner',
        name: 'PROFITS MINER BOT',
        type: BOT_TYPES.QUICK,
        strategy: BOT_STRATEGIES.RISE_FALL,
        description: '⭐ Premium automated trading bot with advanced algorithms.',
        icon: '🚀',
        symbol: 'R_75',
        indicator: 'rsi',
        timeframe: '5m',
        amount: 1,
        max_trades: 30,
        stop_loss: 10,
        take_profit: 20,
        status: 'stopped',
        badge: 'QUICK BOT'
    },

    // ===== 3. MKOREAN SV7 2025 (PREMIUM) =====
    {
        id: 'sv7-2025',
        name: 'Mkorean SV7 2025',
        type: BOT_TYPES.PREMIUM,
        strategy: BOT_STRATEGIES.EVEN_ODD,
        description: 'Automate your trades with this efficient bot strategy.',
        icon: '🤖',
        symbol: 'R_100',
        indicator: 'none',
        timeframe: '1m',
        amount: 0.5,
        max_trades: 15,
        stop_loss: 3,
        take_profit: 8,
        status: 'stopped',
        badge: '⭐ PREMIUM'
    },

    // ===== 4. QUANTUM EDGE AI (FREE + QUICK) =====
    {
        id: 'quantum-edge',
        name: 'Quantum Edge AI',
        type: BOT_TYPES.FREE,
        strategy: BOT_STRATEGIES.PARITY_REVERSAL,
        description: '🥉 Ready-made Quick Bot strategy with trade parameters, analysis, recovery, and risk controls.',
        icon: '🧠',
        symbol: 'R_100',
        indicator: 'macd',
        timeframe: '1m',
        amount: 0.5,
        max_trades: 25,
        stop_loss: 8,
        take_profit: 15,
        status: 'stopped',
        badge: '🎁 FREE',
        subBadge: 'QUICK BOT'
    },

    // ===== 5. NO LOSS BOT (FREE) =====
    {
        id: 'no-loss',
        name: 'NO LOSS BOT',
        type: BOT_TYPES.FREE,
        strategy: BOT_STRATEGIES.MATCHES_DIFFERS,
        description: 'Automate your trades with this efficient bot strategy.',
        icon: '🛡️',
        symbol: 'R_100',
        indicator: 'none',
        timeframe: '1m',
        amount: 0.5,
        max_trades: 10,
        stop_loss: 2,
        take_profit: 5,
        status: 'stopped',
        badge: '🎁 FREE'
    },

    // ===== 6. ULTIMATE SV 8 BOT 2025 (FREE) =====
    {
        id: 'ultimate-sv8',
        name: 'Ultimate SV 8 BOT 2025',
        type: BOT_TYPES.FREE,
        strategy: BOT_STRATEGIES.DIGIT_RANGE_REVERSAL,
        description: 'Automate your trades with this efficient bot strategy.',
        icon: '🎯',
        symbol: 'R_75',
        indicator: 'none',
        timeframe: '1m',
        amount: 0.5,
        max_trades: 20,
        stop_loss: 5,
        take_profit: 12,
        status: 'stopped',
        badge: '🎁 FREE'
    },

    // ===== 7. SMART RECOVERY AI (SMART) =====
    {
        id: 'smart-recovery',
        name: 'Smart Recovery AI',
        type: BOT_TYPES.SMART,
        strategy: BOT_STRATEGIES.DIRECTION_REVERSAL,
        description: 'Pattern-led entries with automatic multi-market recovery.',
        icon: '🔄',
        symbol: 'R_75',
        indicator: 'rsi',
        timeframe: '5m',
        amount: 1,
        max_trades: 40,
        stop_loss: 15,
        take_profit: 25,
        status: 'stopped',
        badge: '🧠 SMART AI'
    },

    // ===== 8. EVEN/ODD DIGITS (AUTOMATED) =====
    {
        id: 'even-odd-digits',
        name: 'Even/Odd Digits Bot',
        type: BOT_TYPES.AUTOMATED,
        strategy: BOT_STRATEGIES.EVEN_ODD,
        description: 'Trades based on last 5 digits pattern. Re-analyze every 3 trades.',
        icon: '🔢',
        symbol: 'R_100',
        indicator: 'auto',
        timeframe: '1m',
        amount: 0.5,
        max_trades: 30,
        stop_loss: 5,
        take_profit: 10,
        status: 'stopped',
        badge: '🤖 AUTO',
        config: { reAnalyze: 3, ticks: 1, stake: 0.5, martingale: 1.2 }
    },

    // ===== 9. EVEN/ODD PERCENTAGES (AUTOMATED) =====
    {
        id: 'even-odd-percent',
        name: 'Even/Odd Percent Bot',
        type: BOT_TYPES.AUTOMATED,
        strategy: BOT_STRATEGIES.EVEN_ODD,
        description: 'Trades based on Even/Odd percentage threshold (≥60%). Re-analyze every 3 trades.',
        icon: '📊',
        symbol: 'R_100',
        indicator: 'auto',
        timeframe: '1m',
        amount: 0.5,
        max_trades: 30,
        stop_loss: 5,
        take_profit: 10,
        status: 'stopped',
        badge: '🤖 AUTO',
        config: { reAnalyze: 3, ticks: 1, stake: 0.5, martingale: 1.2, threshold: 60 }
    },

    // ===== 10. OVER/UNDER DIGITS (AUTOMATED) =====
    {
        id: 'over-under-digits',
        name: 'Over/Under Digits Bot',
        type: BOT_TYPES.AUTOMATED,
        strategy: BOT_STRATEGIES.OVER_UNDER,
        description: 'Trades based on last 3 digits Over/Under pattern. Re-analyze every 3 trades.',
        icon: '⬆️⬇️',
        symbol: 'R_100',
        indicator: 'auto',
        timeframe: '1m',
        amount: 0.5,
        max_trades: 30,
        stop_loss: 5,
        take_profit: 10,
        status: 'stopped',
        badge: '🤖 AUTO',
        config: { reAnalyze: 3, ticks: 1, stake: 0.5, martingale: 1.2 }
    },

    // ===== 11. OVER/UNDER PERCENTAGES (AUTOMATED) =====
    {
        id: 'over-under-percent',
        name: 'Over/Under Percent Bot',
        type: BOT_TYPES.AUTOMATED,
        strategy: BOT_STRATEGIES.OVER_UNDER,
        description: 'Trades based on Over/Under percentage threshold (≥60%). Re-analyze every 3 trades.',
        icon: '📈',
        symbol: 'R_100',
        indicator: 'auto',
        timeframe: '1m',
        amount: 0.5,
        max_trades: 30,
        stop_loss: 5,
        take_profit: 10,
        status: 'stopped',
        badge: '🤖 AUTO',
        config: { reAnalyze: 3, ticks: 1, stake: 0.5, martingale: 1.2, threshold: 60 }
    },

    // ===== 12. RISE/FALL (AUTOMATED) =====
    {
        id: 'rise-fall-auto',
        name: 'Rise/Fall Bot',
        type: BOT_TYPES.AUTOMATED,
        strategy: BOT_STRATEGIES.RISE_FALL,
        description: 'Trades based on Rise/Fall percentage threshold (≥60%). Re-analyze every 3 trades.',
        icon: '📉📈',
        symbol: 'R_100',
        indicator: 'auto',
        timeframe: '1m',
        amount: 0.5,
        max_trades: 30,
        stop_loss: 5,
        take_profit: 10,
        status: 'stopped',
        badge: '🤖 AUTO',
        config: { reAnalyze: 3, ticks: 1, stake: 0.5, martingale: 1.2, threshold: 60 }
    },

    // ===== 13. MATCHES/DIFFERS (AUTOMATED) =====
    {
        id: 'matches-differs-auto',
        name: 'Matches/Differs Bot',
        type: BOT_TYPES.AUTOMATED,
        strategy: BOT_STRATEGIES.MATCHES_DIFFERS,
        description: 'Trades based on Matches/Differs percentage threshold (≥60%). Re-analyze every 3 trades.',
        icon: '🎯',
        symbol: 'R_100',
        indicator: 'auto',
        timeframe: '1m',
        amount: 0.5,
        max_trades: 30,
        stop_loss: 5,
        take_profit: 10,
        status: 'stopped',
        badge: '🤖 AUTO',
        config: { reAnalyze: 3, ticks: 1, stake: 0.5, martingale: 1.2, threshold: 60 }
    }

]

// ============================================================
// BOT CRUD OPERATIONS
// ============================================================

async function getBots(userId) {
    const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    if (error) throw error
    return data
}

async function createBot(userId, botData) {
    const { data, error } = await supabase
        .from('bots')
        .insert({ ...botData, user_id: userId })
        .select()
        .single()
    if (error) throw error
    return data
}

async function updateBot(botId, updates) {
    const { data, error } = await supabase
        .from('bots')
        .update(updates)
        .eq('id', botId)
        .select()
        .single()
    if (error) throw error
    return data
}

async function deleteBot(botId) {
    const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', botId)
    if (error) throw error
}

async function getBotTemplate(botId) {
    return BOT_TEMPLATES.find(b => b.id === botId)
}

async function loadBotTemplate(botId, userId) {
    const template = await getBotTemplate(botId)
    if (!template) return null
    
    const { id, ...botData } = template
    return await createBot(userId, botData)
}

// ============================================================
// GET BOTS BY TYPE
// ============================================================

function getBotsByType(type) {
    return BOT_TEMPLATES.filter(b => b.type === type)
}

function getQuickBots() {
    return getBotsByType(BOT_TYPES.QUICK)
}

function getPremiumBots() {
    return getBotsByType(BOT_TYPES.PREMIUM)
}

function getFreeBots() {
    return getBotsByType(BOT_TYPES.FREE)
}

function getSmartBots() {
    return getBotsByType(BOT_TYPES.SMART)
}

function getAutomatedBots() {
    return getBotsByType(BOT_TYPES.AUTOMATED)
}

// ============================================================
// EXPORTS
// ============================================================

window.bots = {
    BOT_TYPES,
    BOT_STRATEGIES,
    BOT_TEMPLATES,
    getBots,
    createBot,
    updateBot,
    deleteBot,
    getBotTemplate,
    loadBotTemplate,
    getBotsByType,
    getQuickBots,
    getPremiumBots,
    getFreeBots,
    getSmartBots,
    getAutomatedBots
}

console.log('🤖 Bots module loaded (' + BOT_TEMPLATES.length + ' templates)')
