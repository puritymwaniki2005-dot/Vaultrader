// ============================================================
// TRADENOVAX - DASHBOARD CONTROLLER
// ============================================================

// ============================================================ 
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check auth
        const user = await window.auth.getCurrentUser()
        if (!user) {
            window.location.href = '/index.html'
            return
        }

        // Update UI
        window.auth.updateUserUI(user)

        // Load bots
        await loadBots(user.id)

        // Load trades
        await loadTrades(user.id)

        // Setup event listeners
        setupEventListeners()

        showToast('🚀 Dashboard ready!')

    } catch (error) {
        console.error('Init error:', error)
        window.location.href = '/index.html'
    }
})

// ============================================================
// LOAD DATA
// ============================================================

async function loadBots(userId) {
    try {
        const bots = await window.bots.getBots(userId)
        renderBots(bots)
        updateBotCount(bots)
    } catch (error) {
        console.error('Load bots error:', error)
    }
}

async function loadTrades(userId) {
    try {
        const trades = await window.bots.getTrades(userId)
        renderTrades(trades)
        updateTradeSummary(trades)
    } catch (error) {
        console.error('Load trades error:', error)
    }
}

// ============================================================
// RENDER BOTS
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

// ============================================================
// RENDER TRADES
// ============================================================

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
        const user = await window.auth.getCurrentUser()
        if (!user) return

        const newStatus = currentStatus === 'running' ? 'paused' :
                         currentStatus === 'paused' ? 'running' : 'running'

        await window.bots.updateBot(botId, { status: newStatus })
        await loadBots(user.id)
        showToast(`✅ Bot ${newStatus === 'running' ? 'started' : 'paused'}`)
    } catch (error) {
        showToast('❌ Error: ' + error.message)
    }
}

async function loadBot(botId) {
    try {
        const user = await window.auth.getCurrentUser()
        if (!user) return

        const bot = await window.bots.getBotTemplate(botId)
        if (!bot) {
            showToast('⚠️ Bot not found')
            return
        }

        // Load into builder
        document.getElementById('strategySelect').value = bot.strategy || 'volatility75'
        document.getElementById('indicatorSelect').value = bot.indicator || 'rsi'
        document.getElementById('tradeAmount').value = bot.amount || 10
        document.getElementById('maxTrades').value = bot.max_trades || 20
        document.getElementById('stopLoss').value = bot.stop_loss || 5
        document.getElementById('takeProfit').value = bot.take_profit || 10
        document.getElementById('botName').value = bot.name || 'My Bot'

        // Switch to builder tab
        switchPage('builder')
        showToast(`✅ "${bot.name}" loaded!`)
    } catch (error) {
        showToast('❌ Error loading bot: ' + error.message)
    }
}

// ============================================================
// DEPLOY BOT
// ============================================================

async function deployBot() {
    try {
        const user = await window.auth.getCurrentUser()
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

        await window.bots.createBot(user.id, botData)
        status.textContent = `✅ "${name}" deployed successfully!`
        status.style.color = 'var(--green)'
        showToast(`✅ Bot "${name}" deployed!`)

        // Refresh bot list
        await loadBots(user.id)

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
    document.querySelectorAll('.sidebar-nav a[data-page]').forEach(el => el.classList.remove('active'))
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
// UI HELPERS
// ============================================================

function updateBotCount(bots) {
    const active = bots?.filter(b => b.status === 'running').length || 0
    const total = bots?.length || 0
    document.getElementById('activeBotsCount').textContent = active
    document.getElementById('totalBotsCount').textContent = total
}

function updateTradeSummary(trades) {
    if (!trades || trades.length === 0) {
        document.getElementById('totalTrades').textContent = '0'
        document.getElementById('winRate').textContent = '0%'
        document.getElementById('totalPnL').textContent = '$0.00'
        return
    }

    const wins = trades.filter(t => t.profit_loss > 0).length
    const total = trades.length
    const winRate = total > 0 ? (wins / total * 100) : 0
    const totalPnL = trades.reduce((sum, t) => sum + (t.profit_loss || 0), 0)

    document.getElementById('totalTrades').textContent = total
    document.getElementById('winRate').textContent = winRate.toFixed(1) + '%'
    document.getElementById('totalPnL').textContent = '$' + totalPnL.toFixed(2)
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav a[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault()
            switchPage(this.dataset.page)
        })
    })

    // Menu toggle (mobile)
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar)
    document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar)

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSidebar()
        if (e.ctrlKey && e.key === 'b') switchPage('builder')
        if (e.ctrlKey && e.key === 'd') switchPage('dashboard')
        if (e.ctrlKey && e.key === 't') switchPage('trades')
    })

    // Deploy bot button
    document.getElementById('deployBtn')?.addEventListener('click', deployBot)

    // Run bot button
    document.getElementById('runBotBtn')?.addEventListener('click', window.trading.toggleBotExecution)

    // Scan button
    document.getElementById('scanBtn')?.addEventListener('click', window.scanner.runAIScanner)
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
// EXPOSE GLOBALLY
// ============================================================

window.switchPage = switchPage
window.toggleBot = toggleBot
window.loadBot = loadBot
window.deployBot = deployBot
window.toggleSidebar = toggleSidebar
window.closeSidebar = closeSidebar

console.log('📊 Dashboard module loaded')
console.log('🤖 TradeNovaX is ready!')
