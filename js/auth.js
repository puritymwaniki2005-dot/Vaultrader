// ============================================================
// TRADENOVAX - AUTH (DEMO LOGIN ONLY)
// ============================================================

const SUPABASE_URL = 'https://qbfwvtoabfewhjnmfkxb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZnd2dG9hYmZld2hqbm1ma3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MzQ4ODcsImV4cCI6MjEwMzQxMDg4N30.Y0UAdvtTOD7vc3V7ZSOa6PTEKOQRQaiEIX1A56jb2H0'

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
window.supabase = supabase

// ============================================================
// DEMO LOGIN - Auto-creates user 
// ============================================================

async function getCurrentUser() {
    // Check if we have a stored demo user
    let demoUser = localStorage.getItem('tradenovax_demo_user')
    if (demoUser) {
        return JSON.parse(demoUser)
    }
    
    // Create new demo user
    const newUser = {
        id: 'demo-' + Date.now(),
        email: 'demo@tradenovax.com',
        user_metadata: { full_name: 'Demo Trader' }
    }
    localStorage.setItem('tradenovax_demo_user', JSON.stringify(newUser))
    return newUser
}

async function signOut() {
    localStorage.removeItem('tradenovax_demo_user')
    showToast('👋 Logged out')
    window.location.href = '/index.html'
}

async function isLoggedIn() {
    return !!localStorage.getItem('tradenovax_demo_user')
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
        
        if (nameEl) nameEl.textContent = user.user_metadata?.full_name || 'Demo Trader'
        if (emailEl) emailEl.textContent = user.email || 'demo@tradenovax.com'
        if (avatarEl) avatarEl.textContent = 'DT'
        if (statusEl) {
            statusEl.textContent = '● Demo Mode'
            statusEl.style.color = 'var(--gold)'
        }
        
        const derivStatus = document.getElementById('derivStatus')
        if (derivStatus) {
            derivStatus.textContent = '🎮 Demo Mode'
            derivStatus.style.color = 'var(--gold)'
            derivStatus.style.borderColor = 'var(--gold)'
        }
    }
}

// ============================================================
// EXPORTS
// ============================================================

window.auth = {
    supabase,
    getCurrentUser,
    signOut,
    isLoggedIn,
    updateUserUI
}

console.log('🔐 Auth loaded (Demo Login)')
