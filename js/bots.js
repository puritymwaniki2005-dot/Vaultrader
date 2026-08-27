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
    SMART: 'smart'
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
// BOT TEMPLATES
// ============================================================

const BOT_TEMPLATES = [
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
        status: 'stopped'
    },
    {
        id: 'profits-miner',
        name: 'PROFITS MINER BOT',
        type: BOT_TYPES.PREMIUM,
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
        status: 'stopped'
    },
    {
        id: 'sv7-2025',
        name: 'Mkorean SV7 2025',
        type: BOT_TYPES.FREE,
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
        status: 'stopped'
    },
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
        status: 'stopped'
    },
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
        status: 'stopped'
    },
    {
        id: 'quantum-edge',
        name: 'Quantum Edge AI',
        type: BOT_TYPES.QUICK,
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
        status: 'stopped'
    },
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
        status: 'stopped'
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
    loadBotTemplate
}

console.log('🤖 Bots module loaded')
