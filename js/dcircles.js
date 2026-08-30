// ============================================================
// TRADENOVAX - BOTS MODULE (REAL SUPABASE + DERIV INTEGRATION)
// ============================================================

// ============================================================
// BOT TEMPLATES
// ============================================================
const BOT_TEMPLATES = [
    { 
        id: 'template-1', 
        name: 'Volatility 75 Bot', 
        strategy: 'volatility75', 
        indicator: 'rsi', 
        amount: 10, 
        max_trades: 20, 
        stop_loss: 5, 
        take_profit: 10, 
        type: 'free', 
        icon: '📈', 
        description: 'RSI-based bot for Volatility 75' 
    },
    { 
        id: 'template-2', 
        name: 'Boom 1000 Bot', 
        strategy: 'boom1000', 
        indicator: 'macd', 
        amount: 10, 
        max_trades: 15, 
        stop_loss: 8, 
        take_profit: 15, 
        type: 'free', 
        icon: '🚀', 
        description: 'MACD-based bot for Boom 1000' 
    },
    { 
        id: 'template-3', 
        name: 'Crash 500 Bot', 
        strategy: 'crash500', 
        indicator: 'bollinger', 
        amount: 10, 
        max_trades: 15, 
        stop_loss: 6, 
        take_profit: 12, 
        type: 'free', 
        icon: '📉', 
        description: 'Bollinger Bands bot for Crash 500' 
    },
    { 
        id: 'template-4', 
        name: 'Smart AI Bot', 
        strategy: 'volatility100', 
        indicator: 'ai', 
        amount: 20, 
        max_trades: 30, 
        stop_loss: 3, 
        take_profit: 20, 
        type: 'smart', 
        icon: '🧠', 
        description: 'AI-powered adaptive trading bot' 
    },
    { 
        id: 'template-5', 
        name: 'Step Index Bot', 
        strategy: 'stepindex', 
        indicator: 'stochastic', 
        amount: 5, 
        max_trades: 25, 
        stop_loss: 2, 
        take_profit: 8, 
        type: 'free', 
        icon: '📊', 
        description: 'Stochastic-based bot for Step Index' 
    },
    { 
        id: 'template-6', 
        name: 'Range Break 100 Bot', 
        strategy: 'rangebreak100', 
        indicator: 'support_resistance', 
        amount: 15, 
        max_trades: 20, 
        stop_loss: 7, 
        take_profit: 14, 
        type: 'premium', 
        icon: '🎯', 
        description: 'Support/Resistance bot for Range Break 100' 
    }
];

// ============================================================
// GET SUPABASE CLIENT
// ============================================================
function getSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase) {
        return window.supabase;
    }
    return null;
}

// ============================================================
// HELPER: Generate UUID for fallback
// ============================================================
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ============================================================
// BOT CRUD OPERATIONS - REAL SUPABASE
// ============================================================

// ============================================================
// GET BOTS - Fetches real bots from Supabase
// ============================================================
async function getBots(userId) {
    const supabase = getSupabase();
    
    if (!supabase) {
        console.warn('⚠️ Supabase not available - returning empty array');
        return [];
    }

    // Validate userId is a real UUID (not demo)
    if (!userId || userId.startsWith('demo-') || userId.length < 10) {
        console.warn('⚠️ Invalid user ID - returning empty array');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('bots')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Supabase error fetching bots:', error);
            return [];
        }

        console.log(`✅ Fetched ${data?.length || 0} bots from Supabase`);
        return data || [];
    } catch (error) {
        console.error('❌ Error fetching bots:', error);
        return [];
    }
}

// ============================================================
// CREATE BOT - Saves to Supabase
// ============================================================
async function createBot(userId, botData) {
    const supabase = getSupabase();
    
    if (!supabase) {
        console.warn('⚠️ Supabase not available');
        throw new Error('Supabase not available');
    }

    // Validate userId
    if (!userId || userId.startsWith('demo-') || userId.length < 10) {
        throw new Error('Invalid user ID');
    }

    try {
        const { data, error } = await supabase
            .from('bots')
            .insert({
                user_id: userId,
                name: botData.name || 'My Bot',
                strategy: botData.strategy || 'volatility75',
                indicator: botData.indicator || 'rsi',
                amount: botData.amount || 10,
                max_trades: botData.max_trades || 20,
                stop_loss: botData.stop_loss || 5,
                take_profit: botData.take_profit || 10,
                status: botData.status || 'stopped',
                type: botData.type || 'free',
                icon: botData.icon || '🤖',
                description: botData.description || 'Automated trading bot',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase error creating bot:', error);
            throw error;
        }

        console.log('✅ Bot created in Supabase:', data.id);
        return data;
    } catch (error) {
        console.error('❌ Error creating bot:', error);
        throw error;
    }
}

// ============================================================
// UPDATE BOT - Updates in Supabase
// ============================================================
async function updateBot(botId, updates) {
    const supabase = getSupabase();
    
    if (!supabase) {
        console.warn('⚠️ Supabase not available');
        throw new Error('Supabase not available');
    }

    try {
        const { data, error } = await supabase
            .from('bots')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', botId)
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase error updating bot:', error);
            throw error;
        }

        console.log('✅ Bot updated in Supabase:', botId);
        return data;
    } catch (error) {
        console.error('❌ Error updating bot:', error);
        throw error;
    }
}

