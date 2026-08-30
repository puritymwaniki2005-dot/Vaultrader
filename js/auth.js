// ============================================================
// TRADENOVAX - AUTH (LIVE - WITH SUPABASE)
// ============================================================

// ===== SUPABASE IS ALREADY DECLARED IN OAUTH.JS =====
// DO NOT redeclare supabase here - use the existing one!
// The supabase variable is already defined globally

// ============================================================
// 🔥 SWITCH TO REAL AUTH
// ============================================================
const DEMO_MODE = false  // ← CHANGE TO false FOR LIVE!

// ============================================================
// DEMO USER (fallback when DEMO_MODE = true)
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
// AUTH FUNCTIONS
// ============================================================
async function getCurrentUser() {
    if (DEMO_MODE) {
        return getDemoUser()
    }
    
    // REAL: Get user from Supabase (using global supabase)
    const { data: { user }, error } = await window.supabase.auth.getUser()
    if (error) throw error
    return user
}

async function signUp(email, password, fullName) {
    if (DEMO_MODE) {
        const user = getDemoUser()
        showToast('✅ Demo account created!')
        return { user }
    }
    
    const { data, error } = await window.supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
    })
    if (error) throw error
    return data
}

async function signIn(email, password) {
    if (DEMO_MODE) {
        const user = getDemoUser()
        showToast('✅ Welcome back! (Demo Mode)')
        return { user }
    }
    
    const { data, error } = await window.supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
}

async function logout() {
    if (DEMO_MODE) {
        localStorage.removeItem('tradenovax_demo_user')
        showToast('👋 Logged out')
        window.location.href = '/index.html'
        return
    }
    
    const { error } = await window.supabase.auth.signOut()
    if (error) throw error
}

async function isLoggedIn() {
    try {
        const user = await getCurrentUser()
        return !!user
    } catch {
        return false
    }
}

// ============================================================
// SAVE DERIV TOKENS AFTER OATH LOGIN
// ============================================================
async function saveDerivConnection(userId, tokens) {
    const { data, error } = await window.supabase
        .from('deriv_connections')
        .upsert({
            user_id: userId,
            deriv_access_token: tokens.access_token,
            deriv_refresh_token: tokens.refresh_token,
            token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
            deriv_account_id: tokens.account_id,
            is_active: true
        })
        .select()
        .single()
    
    if (error) throw error
    return data
}

// ============================================================
// AUTH UI HELPERS
// ============================================================
function updateUserUI(user) {
    if (user) {
        const nameEl = document.getElementById('userName')
        const emailEl = document.getElementById('userEmail')
        const avatarEl = document.getElementById('userAvatar')
        const statusEl = document.getElementById('userStatus')
        
        if (nameEl) nameEl.textContent = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader'
        if (emailEl) emailEl.textContent = user.email || 'demo@tradenovax.com'
        if (avatarEl) avatarEl.textContent = (user.user_metadata?.full_name || user.email || 'T')[0].toUpperCase()
        if (statusEl) {
            statusEl.textContent = DEMO_MODE ? '● Demo Mode' : '● Online'
            statusEl.style.color = DEMO_MODE ? 'var(--gold)' : 'var(--green)'
        }
        
        const derivStatus = document.getElementById('derivStatus')
        if (derivStatus) {
            derivStatus.textContent = DEMO_MODE ? '🎮 Demo Mode' : '🔗 Connected'
            derivStatus.style.color = DEMO_MODE ? 'var(--gold)' : 'var(--green)'
            derivStatus.style.borderColor = DEMO_MODE ? 'var(--gold)' : 'var(--green)'
        }
    }
}

// ============================================================
// EXPORTS
// ============================================================
window.auth = {
    DEMO_MODE,
    getCurrentUser,
    signUp,
    signIn,
    logout,
    isLoggedIn,
    updateUserUI,
    saveDerivConnection
}

console.log('🔐 Auth loaded (LIVE MODE: ' + (DEMO_MODE ? 'OFF' : 'ON') + ')')
