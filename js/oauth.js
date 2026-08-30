// ============================================================
// TRADENOVAX - DERIV OAUTH 2.0 WITH PKCE
// ============================================================
 
// ============================================================
// SUPABASE - Declared ONCE
// ============================================================
const SUPABASE_URL = 'https://qbfwvtoabfewhjnmfkxb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZnd2dG9hYmZld2hqbm1ma3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MzQ4ODcsImV4cCI6MjEwMzQxMDg4N30.Y0UAdvtTOD7vc3V7ZSOa6PTEKOQRQaiEIX1A56jb2H0'

let supabase = null;
try {
    if (typeof window.supabase !== 'undefined' && window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        // If supabase wasn't already loaded, load it
        console.warn('⚠️ window.supabase not found, creating from SDK');
        // Check if the SDK is available
        if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.error('❌ Supabase SDK not loaded!');
        }
    }
} catch (e) {
    console.error('❌ Failed to create Supabase client:', e);
}

window.supabase = supabase;

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
}

// ============================================================
// BUILD OAUTH URL
// ============================================================
async function buildOAuthURL() {
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
}

// ============================================================
// BUILD SIGNUP URL
// ============================================================
async function buildSignupURL() {
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
}

// ============================================================
// EXCHANGE CODE FOR TOKEN
// ============================================================
async function exchangeCodeForToken(code, codeVerifier) {
    try {
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
            return null;
        }

        localStorage.setItem('deriv_access_token', data.access_token);
        localStorage.setItem('deriv_token_expiry', Date.now() + (data.expires_in * 1000));
        localStorage.removeItem('deriv_auth_code');

        return data;

    } catch (error) {
        console.error('Token exchange error:', error);
        return null;
    }
}

// ============================================================
// GET ACCESS TOKEN
// ============================================================
function getAccessToken() {
    const token = localStorage.getItem('deriv_access_token');
    const expiry = parseInt(localStorage.getItem('deriv_token_expiry') || '0');
    if (!token || Date.now() > expiry) return null;
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
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('oauth_state');
    window.location.href = '/index.html';
}

// ============================================================
// ===== 🔥 SIGNAL THAT OAUTH IS READY =====
// ============================================================
function signalOAuthReady() {
    // Wait a moment for everything to settle
    setTimeout(() => {
        try {
            window.dispatchEvent(new CustomEvent('oauth-ready'));
            console.log('✅ OAuth module ready');
        } catch (e) {
            console.warn('⚠️ Could not dispatch event, using direct callback');
            if (typeof window._onOAuthReady === 'function') {
                window._onOAuthReady();
            }
        }
    }, 100);
}

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
    OAUTH_CONFIG
};

// Signal ready
signalOAuthReady();

console.log('🔐 OAuth module loaded');
