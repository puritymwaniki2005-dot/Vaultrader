// ============================================================
// TRADENOVAX - TRADING ENGINE (Deriv Ready)
// ============================================================

// ===== SWITCH TO FALSE WHEN YOU HAVE APP ID =====
const USE_DERIV_REAL = false

// ============================================================
// GET DERIV CONNECTION
// ============================================================

async function getDerivConnection(userId) {
    if (!USE_DERIV_REAL) {
        // Simulate connection for demo
        return {
            deriv_access_token: 'demo-token',
            is_active: true
        }
    }
    
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
// PLACE TRADE - REAL DERIV READY
// ============================================================

async function placeTrade(tradeParams) {
    try {
        const user = await window.auth.getCurrentUser()
        if (!user) {
            showToast('⚠️ Please log in first')
            return null
        }

        // If using real Deriv trading
        if (USE_DERIV_REAL) {
            const deriv = await getDerivConnection(user.id)
            if (!deriv) {
                showToast('⚠️ Please connect your Deriv account')
                return null
            }

            // REAL DERIV API CALL
            const proposalResponse = await fetch('https://api.deriv.com/v1/proposal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: deriv.deriv_access_token,
                    proposal: 1,
                    amount: tradeParams.amount,
                    contract_type: tradeParams.type === 'CALL' ? 'CALL' : 'PUT',
                    duration: tradeParams.duration || 60,
                    duration_unit: 's',
                    symbol: tradeParams.symbol || 'R_75',
                    basis: 'stake',
                    currency: 'USD'
                })
            })
            
            const proposalData = await proposalResponse.json()
            
            if (proposalData.error) {
                showToast('❌ Trade failed: ' + proposalData.error.message)
                return null
            }

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

            // Save real trade to Supabase
            const tradeRecord = {
                user_id: user.id,
                bot_id: tradeParams.bot_id || null,
                symbol: tradeParams.symbol || 'R_75',
                type: tradeParams.type || 'CALL',
                amount: tradeParams.amount,
                price: proposalData.proposal.spot,
                status: 'pending',
                contract_id: buyData.buy.contract_id,
                is_demo: false
            }
            await supabase.from('trades').insert(tradeRecord)
            showToast(`✅ Trade placed: ${tradeParams.type} on ${tradeParams.symbol}`)
            return buyData
        }

        // ===== DEMO TRADING =====
        // Simulate trade (this runs when USE_DERIV_REAL = false)
        const isWin = Math.random() > 0.45
        const profitLoss = isWin 
            ? tradeParams.amount * (0.5 + Math.random() * 0.8) 
            : -tradeParams.amount * (0.3 + Math.random() * 0.7)

        const result = {
            contract_id: 'demo-' + Date.now(),
            profit_loss: parseFloat(profitLoss.toFixed(2)),
            status: isWin ? 'won' : 'lost'
        }

        // Save demo trade to Supabase (LIVE database!)
        const tradeRecord = {
            user_id: user.id,
            bot_id: tradeParams.bot_id || null,
            symbol: tradeParams.symbol || 'R_75',
            type: tradeParams.type || 'CALL',
            amount: tradeParams.amount || 1,
            price: 100 + Math.random() * 50,
            profit_loss: result.profit_loss,
            status: result.status,
            is_demo: true
        }
        await supabase.from('trades').insert(tradeRecord)

        showToast(`🎮 Demo Trade: ${tradeParams.type} on ${tradeParams.symbol} → ${isWin ? '✅ WIN' : '❌ LOSS'}`)
        return result

    } catch (error) {
        console.error('Trade error:', error)
        showToast('❌ Trade error: ' + error.message)
        return null
    }
}

// ============================================================
// BOT ENGINE
// ============================================================

let botEngineRunning = false
let botEngineInterval = null

async function startBotEngine() {
    if (botEngineRunning) return
    botEngineRunning = true
    
    const user = await window.auth.getCurrentUser()
    if (!user) {
        botEngineRunning = false
        return
    }

    const bots = await window.bots.getBots(user.id)
    const activeBots = bots.filter(b => b.status === 'running')

    for (const bot of activeBots) {
        try {
            const strategy = window.strategies.STRATEGIES[bot.strategy]
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
    setTimeout(runBotEngine, 60000)
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
// EXPORTS
// ============================================================

window.trading = {
    getDerivConnection,
    placeTrade,
    startBotEngine,
    runBotEngine,
    toggleBotExecution,
    stopBotEngine,
    USE_DERIV_REAL
}

console.log('📊 Trading loaded (Deriv Ready: ' + (USE_DERIV_REAL ? 'ON' : 'OFF') + ')')
