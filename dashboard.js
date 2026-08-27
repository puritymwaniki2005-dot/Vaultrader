// ============================================================
// TRADENOVAX DASHBOARD - DEMO MODE (No Supabase Auth Required)
// ============================================================

// ============================================================
// SUPABASE CONFIG
// ============================================================
const SUPABASE_URL = 'https://qbfwvtoabfewhjnmfkxb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZnd2dG9hYmZld2hqbm1ma3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MzQ4ODcsImV4cCI6MjEwMzQxMDg4N30.Y0UAdvtTOD7vc3V7ZSOa6PTEKOQRQaiEIX1A56jb2H0'

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
window.supabase = supabase

// ============================================================
// DEMO USER - Auto-creates without Supabase Auth
// ============================================================
function getDemoUser() {
    let demoUser = localStorage.getItem('tradenovax_demo_user')
    if (!demoUser) {
        demoUser = {
            id: 'demo-' + Date.now(),
            email: 'demo@tradenovax.com',
            user_metadata: { full_name: 'Demo Trader' }
        }
        localStorage.setItem('tradenovax_demo_user', JSON.stringify(demoUser))
    }
    return JSON.parse(demoUser)
}

// ============================================================
// AUTH FUNCTIONS (Demo Mode)
// ============================================================
async function getCurrentUser() {
    return getDemoUser()
}

async function logout() {
    localStorage.removeItem('tradenovax_demo_user')
    window.location.href = '/index.html'
}

