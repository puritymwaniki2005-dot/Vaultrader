// ============================================================
// TRADENOVAX - DERIV OAUTH 2.0 WITH PKCE
// ============================================================

// ============================================================
// TOAST FUNCTION - FIXES showToast is not defined
// ============================================================
function showToast(message) {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toastMessage');
    if (toast && msg) {
        msg.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    } else {
        console.log('🔔 Toast:', message);
        // Try to create a temporary toast
        const tempToast = document.createElement('div');
        tempToast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#0A1628;border:1px solid #D4AF37;border-radius:12px;padding:12px 24px;color:white;z-index:9999;font-size:14px;box-shadow:0 8px 30px rgba(0,0,0,0.5);';
        tempToast.textContent = message;
        document.body.appendChild(tempToast);
        setTimeout(() => tempToast.remove(), 3000);
    }
}

 
// ============================================================ 
// SUPABASE - Safe loading with initialization check
// ============================================================
function initSupabase() {
    if (typeof window._supabaseInitialized !== 'undefined' && window._supabaseInitialized) {
        console.log('ℹ️ Supabase already initialized');
        return true;
    }

    if (typeof window.supabase === 'undefined' || !window.supabase) {
        console.warn('⚠️ Supabase SDK not available');
        return false;
    }

    const SUPABASE_URL = 'https://qbfwvtoabfewhjnmfkxb.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZnd2dG9hYmZld2hqbm1ma3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MzQ4ODcsImV4cCI6MjEwMzQxMDg4N30.Y0UAdvtTOD7vc3V7ZSOa6PTEKOQRQaiEIX1A56jb2H0';

    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window._supabaseInitialized = true;
    console.log('✅ Supabase client created');
    return true;
}

// Try to initialize, retry if needed
if (!initSupabase()) {
    console.warn('⚠️ Supabase SDK not ready, retrying...');
    setTimeout(() => {
        if (!initSupabase()) {
            console.error('❌ Supabase SDK failed to load. Check your internet connection.');
        }
    }, 1000);
}

// ============================================================
// OAUTH CONFIG
// ============================================================
const OAUTH_CONFIG = {
    clientId: '34g3dK2hXuNSYEMsOUlvT',
    redirectUri: 'https://tradenovax.co.ke',
    authEndpoint: 'https://auth.deriv.com/oauth2/auth',
    tokenEndpoint: 'https://auth.deriv.com/oauth2/token',
    scope: 'trade account_manage',
    affiliateToken: '2PKMG53KVFH8',
    utmCampaign: 'tradenovax'
};

// ============================================================
// PKCE GENERATION
// ============================================================
async function generatePKCE() {
    try {
        const array = crypto.getRandomValues(new Uint8Array(64));
        const codeVerifier = Array.from(array)
            .map(v => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'[v % 66])
            .join('');

        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashBase64 = btoa(String.fromCharCode(...hashArray));
        const codeChallenge = hashBase64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const stateArray = crypto.getRandomValues(new Uint8Array(16));
        const state = stateArray
            .reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');

        sessionStorage.setItem('pkce_code_verifier', codeVerifier);
        sessionStorage.setItem('oauth_state', state);

        return { codeVerifier, codeChallenge, state };
    } catch (error) {
        console.error('❌ PKCE generation error:', error);
        const fallbackState = Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('oauth_state', fallbackState);
        return {
            codeVerifier: 'fallback_' + Math.random().toString(36).substring(2, 15),
            codeChallenge: 'fallback_' + Math.random().toString(36).substring(2, 15),
            state: fallbackState
        };
    }
}

// ============================================================
// BUILD OAUTH URL
// ============================================================
async function buildOAuthURL() {
    try {
        const { codeChallenge, state } = await generatePKCE();
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: OAUTH_CONFIG.clientId,
            redirect_uri: OAUTH_CONFIG.redirectUri,
            scope: OAUTH_CONFIG.scope,
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            affiliate_token: OAUTH_CONFIG.affiliateToken,
            utm_campaign: OAUTH_CONFIG.utmCampaign
        });
        return `${OAUTH_CONFIG.authEndpoint}?${params.toString()}`;
    } catch (error) {
        console.error('❌ Failed to build OAuth URL:', error);
        throw error;
    }
}

