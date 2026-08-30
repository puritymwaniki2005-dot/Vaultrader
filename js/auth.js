// ============================================================
// TRADENOVAX - AUTH (USES SUPABASE FROM OAUTH.JS)
// ============================================================

// ============================================================
// 🔥 SWITCH TO REAL AUTH
// ============================================================
const DEMO_MODE = false  // ← CHANGE TO false FOR LIVE!

// ============================================================
// DEMO USER (fallback when DEMO_MODE = true or Supabase unavailable)
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
// HELPER: Get Supabase safely (from window)
// ============================================================
function getSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase) {
        return window.supabase;
    }
    return null;
}

// ============================================================
// AUTH FUNCTIONS
// ============================================================
async function getCurrentUser() {
    if (DEMO_MODE) {
        return getDemoUser()
    }
    
    const supabase = getSupabase();
    if (!supabase) {
        console.warn('⚠️ Supabase not available, using demo user');
        return getDemoUser();
    }
    
    try {
        // First try to get the session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            console.warn('⚠️ No Supabase session found');
            // Check if we have Deriv tokens but no Supabase session
            const derivToken = localStorage.getItem('deriv_access_token');
            if (derivToken) {
                console.log('ℹ️ Deriv token found but no Supabase session');
                // Try to recover - check if we have a user id in localStorage
                const userId = localStorage.getItem('supabase_user_id');
                if (userId) {
                    // Return a minimal user object
                    return {
                        id: userId,
                        email: localStorage.getItem('supabase_user_email') || 'user@deriv.com',
                        user_metadata: {
                            full_name: localStorage.getItem('supabase_user_name') || 'Deriv Trader'
                        }
                    };
                }
            }
            return getDemoUser();
        }
        
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        // Store user info in localStorage for fallback
        if (user) {
            localStorage.setItem('supabase_user_id', user.id);
            localStorage.setItem('supabase_user_email', user.email || '');
            localStorage.setItem('supabase_user_name', user.user_metadata?.full_name || 'Trader');
        }
        
        return user;
    } catch (error) {
        console.warn('⚠️ Auth error, using demo user:', error.message);
        return getDemoUser();
    }
}

async function signUp(email, password, fullName) {
    if (DEMO_MODE) {
        const user = getDemoUser()
        return { user }
    }
    
    const supabase = getSupabase();
    if (!supabase) {
        console.warn('⚠️ Supabase not available, using demo');
        return { user: getDemoUser() }
    }
    
    const { data, error } = await supabase.auth.signUp({
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
        return { user }
    }
    
    const supabase = getSupabase();
    if (!supabase) {
        console.warn('⚠️ Supabase not available, using demo');
        return { user: getDemoUser() }
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
}

async function logout() {
    if (DEMO_MODE) {
        localStorage.removeItem('tradenovax_demo_user')
        window.location.href = '/index.html'
        return
    }
    
    const supabase = getSupabase();
    if (!supabase) {
        localStorage.removeItem('tradenovax_demo_user')
        window.location.href = '/index.html'
        return
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Clear local storage
    localStorage.removeItem('supabase_user_id');
    localStorage.removeItem('supabase_user_email');
    localStorage.removeItem('supabase_user_name');
    window.location.href = '/index.html'
}

async function isLoggedIn() {
    try {
        const user = await getCurrentUser()
        return !!user && !user.id?.startsWith('demo-')
    } catch {
        return false
    }
}

// ============================================================
// SAVE DERIV TOKENS AFTER OAUTH LOGIN
// ============================================================
async function saveDerivConnection(userId, tokens) {
    const supabase = getSupabase();
    if (!supabase) {
        console.warn('⚠️ Supabase not available, saving to localStorage only');
        localStorage.setItem('deriv_tokens_backup', JSON.stringify(tokens));
        return tokens;
    }
    
    const { data, error } = await supabase
        .from('deriv_connections')
        .upsert({
            user_id: userId,
            deriv_access_token: tokens.access_token,
            deriv_refresh_token: tokens.refresh_token,
            token_expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
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
        
        const isDemo = user.id?.startsWith('demo-');
        
        if (nameEl) nameEl.textContent = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader'
        if (emailEl) emailEl.textContent = user.email || 'demo@tradenovax.com'
        if (avatarEl) avatarEl.textContent = (user.user_metadata?.full_name || user.email || 'T')[0].toUpperCase()
        if (statusEl) {
            if (isDemo) {
                statusEl.textContent = '● Demo Mode'
                statusEl.style.color = 'var(--gold)'
            } else {
                statusEl.textContent = '● Online'
                statusEl.style.color = 'var(--green)'
            }
        }
        
        const derivStatus = document.getElementById('derivStatus')
        if (derivStatus) {
            const token = localStorage.getItem('deriv_access_token');
            if (token) {
                derivStatus.textContent = '🔗 Connected'
                derivStatus.style.color = 'var(--green)'
                derivStatus.style.borderColor = 'var(--green)'
            } else {
                derivStatus.textContent = isDemo ? '🎮 Demo Mode' : '🔗 Not connected'
                derivStatus.style.color = isDemo ? 'var(--gold)' : 'var(--text-muted)'
                derivStatus.style.borderColor = isDemo ? 'var(--gold)' : 'var(--text-muted)'
            }
        }
    }
}

// ============================================================
// UPDATE DERIV STATUS
// ============================================================
function updateDerivStatus() {
    const statusEl = document.getElementById('derivStatusText') || document.getElementById('derivStatus')
    const token = localStorage.getItem('deriv_access_token')
    const code = localStorage.getItem('deriv_auth_code')
    
    if (statusEl) {
        if (token) {
            statusEl.textContent = '✅ Connected'
            statusEl.style.color = 'var(--green)'
        } else if (code) {
            statusEl.textContent = '⏳ Authorizing...'
            statusEl.style.color = 'var(--gold)'
        } else {
            statusEl.textContent = '🔗 Not connected'
            statusEl.style.color = 'var(--text-muted)'
        }
    }
}

// ============================================================
// ===== 🔥 INITIALIZATION - WAIT FOR OAUTH READY =====
// ============================================================
function initializeAuth() {
    console.log('✅ Auth initializing...');
    
    // Load any saved tokens
    const savedTokens = localStorage.getItem('deriv_tokens_backup');
    if (savedTokens) {
        try {
            const tokens = JSON.parse(savedTokens);
            if (tokens.access_token) {
                localStorage.setItem('deriv_access_token', tokens.access_token);
                localStorage.setItem('deriv_token_expiry', Date.now() + (tokens.expires_in || 3600) * 1000);
            }
        } catch (e) {}
    }
    
    // Update UI status
    updateDerivStatus();
    
    console.log('✅ Auth initialized');
}

// ============================================================
// ===== 🔥 LISTEN FOR OAUTH READY =====
// ============================================================
let authInitialized = false;

function initAuthOnce() {
    if (authInitialized) return;
    authInitialized = true;
    initializeAuth();
}

// Listen for the OAuth ready event
document.addEventListener('oauth-ready', function() {
    console.log('📡 OAuth ready event received');
    initAuthOnce();
});

// Also check if OAuth is already ready
setTimeout(function() {
    if (typeof window.oauth !== 'undefined' && window.oauth) {
        console.log('✅ OAuth already loaded, initializing...');
        initAuthOnce();
    } else {
        console.log('⏳ Waiting for OAuth module...');
        document.addEventListener('oauth-ready', function() {
            initAuthOnce();
        });
    }
}, 500);

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
    updateDerivStatus,
    saveDerivConnection
};

console.log('🔐 Auth module loaded (waiting for OAuth ready...)');