// ============================================================
// BOT CRUD OPERATIONS (LIVE Supabase)
// ============================================================
async function getBots(userId) {
    const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
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

// ============================================================
// TRADE CRUD OPERATIONS (LIVE Supabase)
// ============================================================
async function getTrades(userId) {
    const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
    if (error) throw error
    return data || []
}

async function createTrade(userId, tradeData) {
    const { data, error } = await supabase
        .from('trades')
        .insert({ ...tradeData, user_id: userId })
        .select()
        .single()
    if (error) throw error
    return data
}

// ============================================================
// BOT TEMPLATES
// ============================================================
const BOT_TEMPLATES = [
    {
        id: 'vertex-digits',
        name: 'Vertex Digits',
        type: 'quick',
        strategy: 'over_under',
        description: 'Extreme-digit Over/Under strategy for the Volatility 100 Index with recovery and risk controls.',
        icon: '⚡',
        symbol: 'R_100',
        amount: 0.5,
        max_trades: 20,
        stop_loss: 5,
        take_profit: 10,
        status: 'stopped'
    },
    {
        id: 'profits-miner',
        name: 'PROFITS MINER BOT',
        type: 'premium',
        strategy: 'rise_fall',
        description: '⭐ Premium automated trading bot with advanced algorithms.',
        icon: '🚀',
        symbol: 'R_75',
        amount: 1,
        max_trades: 30,
        stop_loss: 10,
        take_profit: 20,
        status: 'stopped'
    },
    {
        id: 'sv7-2025',
        name: 'Mkorean SV7 2025',
        type: 'free',
        strategy: 'even_odd',
        description: 'Automate your trades with this efficient bot strategy.',
        icon: '🤖',
        symbol: 'R_100',
        amount: 0.5,
        max_trades: 15,
        stop_loss: 3,
        take_profit: 8,
        status: 'stopped'
    },
    {
        id: 'no-loss',
        name: 'NO LOSS BOT',
        type: 'free',
        strategy: 'matches_differs',
        description: 'Automate your trades with this efficient bot strategy.',
        icon: '🛡️',
        symbol: 'R_100',
        amount: 0.5,
        max_trades: 10,
        stop_loss: 2,
        take_profit: 5,
        status: 'stopped'
    },
    {
        id: 'ultimate-sv8',
        name: 'Ultimate SV 8 BOT 2025',
        type: 'free',
        strategy: 'digit_range_reversal',
        description: 'Automate your trades with this efficient bot strategy.',
        icon: '🎯',
        symbol: 'R_75',
        amount: 0.5,
        max_trades: 20,
        stop_loss: 5,
        take_profit: 12,
        status: 'stopped'
    },
    {
        id: 'quantum-edge',
        name: 'Quantum Edge AI',
        type: 'quick',
        strategy: 'parity_reversal',
        description: '🥉 Ready-made Quick Bot strategy with trade parameters, analysis, recovery, and risk controls.',
        icon: '🧠',
        symbol: 'R_100',
        amount: 0.5,
        max_trades: 25,
        stop_loss: 8,
        take_profit: 15,
        status: 'stopped'
    },
    {
        id: 'smart-recovery',
        name: 'Smart Recovery AI',
        type: 'smart',
        strategy: 'direction_reversal',
        description: 'Pattern-led entries with automatic multi-market recovery.',
        icon: '🔄',
        symbol: 'R_75',
        amount: 1,
        max_trades: 40,
        stop_loss: 15,
        take_profit: 25,
        status: 'stopped'
    }
]

// ============================================================
// BOT STRATEGIES (Demo Trading)
// ============================================================
const BOT_STRATEGIES = {
    even_odd: {
        name: 'Even/Odd',
        execute: async (bot) => {
            const isWin = Math.random() > 0.45
            const profit = isWin ? bot.amount * (0.5 + Math.random() * 0.8) : -bot.amount * (0.3 + Math.random() * 0.7)
            return await executeDemoTrade(bot, isWin, profit)
        }
    },
    over_under: {
        name: 'Over/Under',
        execute: async (bot) => {
            const isWin = Math.random() > 0.45
            const profit = isWin ? bot.amount * (0.5 + Math.random() * 0.8) : -bot.amount * (0.3 + Math.random() * 0.7)
            return await executeDemoTrade(bot, isWin, profit)
        }
    },
    rise_fall: {
        name: 'Rise/Fall',
        execute: async (bot) => {
            const isWin = Math.random() > 0.45
            const profit = isWin ? bot.amount * (0.5 + Math.random() * 0.8) : -bot.amount * (0.3 + Math.random() * 0.7)
            return await executeDemoTrade(bot, isWin, profit)
        }
    },
    matches_differs: {
        name: 'Matches/Differs',
        execute: async (bot) => {
            const isWin = Math.random() > 0.45
            const profit = isWin ? bot.amount * (0.5 + Math.random() * 0.8) : -bot.amount * (0.3 + Math.random() * 0.7)
            return await executeDemoTrade(bot, isWin, profit)
        }
    },
    parity_reversal: {
        name: 'Parity Reversal',
        execute: async (bot) => {
            const isWin = Math.random() > 0.45
            const profit = isWin ? bot.amount * (0.5 + Math.random() * 0.8) : -bot.amount * (0.3 + Math.random() * 0.7)
            return await executeDemoTrade(bot, isWin, profit)
        }
    },
    digit_range_reversal: {
        name: 'Digit Range Reversal',
        execute: async (bot) => {
            const isWin = Math.random() > 0.45
            const profit = isWin ? bot.amount * (0.5 + Math.random() * 0.8) : -bot.amount * (0.3 + Math.random() * 0.7)
            return await executeDemoTrade(bot, isWin, profit)
        }
    },
    direction_reversal: {
        name: 'Direction Reversal',
        execute: async (bot) => {
            const isWin = Math.random() > 0.45
            const profit = isWin ? bot.amount * (0.5 + Math.random() * 0.8) : -bot.amount * (0.3 + Math.random() * 0.7)
            return await executeDemoTrade(bot, isWin, profit)
        }
    }
}

// ============================================================
// EXECUTE DEMO TRADE
// ============================================================
async function executeDemoTrade(bot, isWin, profitLoss) {
    try {
        const user = getCurrentUser()
        
        const tradeRecord = {
            user_id: user.id,
            bot_id: bot.id || null,
            symbol: bot.symbol || 'R_75',
            type: isWin ? 'CALL' : 'PUT',
            amount: bot.amount || 1,
            price: 100 + Math.random() * 50,
            profit_loss: parseFloat(profitLoss.toFixed(2)),
            status: isWin ? 'won' : 'lost',
            is_demo: true
        }
        
        await supabase.from('trades').insert(tradeRecord)
        
        showToast(`🎮 Demo Trade: ${isWin ? '✅ WIN' : '❌ LOSS'} $${Math.abs(profitLoss.toFixed(2))}`)
        return { success: true, isWin, profitLoss }
        
    } catch (error) {
        console.error('Demo trade error:', error)
        return null
    }
}

// ============================================================
// PLACE TRADE (Demo Mode)
// ============================================================
async function placeTrade(tradeParams) {
    const user = getCurrentUser()
    const isWin = Math.random() > 0.45
    const profitLoss = isWin 
        ? tradeParams.amount * (0.5 + Math.random() * 0.8) 
        : -tradeParams.amount * (0.3 + Math.random() * 0.7)
    
    const tradeRecord = {
        user_id: user.id,
        bot_id: tradeParams.bot_id || null,
        symbol: tradeParams.symbol || 'R_75',
        type: tradeParams.type || 'CALL',
        amount: tradeParams.amount || 1,
        price: 100 + Math.random() * 50,
        profit_loss: parseFloat(profitLoss.toFixed(2)),
        status: isWin ? 'won' : 'lost',
        is_demo: true
    }
    
    await supabase.from('trades').insert(tradeRecord)
    showToast(`🎮 ${isWin ? '✅ WIN' : '❌ LOSS'} $${Math.abs(profitLoss.toFixed(2))}`)
    return { success: true, isWin, profitLoss }
}

// ============================================================
// BOT ENGINE - RUN ALL ACTIVE BOTS
// ============================================================
let botEngineRunning = false

async function startBotEngine() {
    if (botEngineRunning) return
    botEngineRunning = true
    
    const user = getCurrentUser()
    const bots = await getBots(user.id)
    const activeBots = bots.filter(b => b.status === 'running')

    for (const bot of activeBots) {
        try {
            const strategy = BOT_STRATEGIES[bot.strategy]
            if (strategy) {
                await strategy.execute(bot)
            }
        } catch (error) {
            console.error(`Bot ${bot.name} error:`, error)
        }
    }

    botEngineRunning = false
}

async function runBotEngine() {
    await startBotEngine()
    setTimeout(runBotEngine, 30000) // Run every 30 seconds
}

function toggleBotExecution() {
    const runBtn = document.getElementById('runBotBtn')
    const isRunning = runBtn.classList.contains('running')
    
    if (isRunning) {
        stopBotEngine()
    } else {
        startBotEngine()
        runBtn.classList.add('running')
        runBtn.querySelector('.run-text').textContent = 'Stop'
        runBtn.querySelector('.run-icon').textContent = '⏹'
        document.getElementById('botStatusText').textContent = 'Running'
        document.getElementById('botStatusDot').className = 'status-dot running'
        showToast('🤖 Bot engine started')
    }
}

function stopBotEngine() {
    const runBtn = document.getElementById('runBotBtn')
    runBtn.classList.remove('running')
    runBtn.querySelector('.run-text').textContent = 'Run'
    runBtn.querySelector('.run-icon').textContent = '▶'
    document.getElementById('botStatusText').textContent = 'Stopped'
    document.getElementById('botStatusDot').className = 'status-dot stopped'
    botEngineRunning = false
    showToast('⏹ Bot engine stopped')
}

// ============================================================
// UI RENDER FUNCTIONS
// ============================================================
function renderBots(bots) {
    const container = document.getElementById('botGrid')
    if (!container) return

    if (!bots || bots.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted);">
                <span style="font-size: 4rem; display: block; margin-bottom: 1rem;">🤖</span>
                <p style="font-size: 1.6rem;">No bots yet</p>
                <p style="font-size: 1.3rem;">Create your first bot in the Bot Builder</p>
                <button class="btn-load" onclick="switchPage('builder')" style="margin-top: 1.5rem; width: auto; padding: 0.8rem 2.5rem;">
                    + Create Bot
                </button>
            </div>
        `
        return
    }

    let html = ''
    bots.forEach(bot => {
        const statusMap = {
            running: '🟢 Running',
            paused: '🟡 Paused',
            stopped: '🔴 Stopped'
        }
        const statusClass = bot.status || 'stopped'
        const typeMap = {
            quick: 'QUICK BOT',
            premium: 'PREMIUM',
            free: 'FREE',
            smart: 'SMART AI'
        }
        const botType = typeMap[bot.type] || 'FREE'

        html += `
            <div class="bot-card">
                <div class="bot-badge ${bot.type || 'free'}">${botType}</div>
                <div class="bot-icon">${bot.icon || '🤖'}</div>
                <div class="bot-name">${bot.name || 'My Bot'}</div>
                <div class="bot-desc">${bot.description || 'Automate your trades with this efficient bot strategy.'}</div>
                <div class="bot-status">
                    <span class="status-badge ${statusClass}">${statusMap[statusClass]}</span>
                    <button class="btn-bot" onclick="toggleBot('${bot.id}', '${statusClass}')">
                        ${statusClass === 'running' ? '⏸ Pause' : statusClass === 'paused' ? '▶️ Resume' : '▶️ Start'}
                    </button>
                </div>
                <button class="btn-load" onclick="loadBot('${bot.id}')">Load Bot</button>
            </div>
        `
    })
    container.innerHTML = html
}

function renderTrades(trades) {
    const container = document.getElementById('tradeList')
    if (!container) return

    if (!trades || trades.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <p style="font-size: 1.4rem;">No trades yet</p>
                <p style="font-size: 1.2rem;">When you're ready to trade, hit Run.</p>
            </div>
        `
        return
    }

    let html = ''
    trades.slice(0, 10).forEach(trade => {
        const isWin = trade.profit_loss && trade.profit_loss > 0
        html += `
            <div class="trade-item">
                <div>
                    <div class="trade-symbol">${trade.symbol || 'V75'}</div>
                    <div class="trade-time">${new Date(trade.created_at).toLocaleString()}</div>
                </div>
                <div class="trade-amount ${isWin ? 'win' : 'loss'}">
                    ${isWin ? '+' : ''}${trade.profit_loss || trade.amount || '0.00'}
                </div>
            </div>
        `
    })
    container.innerHTML = html
}

