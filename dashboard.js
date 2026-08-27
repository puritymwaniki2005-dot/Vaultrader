// ============================================================
// TRADENOVAX DASHBOARD - COMPLETE BOT ENGINE
// ============================================================

// ============================================================
// SUPABASE CONFIG
// ============================================================
const SUPABASE_URL = 'https://qbfwvtoabfewhjnmfkxb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZnd2dG9hYmZld2hqbm1ma3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MzQ4ODcsImV4cCI6MjEwMzQxMDg4N30.Y0UAdvtTOD7vc3V7ZSOa6PTEKOQRQaiEIX1A56jb2H0'

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
window.supabase = supabase

// ============================================================
// STATE
// ============================================================
let currentUser = null
let allBots = []
let derivWs = null
let currentPrices = {}

// ============================================================
// AUTH FUNCTIONS
// ============================================================
async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    currentUser = user
    return user
}

async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    window.location.href = '/index.html'
}

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
    allBots = data
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

// ============================================================
// TRADE CRUD OPERATIONS
// ============================================================
async function getTrades(userId) {
    const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
    if (error) throw error
    return data
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
// DERIV CONNECTION
// ============================================================
async function getDerivConnection(userId) {
    const { data, error } = await supabase
        .from('deriv_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()
    if (error && error.code !== 'PGRST116') throw error
    return data
}

// ============================================================
// DERIV PRICE FEED - REAL TIME
// ============================================================
async function connectDerivWebSocket() {
    try {
        const user = await getCurrentUser()
        if (!user) return

        const deriv = await getDerivConnection(user.id)
        if (!deriv) {
            document.getElementById('derivStatus').textContent = '🔗 Not connected'
            document.getElementById('derivStatus').style.color = 'var(--text-muted)'
            return
        }

        document.getElementById('derivStatus').textContent = '🟢 Connected'
        document.getElementById('derivStatus').style.color = 'var(--green)'

        // WebSocket connection to Deriv
        derivWs = new WebSocket('wss://ws.deriv.com/websockets/v3')

        derivWs.onopen = () => {
            derivWs.send(JSON.stringify({
                authorize: deriv.deriv_access_token
            }))
            derivWs.send(JSON.stringify({
                subscribe: 1,
                ticks: ['R_75', 'BOOM_500', 'CRASH_500', 'STEP_INDEX']
            }))
            showToast('🔗 Connected to Deriv price feed')
        }

        derivWs.onmessage = (event) => {
            const response = JSON.parse(event.data)
            if (response.msg_type === 'tick') {
                currentPrices[response.ticks.symbol] = response.ticks.quote
                updatePriceDisplay(response.ticks.symbol, response.ticks.quote)
            }
        }

        derivWs.onerror = (error) => {
            console.error('WebSocket error:', error)
            document.getElementById('derivStatus').textContent = '⚠️ Connection error'
            document.getElementById('derivStatus').style.color = 'var(--red)'
        }

    } catch (error) {
        console.error('Deriv connection error:', error)
    }
}

function updatePriceDisplay(symbol, price) {
    // Update any price displays on the page
    const priceElements = document.querySelectorAll(`[data-symbol="${symbol}"]`)
    priceElements.forEach(el => {
        el.textContent = price.toFixed(2)
    })
}

// ============================================================
// BOT STRATEGIES - REAL TRADING LOGIC
// ============================================================
const BOT_STRATEGIES = {
    volatility75: {
        name: 'Volatility 75',
        symbol: 'R_75',
        execute: async (bot) => {
            const price = await getDerivPrice('R_75')
            const trend = await detectTrend('R_75')
            
            if (trend === 'bullish') {
                return await placeTrade({
                    symbol: 'R_75',
                    type: 'CALL',
                    amount: bot.amount,
                    duration: 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            } else if (trend === 'bearish') {
                return await placeTrade({
                    symbol: 'R_75',
                    type: 'PUT',
                    amount: bot.amount,
                    duration: 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            }
            return null
        }
    },
    volatility100: {
        name: 'Volatility 100',
        symbol: 'R_100',
        execute: async (bot) => {
            const price = await getDerivPrice('R_100')
            const momentum = await detectMomentum('R_100')
            
            if (momentum === 'up') {
                return await placeTrade({
                    symbol: 'R_100',
                    type: 'CALL',
                    amount: bot.amount,
                    duration: 90,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            } else if (momentum === 'down') {
                return await placeTrade({
                    symbol: 'R_100',
                    type: 'PUT',
                    amount: bot.amount,
                    duration: 90,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            }
            return null
        }
    },
    boom500: {
        name: 'Boom 500',
        symbol: 'BOOM_500',
        execute: async (bot) => {
            const price = await getDerivPrice('BOOM_500')
            const momentum = await detectMomentum('BOOM_500')
            
            if (momentum === 'up') {
                return await placeTrade({
                    symbol: 'BOOM_500',
                    type: 'CALL',
                    amount: bot.amount,
                    duration: 120,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            } else if (momentum === 'down') {
                return await placeTrade({
                    symbol: 'BOOM_500',
                    type: 'PUT',
                    amount: bot.amount,
                    duration: 120,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            }
            return null
        }
    },
    crash500: {
        name: 'Crash 500',
        symbol: 'CRASH_500',
        execute: async (bot) => {
            const support = await findSupport('CRASH_500')
            const price = await getDerivPrice('CRASH_500')
            
            if (price < support * 1.01) {
                return await placeTrade({
                    symbol: 'CRASH_500',
                    type: 'CALL',
                    amount: bot.amount,
                    duration: 90,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            }
            return null
        }
    },
    stepindex: {
        name: 'Step Index',
        symbol: 'STEP_INDEX',
        execute: async (bot) => {
            const rsi = await calculateRSI('STEP_INDEX')
            const price = await getDerivPrice('STEP_INDEX')
            
            if (rsi < 30) {
                return await placeTrade({
                    symbol: 'STEP_INDEX',
                    type: 'CALL',
                    amount: bot.amount,
                    duration: 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            } else if (rsi > 70) {
                return await placeTrade({
                    symbol: 'STEP_INDEX',
                    type: 'PUT',
                    amount: bot.amount,
                    duration: 60,
                    stopLoss: bot.stop_loss,
                    takeProfit: bot.take_profit,
                    bot_id: bot.id
                })
            }
            return null
        }
    }
}

// ============================================================
// TRADING INDICATORS
// ============================================================
async function getDerivPrice(symbol) {
    if (currentPrices[symbol]) {
        return currentPrices[symbol]
    }
    
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

function calculateSMA(prices, period) {
    if (prices.length < period) return prices.reduce((a, b) => a + b, 0) / prices.length
    const slice = prices.slice(-period)
    return slice.reduce((a, b) => a + b, 0) / period
}

async function detectTrend(symbol) {
    const prices = await getHistoricalPrices(symbol, 20)
    if (prices.length < 10) return 'neutral'
    
    const sma5 = calculateSMA(prices, 5)
    const sma10 = calculateSMA(prices, 10)
    
    if (sma5 > sma10 * 1.005) return 'bullish'
    if (sma5 < sma10 * 0.995) return 'bearish'
    return 'neutral'
}

async function detectMomentum(symbol) {
    const prices = await getHistoricalPrices(symbol, 10)
    if (prices.length < 2) return 'neutral'
    
    const change = (prices[prices.length - 1] - prices[0]) / prices[0]
    if (change > 0.005) return 'up'
    if (change < -0.005) return 'down'
    return 'neutral'
}

async function calculateRSI(symbol) {
    const prices = await getHistoricalPrices(symbol, 14)
    if (prices.length < 14) return 50
    
    let gains = 0, losses = 0
    for (let i = 1; i < prices.length; i++) {
        const diff = prices[i] - prices[i-1]
        if (diff > 0) gains += diff
        else losses += Math.abs(diff)
    }
    
    const avgGain = gains / 14
    const avgLoss = losses / 14
    
    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
}

async function findSupport(symbol) {
    const prices = await getHistoricalPrices(symbol, 50)
    return Math.min(...prices)
}

// ============================================================
// EXECUTE TRADE - REAL DERIV TRADING
// ============================================================
async function placeTrade(tradeParams) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            showToast('⚠️ Please log in first')
            return null
        }

        const deriv = await getDerivConnection(user.id)
        if (!deriv) {
            showToast('⚠️ Please connect your Deriv account')
            return null
        }

        // Get proposal from Deriv
        const proposalResponse = await fetch('https://api.deriv.com/v1/proposal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: deriv.deriv_access_token,
                proposal: 1,
                amount: tradeParams.amount,
                contract_type: tradeParams.type === 'CALL' ? 'CALL' : 'PUT',
                duration: tradeParams.duration,
                duration_unit: 's',
                symbol: tradeParams.symbol,
                basis: 'stake',
                currency: 'USD'
            })
        })
        
        const proposalData = await proposalResponse.json()
        
        if (proposalData.error) {
            showToast('❌ Trade failed: ' + proposalData.error.message)
            return null
        }

        // Buy contract
        const buyResponse = await fetch('https://api.deriv.com/v1/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: deriv.deriv_access_token,
                buy: proposalData.proposal.id,
                price: proposalData.proposal.ask_price
            })
        })
        
        const buyData = await buyResponse.json()
        
        if (buyData.error) {
            showToast('❌ Buy failed: ' + buyData.error.message)
            return null
        }

        // Save trade to Supabase
        const tradeRecord = {
            user_id: user.id,
            bot_id: tradeParams.bot_id || null,
            symbol: tradeParams.symbol,
            type: tradeParams.type,
            amount: tradeParams.amount,
            price: proposalData.proposal.spot,
            status: 'pending',
            contract_id: buyData.buy.contract_id
        }

        await createTrade(user.id, tradeRecord)
        showToast(`✅ Trade placed: ${tradeParams.type} on ${tradeParams.symbol}`)
        return buyData

    } catch (error) {
        console.error('Trade error:', error)
        showToast('❌ Trade error: ' + error.message)
        return null
    }
}

// ============================================================
// RUN BOT ENGINE
// ============================================================
async function runBotEngine() {
    const user = await getCurrentUser()
    if (!user) return

    const bots = await getBots(user.id)
    const runningBots = bots.filter(b => b.status === 'running')

    for (const bot of runningBots) {
        try {
            const strategy = BOT_STRATEGIES[bot.strategy]
            if (strategy) {
                await strategy.execute(bot)
            }
        } catch (error) {
            console.error(`Bot ${bot.name} error:`, error)
        }
    }

    // Run every 60 seconds
    setTimeout(runBotEngine, 60000)
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
            free: 'FREE'
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
        const user = await getCurrentUser()
        if (!user) return

        const newStatus = currentStatus === 'running' ? 'paused' :
                         currentStatus === 'paused' ? 'running' : 'running'

        await updateBot(botId, { status: newStatus })
        
        // Refresh data
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
        // Find the bot
        const bot = allBots.find(b => b.id === botId)
        if (bot) {
            // Load bot config into builder
            document.getElementById('strategySelect').value = bot.strategy || 'volatility75'
            document.getElementById('indicatorSelect').value = bot.indicator || 'rsi'
            document.getElementById('tradeAmount').value = bot.amount || 10
            document.getElementById('maxTrades').value = bot.max_trades || 20
            document.getElementById('stopLoss').value = bot.stop_loss || 5
            document.getElementById('takeProfit').value = bot.take_profit || 10
            document.getElementById('botName').value = bot.name || 'My Bot'
            
            showToast(`✅ Bot "${bot.name}" loaded!`)
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
        const user = await getCurrentUser()
        if (!user) {
            showToast('⚠️ Please log in first')
            return
        }

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

        // Refresh bot list
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
    // Update sidebar
    document.querySelectorAll('.sidebar-nav a').forEach(el => el.classList.remove('active'))
    const link = document.querySelector(`.sidebar-nav a[data-page="${pageId}"]`)
    if (link) link.classList.add('active')

    // Update content
    document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'))
    const page = document.getElementById(`page-${pageId}`)
    if (page) page.classList.add('active')

    // Update header
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
// SIDEBAR TOGGLE (mobile)
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
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await getCurrentUser()
        if (user) {
            // Update user info
            document.getElementById('userName').textContent = user.email?.split('@')[0] || 'Trader'
            document.getElementById('userEmail').textContent = user.email || ''
            document.getElementById('userAvatar').textContent = user.email?.[0]?.toUpperCase() || 'T'

            // Load data
            const bots = await getBots(user.id)
            renderBots(bots)

            const trades = await getTrades(user.id)
            renderTrades(trades)

            // Connect to Deriv
            await connectDerivWebSocket()

            // Start bot engine
            setTimeout(runBotEngine, 5000)

            showToast('🚀 Dashboard ready!')
        } else {
            window.location.href = '/index.html'
        }
    } catch (error) {
        console.error('Init error:', error)
        window.location.href = '/index.html'
    }
})

// ===== EVENT LISTENERS =====
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

console.log('%c🚀 TradeNovaX Dashboard Loaded', 'font-size:20px; color:#D4AF37; font-weight:bold;')
console.log('%c🤖 Bot Engine Running', 'font-size:14px; color:#8899BB;')
console.log('%c📊 Real Deriv data active', 'font-size:14px; color:#8899BB;')