// ============================================================
// BUILD SIGNUP URL
// ============================================================
async function buildSignupURL() {
    try {
        const { codeChallenge, state } = await generatePKCE();
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: OAUTH_CONFIG.clientId,
            redirect_uri: OAUTH_CONFIG.redirectUri,
            scope: OAUTH_CONFIG.scope,
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            prompt: 'registration',
            affiliate_token: OAUTH_CONFIG.affiliateToken,
            utm_campaign: OAUTH_CONFIG.utmCampaign,
            utm_medium: 'affiliate',
            utm_source: OAUTH_CONFIG.affiliateToken
        });
        return `${OAUTH_CONFIG.authEndpoint}?${params.toString()}`;
    } catch (error) {
        console.error('❌ Failed to build signup URL:', error);
        throw error;
    }
}

// ============================================================
// EXCHANGE CODE FOR TOKEN
// ============================================================
async function exchangeCodeForToken(code, codeVerifier) {
    try {
        if (!code) {
            console.error('❌ No code provided for token exchange');
            return null;
        }

        console.log('🔄 Exchanging code for token...');
        const response = await fetch(OAUTH_CONFIG.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: OAUTH_CONFIG.clientId,
                code: code,
                code_verifier: codeVerifier,
                redirect_uri: OAUTH_CONFIG.redirectUri
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('❌ Token exchange error:', data.error);
            if (data.error_description) {
                console.error('❌ Description:', data.error_description);
            }
            return null;
        }

        if (data.access_token) {
            localStorage.setItem('deriv_access_token', data.access_token);
            localStorage.setItem('deriv_token_expiry', Date.now() + (data.expires_in || 3600) * 1000);
            localStorage.removeItem('deriv_auth_code');
            console.log('✅ Token exchange successful');
            return data;
        } else {
            console.error('❌ No access_token in response');
            return null;
        }
    } catch (error) {
        console.error('❌ Token exchange error:', error);
        return null;
    }
}

// ============================================================
// GET DERIV USER INFO
// ============================================================
async function getDerivUserInfo(accessToken) {
    try {
        console.log('🔄 Getting Deriv user info...');
        const response = await fetch('https://api.deriv.com/v3/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ user: 1 })
        });
        const data = await response.json();
        console.log('✅ Deriv user info:', data);
        return data;
    } catch (error) {
        console.error('❌ Error getting Deriv user info:', error);
        return null;
    }
}

// ============================================================
// CREATE OR GET SUPABASE USER FROM DERIV OAUTH
// ============================================================
async function createSupabaseUserFromDeriv(derivTokens) {
    try {
        const supabase = window.supabase;
        if (!supabase) {
            console.error('❌ Supabase not available');
            return null;
        }

        // Get Deriv user info from tokens
        const userInfo = await getDerivUserInfo(derivTokens.access_token);
        
        if (!userInfo || !userInfo.user) {
            console.error('❌ Could not get Deriv user info');
            return null;
        }

        const derivUser = userInfo.user;
        const email = derivUser.email || derivUser.username + '@deriv.com';
        const name = derivUser.full_name || derivUser.username || 'Deriv Trader';
        
        console.log('📧 Creating Supabase user with email:', email);

        // Try to sign in first
        let { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: derivTokens.access_token + derivTokens.refresh_token
        });

        // If sign in fails, sign up
        if (error && error.message.includes('Invalid login credentials')) {
            console.log('📝 User not found, creating new account...');
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: derivTokens.access_token + derivTokens.refresh_token,
                options: {
                    data: {
                        full_name: name,
                        deriv_account_id: derivUser.account_id || derivUser.user_id || derivTokens.account_id,
                        deriv_username: derivUser.username || '',
                        is_deriv_user: true
                    }
                }
            });
            
            if (signUpError) {
                console.error('❌ Supabase sign up error:', signUpError);
                return null;
            }
            console.log('✅ Supabase user created:', signUpData.user);
            return signUpData.user;
        }

        if (error) {
            console.error('❌ Supabase sign in error:', error);
            return null;
        }

        console.log('✅ Supabase user signed in:', data.user);
        return data.user;
    } catch (error) {
        console.error('❌ Error creating Supabase user:', error);
        return null;
    }
}