// ============================================================
// BOT ACTIONS
// ============================================================
async function toggleBot(botId, currentStatus) {
    try {
        const user = getCurrentUser()
        const newStatus = currentStatus === 'running' ? 'paused' :
                         currentStatus === 'paused' ? 'running' : 'running'

        await updateBot(botId, { status: newStatus })
        const bots = await getBots(user.id)
        renderBots(bots)
        showToast(`✅ Bot ${newStatus === 'running' ? 'started' : 'paused'}`)
    } catch (error) {
        showToast('❌ Error: ' + error.message)
    }
}

async function loadBot(botId) {
    try {
        showToast('📥 Loading bot...')
        const bot = BOT_TEMPLATES.find(b => b.id === botId)
        if (bot) {
            document.getElementById('strategySelect').value = bot.strategy || 'volatility75'
            document.getElementById('indicatorSelect').value = bot.indicator || 'rsi'
            document.getElementById('tradeAmount').value = bot.amount || 10
            document.getElementById('maxTrades').value = bot.max_trades || 20
            document.getElementById('stopLoss').value = bot.stop_loss || 5
            document.getElementById('takeProfit').value = bot.take_profit || 10
            document.getElementById('botName').value = bot.name || 'My Bot'
            showToast(`✅ "${bot.name}" loaded!`)
        }
    } catch (error) {
        showToast('❌ Error loading bot: ' + error.message)
    }
}

