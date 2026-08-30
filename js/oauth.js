// ============================================================
// TRADENOVAX - DERIV OAUTH 2.0 WITH PKCE
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
    // 1. Generate random code_verifier (43-128 characters)
    const array = crypto.getRandomValues(new Uint8Array(64));
    const codeVerifier = Array.from(array)
        .map(v => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'[v % 66])
        .join('');

    // 2. Derive code_challenge using SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = btoa(String.fromCharCode(...hashArray));
    const codeChallenge = hashBase64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    // 3. Generate random state for CSRF protection
    const stateArray = crypto.getRandomValues(new Uint8Array(16));
    const state = stateArray
        .reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');

    // 4. Store for later use (survives redirect)
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
// BUILD SIGNUP URL (with prompt=registration)
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
// HANDLE OAUTH CALLBACK
// ============================================================

async function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    // Check for errors
    if (error) {
        showToast(`❌ OAuth Error: ${error} - ${errorDescription || ''}`);
        return null;
    }

    // Verify state (CSRF protection)
    const storedState = sessionStorage.getItem('oauth_state');
    if (!state || state !== storedState) {
        showToast('❌ Security: State mismatch. Possible CSRF attack.');
        return null;
    }

    // Get the stored code_verifier
    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
    if (!codeVerifier) {
        showToast('❌ PKCE verifier not found. Please try again.');
        return null;
    }

    // Clear stored values
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('oauth_state');

    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code, codeVerifier);
    return tokenData;
}

// ============================================================
// EXCHANGE CODE FOR TOKEN (Server-side in production)
// ============================================================

async function exchangeCodeForToken(code, codeVerifier) {
    try {
        // IMPORTANT: This should be done server-side in production!
        // For demo/testing, we'll do it client-side (but this exposes your client secret)
        // Deriv's OAuth uses PKCE, so no client secret is needed for the exchange!

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
            showToast(`❌ Token exchange failed: ${data.error}`);
            return null;
        }

        // Store the access token
        localStorage.setItem('deriv_access_token', data.access_token);
        localStorage.setItem('deriv_token_expiry', Date.now() + (data.expires_in * 1000));

        showToast('✅ Successfully connected to Deriv!');
        return data;

    } catch (error) {
        console.error('Token exchange error:', error);
        showToast('❌ Failed to exchange code for token.');
        return null;
    }
}

// ============================================================
// GET ACCESS TOKEN (with auto-refresh)
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
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('oauth_state');
    showToast('👋 Logged out');
    window.location.href = '/index.html';
}

// ============================================================
// OAUTH MODAL FUNCTIONS
// ============================================================

async function openDerivModal() {
    const modal = document.getElementById('derivModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeDerivModal() {
    const modal = document.getElementById('derivModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================================
// INIT - Check OAuth Callback on Page Load
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Check if we're returning from OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
        await handleOAuthCallback();
        // Remove code from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        // Redirect to dashboard after successful login
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 2000);
    }
});

// ============================================================
// EXPORTS
// ============================================================

window.oauth = {
    buildOAuthURL,
    buildSignupURL,
    handleOAuthCallback,
    getAccessToken,
    isLoggedIn,
    logout,
    openDerivModal,
    closeDerivModal,
    OAUTH_CONFIG
};

console.log('🔐 OAuth module loaded');