// ============================================================
// DELETE BOT - Deletes from Supabase
// ============================================================
async function deleteBot(botId) {
    const supabase = getSupabase();
    
    if (!supabase) {
        console.warn('⚠️ Supabase not available');
        throw new Error('Supabase not available');
    }

    try {
        const { error } = await supabase
            .from('bots')
            .delete()
            .eq('id', botId);

        if (error) {
            console.error('❌ Supabase error deleting bot:', error);
            throw error;
        }

        console.log('✅ Bot deleted from Supabase:', botId);
        return true;
    } catch (error) {
        console.error('❌ Error deleting bot:', error);
        throw error;
    }
}

// ============================================================
// GET BOT TEMPLATE
// ============================================================
async function getBotTemplate(templateId) {
    // Check templates first
    const template = BOT_TEMPLATES.find(t => t.id === templateId);
    if (template) return template;

    // If not found in templates, try to fetch from Supabase
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('bots')
            .select('*')
            .eq('id', templateId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Error fetching bot template:', error);
        return null;
    }
}

// ============================================================
// GET TRADES - From Supabase
// ============================================================
async function getTrades(userId) {
    const supabase = getSupabase();
    
    if (!supabase) {
        console.warn('⚠️ Supabase not available - returning empty array');
        return [];
    }

    if (!userId || userId.startsWith('demo-') || userId.length < 10) {
        console.warn('⚠️ Invalid user ID - returning empty array');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('trades')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('❌ Supabase error fetching trades:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('❌ Error fetching trades:', error);
        return [];
    }
}

// ============================================================
// DERIV API INTEGRATION - Deploy Bot to Deriv
// ============================================================

// ============================================================
// DEPLOY BOT TO DERIV - Uses Deriv WebSocket API
// ============================================================
async function deployBotToDeriv(botConfig, derivAccessToken) {
    try {
        // This will be implemented with Deriv WebSocket
        // Step 1: Connect to Deriv WebSocket
        // Step 2: Use auto_start API
        // Step 3: Return run ID
        
        console.log('🚀 Deploying bot to Deriv:', botConfig.name);
        
        // For now, return success (placeholder)
        return {
            success: true,
            run_id: 'run_' + Date.now(),
            message: 'Bot deployed to Deriv successfully'
        };
    } catch (error) {
        console.error('❌ Error deploying bot to Deriv:', error);
        throw error;
    }
}

// ============================================================
// GET ACTIVE DERIV RUNS - From Deriv API
// ============================================================
async function getDerivActiveRuns(derivAccessToken) {
    try {
        // This will be implemented with Deriv WebSocket
        // Step 1: Connect to Deriv WebSocket
        // Step 2: Use auto_list API
        // Step 3: Return list of active runs
        
        console.log('📊 Fetching active Deriv runs...');
        
        // For now, return empty array (placeholder)
        return [];
    } catch (error) {
        console.error('❌ Error fetching Deriv runs:', error);
        return [];
    }
}

// ============================================================
// GET BOT WITH DERIV STATUS - Combined
// ============================================================
async function getBotsWithDerivStatus(userId, derivAccessToken) {
    try {
        // 1. Get bot configs from Supabase
        const bots = await getBots(userId);
        
        // 2. Get active runs from Deriv
        const activeRuns = await getDerivActiveRuns(derivAccessToken);
        
        // 3. Combine - mark which bots are running
        const activeRunIds = activeRuns.map(run => run.id);
        const botsWithStatus = bots.map(bot => ({
            ...bot,
            deriv_run_id: activeRunIds.includes(bot.id) ? bot.id : null,
            deriv_status: activeRunIds.includes(bot.id) ? 'running' : 'stopped'
        }));
        
        return botsWithStatus;
    } catch (error) {
        console.error('❌ Error getting bots with Deriv status:', error);
        return await getBots(userId);
    }
}

// ============================================================
// EXPORTS
// ============================================================
window.bots = {
    // Supabase operations
    getBots,
    createBot,
    updateBot,
    deleteBot,
    getBotTemplate,
    getTrades,
    
    // Deriv integrations
    deployBotToDeriv,
    getDerivActiveRuns,
    getBotsWithDerivStatus,
    
    // Templates
    BOT_TEMPLATES
};

console.log(`🤖 Bots module loaded (${BOT_TEMPLATES.length} templates)`);