// ============================================================
// DEPLOY BOT
// ============================================================
async function deployBot() {
    try {
        const user = getCurrentUser()
        const name = document.getElementById('botName').value || 'My NovaBot'
        const strategy = document.getElementById('strategySelect').value
        const indicator = document.getElementById('indicatorSelect').value
        const amount = parseFloat(document.getElementById('tradeAmount').value) || 10
        const maxTrades = parseInt(document.getElementById('maxTrades').value) || 20
        const stopLoss = parseFloat(document.getElementById('stopLoss').value) || 5
        const takeProfit = parseFloat(document.getElementById('takeProfit').value) || 10

        const status = document.getElementById('deployStatus')
        status.textContent = '⏳ Deploying...'
        status.style.color = 'var(--gold)'

        const botData = {
            name: name,
            strategy: strategy,
            indicator: indicator,
            amount: amount,
            max_trades: maxTrades,
            stop_loss: stopLoss,
            take_profit: takeProfit,
            status: 'running',
            type: 'free',
            icon: '🚀',
            description: `${strategy} with ${indicator}`
        }

        await createBot(user.id, botData)
        status.textContent = `✅ "${name}" deployed successfully!`
        status.style.color = 'var(--green)'
        showToast(`✅ Bot "${name}" deployed!`)

        const bots = await getBots(user.id)
        renderBots(bots)

    } catch (error) {
        showToast('❌ Error: ' + error.message)
        document.getElementById('deployStatus').textContent = '❌ Error: ' + error.message
        document.getElementById('deployStatus').style.color = 'var(--red)'
    }
}

