// src/services/iframe-auth.service.ts
/**
 * Iframe Authentication Service
 * Handles communication with parent dashboard
 */

const PARENT_ORIGIN = 'https://tradenovax.co.ke';

export class IframeAuthService {
    private static instance: IframeAuthService;
    private isIframe: boolean = false;
    private token: string | null = null;
    private accountType: string = 'live';
    private isAuthenticated: boolean = false;

    private constructor() {
        this.isIframe = window.parent !== window;
        console.log('📦 IframeAuthService initialized, isIframe:', this.isIframe);
    }

    static getInstance(): IframeAuthService {
        if (!IframeAuthService.instance) {
            IframeAuthService.instance = new IframeAuthService();
        }
        return IframeAuthService.instance;
    }

    get isInIframe(): boolean {
        return this.isIframe;
    }

    get authenticated(): boolean {
        return this.isAuthenticated;
    }

    get accessToken(): string | null {
        return this.token || localStorage.getItem('deriv_access_token');
    }

    get accountType(): string {
        return this.accountType || localStorage.getItem('account_type') || 'live';
    }

    initialize() {
        console.log('🔧 Initializing IframeAuthService...');
        
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        const urlAccount = params.get('account_type');
        const embedded = params.get('embedded') === 'true';

        if (urlToken) {
            console.log('🔑 Token found in URL');
            this.token = urlToken;
            this.accountType = urlAccount || 'live';
            localStorage.setItem('deriv_access_token', urlToken);
            localStorage.setItem('account_type', this.accountType);
            
            if (embedded) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } else {
            const storedToken = localStorage.getItem('deriv_access_token');
            if (storedToken) {
                console.log('🔑 Token found in localStorage');
                this.token = storedToken;
                this.accountType = localStorage.getItem('account_type') || 'live';
            }
        }

        this.setupMessageListener();

        setTimeout(() => {
            this.sendMessage('BOT_READY', {
                version: '1.0.0',
                authenticated: !!this.token,
                accountType: this.accountType
            });
        }, 1000);

        console.log('✅ IframeAuthService initialized');
    }

    sendMessage(type: string, data: any = {}) {
        if (this.isIframe) {
            try {
                window.parent.postMessage({
                    type,
                    ...data,
                    source: 'vaultrader-bot'
                }, PARENT_ORIGIN);
                console.log(`📤 Sent message: ${type}`);
            } catch (error) {
                console.error('❌ Failed to send message:', error);
            }
        }
    }

    private setupMessageListener() {
        window.addEventListener('message', (event) => {
            if (event.origin !== PARENT_ORIGIN) return;
            
            console.log('📨 Received message from parent:', event.data);
            
            const data = event.data;
            
            switch (data.type) {
                case 'AUTH':
                    console.log('🔐 Auth request from parent');
                    this.token = data.token;
                    this.accountType = data.accountType || 'live';
                    localStorage.setItem('deriv_access_token', this.token);
                    localStorage.setItem('account_type', this.accountType);
                    this.isAuthenticated = true;
                    
                    this.sendMessage('AUTH_SUCCESS', {
                        user: {
                            email: localStorage.getItem('deriv_user_email') || 'user@deriv.com',
                            name: localStorage.getItem('deriv_user_name') || 'Trader'
                        },
                        accountType: this.accountType
                    });
                    break;
                    
                case 'SWITCH_ACCOUNT':
                    console.log('🔄 Switching account:', data.accountType);
                    this.accountType = data.accountType;
                    localStorage.setItem('account_type', this.accountType);
                    this.sendMessage('ACCOUNT_SWITCHED', { accountType: this.accountType });
                    break;
                    
                case 'GET_STATUS':
                    this.sendMessage('BOT_STATUS', {
                        status: this.token ? 'authenticated' : 'unauthenticated',
                        accountType: this.accountType,
                        hasToken: !!this.token
                    });
                    break;
                    
                default:
                    console.log('ℹ️ Unknown message type:', data.type);
            }
        });
    }

    async fetchUserInfo() {
        const token = this.accessToken;
        if (!token) {
            console.error('❌ No token available');
            return null;
        }

        try {
            const response = await fetch('https://api.deriv.com/v3/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ user: 1 })
            });
            const result = await response.json();
            if (result && result.user) {
                localStorage.setItem('deriv_user_email', result.user.email);
                localStorage.setItem('deriv_user_name', result.user.full_name || result.user.username);
                return result.user;
            }
            return null;
        } catch (error) {
            console.error('❌ Error fetching user info:', error);
            return null;
        }
    }

    async fetchBalance() {
        const token = this.accessToken;
        if (!token) {
            console.error('❌ No token available');
            return null;
        }

        try {
            const response = await fetch('https://api.deriv.com/v3/balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    balance: 1,
                    account: this.accountType 
                })
            });
            const result = await response.json();
            if (result && result.balance) {
                return result.balance;
            }
            return null;
        } catch (error) {
            console.error('❌ Error fetching balance:', error);
            return null;
        }
    }
}

export const iframeAuth = IframeAuthService.getInstance();
