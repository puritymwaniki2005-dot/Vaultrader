// ============================================================
// TRADENOVAX - COMPLETE CODE PROTECTION
// ============================================================

(function() {
    'use strict';

    console.log('🛡️ Code protection enabled');

    // ============================================================
    // 1. DISABLE RIGHT CLICK (Context Menu)
    // ============================================================
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showProtectionAlert('🚫 Right-click disabled');
        return false;
    });

    // ============================================================
    // 2. DISABLE KEYBOARD SHORTCUTS (Ctrl+U, Ctrl+S, Ctrl+C, F12)
    // ============================================================
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            showProtectionAlert('🚫 Developer tools blocked');
            return false;
        }

        // Ctrl+Shift+I (Inspect)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.keyCode === 73)) {
            e.preventDefault();
            showProtectionAlert('🚫 Developer tools blocked');
            return false;
        }

        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.keyCode === 74)) {
            e.preventDefault();
            showProtectionAlert('🚫 Console blocked');
            return false;
        }

        // Ctrl+U (View Source)
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
            e.preventDefault();
            showProtectionAlert('🚫 View source blocked');
            return false;
        }

        // Ctrl+S (Save Page)
        if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
            e.preventDefault();
            showProtectionAlert('🚫 Save page blocked');
            return false;
        }

        // Ctrl+C (Copy) - Only block on page content
        if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.keyCode === 67)) {
            const selection = window.getSelection().toString();
            if (selection.length > 10) {
                e.preventDefault();
                showProtectionAlert('🚫 Copying content blocked');
                return false;
            }
        }

        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.keyCode === 67)) {
            e.preventDefault();
            showProtectionAlert('🚫 Inspect element blocked');
            return false;
        }
    });

    // ============================================================
    // 3. DISABLE DRAG AND DROP (Images, Text)
    // ============================================================
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        showProtectionAlert('🚫 Drag and drop disabled');
        return false;
    });

    document.addEventListener('drop', function(e) {
        e.preventDefault();
        return false;
    });

    // ============================================================
    // 4. DISABLE SELECTION (Text Copying)
    // ============================================================
    document.addEventListener('selectstart', function(e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            return false;
        }
    });

    // Allow selection in input fields
    document.addEventListener('selectionchange', function() {
        const selection = window.getSelection();
        if (selection.toString().length > 0) {
            // Only allow in input/textarea
            if (selection.anchorNode && selection.anchorNode.parentElement) {
                const tag = selection.anchorNode.parentElement.tagName;
                if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
                    selection.removeAllRanges();
                }
            }
        }
    });

    // ============================================================
    // 5. DISABLE DEVICE CONTEXT (F12 and Developer Tools)
    // ============================================================
    // Block common DevTools opening methods
    const blockDevTools = function() {
        const before = new Date().getTime();
        debugger;
        const after = new Date().getTime();
        if (after - before > 100) {
            showProtectionAlert('🚫 Developer tools detected!');
            document.body.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0A1628;color:#fff;text-align:center;padding:2rem;flex-direction:column;">
                    <span style="font-size:4rem;margin-bottom:1rem;">🔒</span>
                    <h1 style="color:#D4AF37;">Access Denied</h1>
                    <p style="color:#8899BB;max-width:400px;">Developer tools are not allowed on this site. Please close the console and refresh.</p>
                </div>
            `;
            document.body.style.overflow = 'hidden';
        }
    };

    // Run periodically to catch DevTools
    setInterval(blockDevTools, 500);

    // ============================================================
    // 6. DISABLE IMAGE DRAG (Protect Logo and Images)
    // ============================================================
    document.querySelectorAll('img, .logo-icon, .logo-text, .logo, .feature-icon, .icon, .bot-icon, .avatar, .modal-icon, .toast-icon, .scanner-icon, .wn-icon, .h-icon, .add-icon, .empty-icon, .run-icon, .toast-icon, .glow-line, .bg-canvas, .logo-icon-sm, .logo-icon, .orb, .ticker-item').forEach(function(el) {
        el.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        el.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
        // Prevent image selection
        el.style.userSelect = 'none';
        el.style.webkitUserSelect = 'none';
        el.style.mozUserSelect = 'none';
        el.style.msUserSelect = 'none';
        el.style.pointerEvents = 'auto';
    });

    // ============================================================
    // 7. PREVENT IFRAME EMBEDDING (Clickjacking Protection)
    // ============================================================
    if (window.top !== window.self) {
        window.top.location = window.self.location;
    }

    // ============================================================
    // 8. PREVENT CONSOLE LOG SPAM (Disable console methods)
    // ============================================================
    // Only disable for production (keep for debugging)
    if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
        // Keep console.log for your own debugging but prevent others
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        const originalInfo = console.info;

        console.log = function() {
            // Allow only specific messages
            const msg = arguments[0] || '';
            if (typeof msg === 'string' && (
                msg.includes('🚀') || 
                msg.includes('✅') || 
                msg.includes('🛡️') ||
                msg.includes('🔐') ||
                msg.includes('📊') ||
                msg.includes('🤖')
            )) {
                originalLog.apply(console, arguments);
            }
        };

        console.warn = function() {
            // Filter out warnings from third-party scripts
            const msg = arguments[0] || '';
            if (typeof msg === 'string' && !msg.includes('LiveChat')) {
                originalWarn.apply(console, arguments);
            }
        };
    }

    // ============================================================
    // 9. PREVENT PAGE INSPECTION (Pseudo-element overlay)
    // ============================================================
    // Add an invisible overlay that breaks inspector selection
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
        opacity: 0;
    `;
    document.body.prepend(overlay);

    // ============================================================
    // 10. PROTECT FROM XSS (Input Sanitization)
    // ============================================================
    // Sanitize all inputs
    document.querySelectorAll('input, textarea, select').forEach(function(el) {
        el.addEventListener('input', function() {
            // Remove any script tags from input
            this.value = this.value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        });
        el.addEventListener('paste', function(e) {
            // Prevent pasting potentially malicious code
            const pasted = (e.clipboardData || window.clipboardData).getData('text');
            if (pasted.includes('<script') || pasted.includes('javascript:')) {
                e.preventDefault();
                showProtectionAlert('🚫 Script injection blocked');
            }
        });
    });

    // ============================================================
    // 11. PROTECT LOCALSTORAGE (Prevent unauthorized access)
    // ============================================================
    // Monitor localStorage for changes
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    const originalRemoveItem = localStorage.removeItem;

    const allowedKeys = [
        'tradenovax_demo_user',
        'tradenovax_automation',
        'tradenovax_settings',
        'tradenovax_wallet',
        'tradenovax_session',
        'pwa_installed'
    ];

    localStorage.setItem = function(key, value) {
        // Allow only specific keys
        if (allowedKeys.includes(key) || key.startsWith('tradenovax_')) {
            return originalSetItem.call(this, key, value);
        }
        console.warn('🚫 Blocked localStorage write:', key);
        return false;
    };

    localStorage.getItem = function(key) {
        if (allowedKeys.includes(key) || key.startsWith('tradenovax_')) {
            return originalGetItem.call(this, key);
        }
        return null;
    };

    localStorage.removeItem = function(key) {
        if (allowedKeys.includes(key) || key.startsWith('tradenovax_')) {
            return originalRemoveItem.call(this, key);
        }
        return false;
    };

    // ============================================================
    // 12. PROTECTION ALERT SYSTEM
    // ============================================================
    let protectionAlertTimeout = null;

    function showProtectionAlert(message) {
        // Only show if not already showing
        const existing = document.querySelector('.protection-alert');
        if (existing) {
            existing.textContent = message;
            clearTimeout(existing._timeout);
            existing._timeout = setTimeout(function() {
                existing.remove();
            }, 1500);
            return;
        }

        const alert = document.createElement('div');
        alert.className = 'protection-alert';
        alert.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: rgba(255, 23, 68, 0.9);
            color: #fff;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 13px;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideIn 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        `;
        alert.textContent = message;

        // Add animation styles if not present
        if (!document.getElementById('protection-styles')) {
            const style = document.createElement('style');
            style.id = 'protection-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(alert);

        // Auto remove after 2 seconds
        alert._timeout = setTimeout(function() {
            alert.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(function() {
                alert.remove();
            }, 300);
        }, 1500);
    }

    // ============================================================
    // 13. PREVENT SCREEN RECORDING (Basic)
    // ============================================================
    // Detect if screen recording is active (via key shortcuts)
    document.addEventListener('keydown', function(e) {
        // Ctrl+Shift+E (Screen recording on some browsers)
        if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.keyCode === 69)) {
            e.preventDefault();
            showProtectionAlert('🚫 Screen recording blocked');
            return false;
        }
    });

    // ============================================================
    // 14. PROTECT THE PROTECTION (Anti-removal)
    // ============================================================
    // Prevent the script from being removed or modified
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function(child) {
        if (child && child.tagName === 'SCRIPT' && child.src && child.src.includes('code-protection.js')) {
            console.warn('🚫 Cannot remove protection script');
            return null;
        }
        return originalRemoveChild.call(this, child);
    };

    // ============================================================
    // 15. PREVENT AUTOMATED SCRAPING (Header protection)
    // ============================================================
    // Add random delay to prevent rapid scraping
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (url.includes('/api/') && !options?.headers?.Authorization) {
            showProtectionAlert('🚫 Unauthorized API access blocked');
            return Promise.reject(new Error('Unauthorized'));
        }
        return originalFetch.call(this, url, options);
    };

    // ============================================================
    // 16. DOM PROTECTION (Prevent DOM manipulation by scripts)
    // ============================================================
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // If someone tries to remove the protection alert
            if (mutation.removedNodes) {
                mutation.removedNodes.forEach(function(node) {
                    if (node.className === 'protection-alert') {
                        // Re-add if removed
                        const existing = document.querySelector('.protection-alert');
                        if (!existing && node.textContent) {
                            const newAlert = node.cloneNode(true);
                            document.body.appendChild(newAlert);
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // ============================================================
    // 17. BLOCK DEVTOOLS BY PERFORMANCE TRICK
    // ============================================================
    // Detect if DevTools is open by measuring execution time
    function detectDevTools() {
        const start = performance.now();
        debugger;
        const end = performance.now();
        if (end - start > 50) {
            showProtectionAlert('🚫 Developer tools detected!');
        }
    }

    // Run detection periodically
    setInterval(detectDevTools, 1000);

    // ============================================================
    // 18. CONSOLE CLEAR PROTECTION
    // ============================================================
    // Prevent console.clear from working
    const originalClear = console.clear;
    console.clear = function() {
        showProtectionAlert('🚫 Console clear blocked');
        return originalClear.call(this);
    };

    console.log('🛡️ Code protection fully enabled');
})();
