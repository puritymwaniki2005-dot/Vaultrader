// ============================================================
// TRADENOVAX - COPY TRADER
// ============================================================

let copyTraderClients = []
let copyTraderEnabled = false

async function startCopyTrader() {
    if (copyTraderEnabled) {
        showToast('⚠️ Copy Trader already running')
        return
    }

    const user = await window.auth.getCurrentUser()
    if (!user) {
        showToast('⚠️ Please log in first')
        return
    }

    const clients = await getConnectedClients(user.id)
    if (clients.length === 0) {
        showToast('⚠️ No clients connected')
        return
    }

    copyTraderEnabled = true
    document.getElementById('copyStatus').textContent = '● Running'
    document.getElementById('copyStatus').style.color = 'var(--green)'
    document.getElementById('copyStartBtn').textContent = '⏹ Stop Copy Trading'
    
    showToast('📋 Copy Trader started')
    
    // Start the copy trading loop
    await copyTradingLoop(user.id, clients)
}

async function stopCopyTrader() {
    copyTraderEnabled = false
    document.getElementById('copyStatus').textContent = '● Offline'
    document.getElementById('copyStatus').style.color = 'var(--text-muted)'
    document.getElementById('copyStartBtn').textContent = '▶ Start Copy Trading'
    showToast('⏹ Copy Trader stopped')
}

async function copyTradingLoop(userId, clients) {
    while (copyTraderEnabled) {
        // Get master trades
        const masterTrades = await getMasterTrades(userId)
        
        for (const trade of masterTrades) {
            for (const client of clients) {
                await replicateTrade(client, trade)
            }
        }
        
        // Wait 5 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 5000))
    }
}

async function getMasterTrades(userId) {
    const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .eq('is_master', true)
        .order('created_at', { ascending: false })
        .limit(1)
    if (error) throw error
    return data || []
}

async function getConnectedClients(userId) {
    const { data, error } = await supabase
        .from('copy_clients')
        .select('*')
        .eq('master_id', userId)
        .eq('active', true)
    if (error) throw error
    return data || []
}

async function connectClient(masterId, clientToken) {
    // Client token should be a Deriv API token from the client
    const { data, error } = await supabase
        .from('copy_clients')
        .insert({
            master_id: masterId,
            client_token: clientToken,
            active: true,
            connected_at: new Date().toISOString()
        })
        .select()
        .single()
    if (error) throw error
    return data
}

async function replicateTrade(client, masterTrade) {
    try {
        // Place the same trade on the client's account
        const result = await window.trading.placeTrade({
            symbol: masterTrade.symbol,
            type: masterTrade.type,
            amount: masterTrade.amount * (client.multiplier || 1),
            duration: masterTrade.duration || 60,
            bot_id: masterTrade.bot_id
        })
        
        // Log the replication
        await supabase
            .from('copy_logs')
            .insert({
                client_id: client.id,
                master_trade_id: masterTrade.id,
                result: result ? 'success' : 'failed',
                created_at: new Date().toISOString()
            })
            
        return result
    } catch (error) {
        console.error('Replication error:', error)
        return null
    }
}

// ============================================================
// EXPORTS
// ============================================================

window.copyTrader = {
    startCopyTrader,
    stopCopyTrader,
    connectClient,
    getConnectedClients,
    replicateTrade
}

console.log('📋 Copy Trader module loaded')