// ============================================================
// PAGE SWITCHING
// ============================================================
function switchPage(pageId) {
    document.querySelectorAll('.sidebar-nav a').forEach(el => el.classList.remove('active'))
    const link = document.querySelector(`.sidebar-nav a[data-page="${pageId}"]`)
    if (link) link.classList.add('active')

    document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'))
    const page = document.getElementById(`page-${pageId}`)
    if (page) page.classList.add('active')

    const titles = {
        dashboard: 'Dashboard',
        builder: 'Bot Builder',
        manual: 'Manual Trader',
        bulk: 'Bulk Trader',
        premium: 'Premium AI Bots',
        smart: 'Smart AI',
        free: 'Free Bots',
        quick: 'Quick Bot',
        signal: 'Signal AI',
        copy: 'Copy Trader',
        analysis: 'Analysis Tools',
        speedbot: 'Speedbot',
        automated: 'Automated',
        chart: 'Chart',
        'bots-store': 'Bots Store',
        reports: 'Reports'
    }
    document.getElementById('pageTitle').textContent = titles[pageId] || 'Dashboard'
    document.getElementById('pageSub').textContent = pageId === 'dashboard' ? 'Overview' : ''
    closeSidebar()
}

// ============================================================
// SIDEBAR TOGGLE
// ============================================================
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open')
    document.getElementById('sidebarOverlay').classList.toggle('show')
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open')
    document.getElementById('sidebarOverlay').classList.remove('show')
}

// ============================================================
// TOAST
// ============================================================
function showToast(message) {
    const toast = document.getElementById('toast')
    const msg = document.getElementById('toastMessage')
    msg.textContent = message
    toast.classList.add('show')
    clearTimeout(toast._timer)
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3000)
}

// ============================================================
// INIT - Dashboard Loads Immediately
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = getCurrentUser()
        
        // Update UI
        document.getElementById('userName').textContent = 'Demo Trader'
        document.getElementById('userEmail').textContent = 'demo@tradenovax.com'
        document.getElementById('userAvatar').textContent = 'DT'
        document.getElementById('derivStatus').textContent = '🎮 Demo Mode'
        document.getElementById('derivStatus').style.color = 'var(--gold)'

        // Load data from Supabase
        const bots = await getBots(user.id)
        renderBots(bots)

        const trades = await getTrades(user.id)
        renderTrades(trades)

        // Update summary
        updateSummary(trades, bots)

        // Start bot engine
        setTimeout(runBotEngine, 5000)

        showToast('🚀 Dashboard ready! (Demo Mode)')
        
    } catch (error) {
        console.error('Init error:', error)
        showToast('⚠️ Error loading dashboard')
    }
})

// ============================================================
// UPDATE SUMMARY
// ============================================================
function updateSummary(trades, bots) {
    if (!trades || trades.length === 0) {
        document.getElementById('totalTrades').textContent = '0'
        document.getElementById('winRate').textContent = '0%'
        document.getElementById('totalPnL').textContent = '$0.00'
        return
    }

    const wins = trades.filter(t => t.status === 'won' || t.profit_loss > 0).length
    const total = trades.length
    const winRate = total > 0 ? (wins / total * 100) : 0
    const totalPnL = trades.reduce((sum, t) => sum + (t.profit_loss || 0), 0)

    document.getElementById('totalTrades').textContent = total
    document.getElementById('winRate').textContent = winRate.toFixed(1) + '%'
    document.getElementById('totalPnL').textContent = '$' + totalPnL.toFixed(2)
    
    if (bots) {
        const active = bots.filter(b => b.status === 'running').length
        document.getElementById('activeBotsCount').textContent = active
    }
}

// ============================================================
// EVENT LISTENERS
// ============================================================
document.getElementById('menuToggle').addEventListener('click', toggleSidebar)
document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar)

document.querySelectorAll('.sidebar-nav a[data-page]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault()
        switchPage(this.dataset.page)
    })
})

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar()
})

// Expose functions globally
window.switchPage = switchPage
window.toggleBot = toggleBot
window.loadBot = loadBot
window.deployBot = deployBot
window.toggleSidebar = toggleSidebar
window.closeSidebar = closeSidebar
window.trading = { toggleBotExecution, placeTrade }

console.log('%c🚀 TradeNovaX Dashboard Loaded (Demo Mode)', 'font-size:20px; color:#D4AF37; font-weight:bold;')
console.log('%c🤖 Bot Engine Ready', 'font-size:14px; color:#8899BB;')
console.log('%c📊 Data saved to Supabase', 'font-size:14px; color:#8899BB;')
