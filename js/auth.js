// ============================================================
// TRADENOVAX - AUTH (DEMO LOGIN ONLY - NO SUPABASE)
// ============================================================

// ============================================================
// DEMO LOGIN - Auto-creates user
// ============================================================

async function getCurrentUser() {
    let demoUser = localStorage.getItem('tradenovax_demo_user')
    if (demoUser) {
        return JSON.parse(demoUser)
    }
    
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

window.auth = {
    getCurrentUser,
    signOut,
    isLoggedIn,
    updateUserUI
}

console.log('🔐 Auth loaded (Demo Login - No Supabase)')