// ============================================================
// GET ACCESS TOKEN
// ============================================================
function getAccessToken() {
    const token = localStorage.getItem('deriv_access_token');
    const expiry = parseInt(localStorage.getItem('deriv_token_expiry') || '0');
    if (!token || Date.now() > expiry) {
        return null;
    }
    return token;
}

function isLoggedIn() {
    return !!getAccessToken();
}

// ============================================================
// LOGOUT
// ============================================================
function logout() {
    localStorage.removeItem('deriv_access_token');
    localStorage.removeItem('deriv_token_expiry');
    localStorage.removeItem('deriv_auth_code');
    localStorage.removeItem('deriv_auth_state');
    localStorage.removeItem('deriv_tokens_backup');
    localStorage.removeItem('supabase_user_id');
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('oauth_state');
    console.log('👋 Logged out');
    window.location.href = '/index.html';
}

// ============================================================
// HANDLE OAUTH CALLBACK
// ============================================================
async function handleOAuthCallback() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
            console.error('❌ OAuth Error:', error, errorDescription);
            return null;
        }

        if (!code) {
            console.log('ℹ️ No OAuth code found in URL');
            return null;
        }

        // Verify state
        const storedState = sessionStorage.getItem('oauth_state');
        if (state && storedState && state !== storedState) {
            console.error('❌ State mismatch! CSRF protection triggered.');
            return null;
        }

        const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
        if (!codeVerifier) {
            console.error('❌ No code verifier found');
            return null;
        }

        // Exchange code for tokens
        const tokenData = await exchangeCodeForToken(code, codeVerifier);

        // Clean URL
        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('oauth_state');
        window.history.replaceState({}, document.title, window.location.pathname);

        if (tokenData && tokenData.access_token) {
            console.log('✅ OAuth callback handled successfully');
            
            // Store Deriv tokens
            localStorage.setItem('deriv_access_token', tokenData.access_token);
            localStorage.setItem('deriv_token_expiry', Date.now() + (tokenData.expires_in || 3600) * 1000);
            
            // 🔥 CREATE SUPABASE USER FROM DERIV
            const supabaseUser = await createSupabaseUserFromDeriv(tokenData);
            
            if (supabaseUser) {
                console.log('✅ Supabase user created/signed in:', supabaseUser.email);
                localStorage.setItem('supabase_user_id', supabaseUser.id);
            } else {
                console.warn('⚠️ Could not create Supabase user. Check your Deriv account email.');
                localStorage.setItem('deriv_tokens_backup', JSON.stringify(tokenData));
            }
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1500);
            
            return tokenData;
        } else {
            console.error('❌ Token exchange failed');
            return null;
        }
    } catch (error) {
        console.error('❌ OAuth callback error:', error);
        return null;
    }
}

// ============================================================
// CHECK OAUTH CALLBACK ON PAGE LOAD
// ============================================================
function checkOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    console.log('🔍 OAuth Check:', { code: !!code, state: !!state, error, errorDescription });

    if (error) {
        console.error('❌ OAuth Error:', error, errorDescription);
        showToast(`❌ OAuth Error: ${error}`);
        return;
    }

    if (code && state) {
        console.log('🔄 OAuth callback detected with code:', code.substring(0, 10) + '...');
        handleOAuthCallback().then((result) => {
            console.log('✅ OAuth callback result:', result ? 'Success' : 'Failed');
            if (result) {
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1500);
            }
        });
    } else {
        console.log('ℹ️ No OAuth code found in URL');
    }
}

// ============================================================
// SIGNAL THAT OAUTH IS READY
// ============================================================
function signalOAuthReady() {
    setTimeout(() => {
        try {
            window.dispatchEvent(new CustomEvent('oauth-ready'));
            console.log('✅ OAuth module ready');
        } catch (e) {
            console.warn('⚠️ Could not dispatch event');
        }
    }, 200);
}

// ============================================================
// INITIALIZE
// ============================================================
checkOAuthCallback();
signalOAuthReady();

// ============================================================
// EXPORTS
// ============================================================
window.oauth = {
    buildOAuthURL,
    buildSignupURL,
    exchangeCodeForToken,
    getAccessToken,
    isLoggedIn,
    logout,
    handleOAuthCallback,
    checkOAuthCallback,
    OAUTH_CONFIG,
    createSupabaseUserFromDeriv,
    getDerivUserInfo
};

console.log('🔐 OAuth module loaded');
