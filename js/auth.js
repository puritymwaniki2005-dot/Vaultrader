// ============================================================
// TRADENOVAX - SUPABASE AUTH
// ============================================================ 

const SUPABASE_URL = 'https://qbfwvtoabfewhjnmfkxb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZnd2dG9hYmZld2hqbm1ma3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MzQ4ODcsImV4cCI6MjEwMzQxMDg4N30.Y0UAdvtTOD7vc3V7ZSOa6PTEKOQRQaiEIX1A56jb2H0'

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
window.supabase = supabase

// ============================================================
// AUTH FUNCTIONS
// ============================================================

async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
}

async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName }
        }
    })
    if (error) throw error
    return data
}

async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
}

async function signOut() {
    const { error } = await supabase.auth.signOut()
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
// AUTH UI HELPERS
// ============================================================

function updateUserUI(user) {
    if (user) {
        document.getElementById('userName').textContent = user.email?.split('@')[0] || 'Trader'
        document.getElementById('userEmail').textContent = user.email || ''
        document.getElementById('userAvatar').textContent = user.email?.[0]?.toUpperCase() || 'T'
        document.getElementById('userStatus').textContent = '● Online'
        document.getElementById('userStatus').style.color = 'var(--green)'
    }
}

// ============================================================
// EXPORTS
// ============================================================

window.auth = {
    supabase,
    getCurrentUser,
    signUp,
    signIn,
    signOut,
    isLoggedIn,
    updateUserUI
}

console.log('🔐 Auth module loaded')
