// ============================================================
// TRADENOVAX - AI SCANNER
// ============================================================

const SCANNER_MARKETS = [ 
    { symbol: 'R_100', name: 'Volatility 100 Index' },
    { symbol: 'R_75', name: 'Volatility 75 Index' },
    { symbol: 'R_50', name: 'Volatility 50 Index' },
    { symbol: 'R_25', name: 'Volatility 25 Index' },
    { symbol: 'R_10', name: 'Volatility 10 Index' }
]

async function runAIScanner() {
    const results = []
    const scanBtn = document.getElementById('scanBtn')
    const scanStatus = document.getElementById('scanStatus')
    
    if (scanBtn) {
        scanBtn.textContent = '⏳ Scanning...'
        scanBtn.disabled = true
    }

    for (const market of SCANNER_MARKETS) {
        try {
            const analysis = await window.dcircles.analyzeDcircles(market.symbol, 120)
            if (analysis) {
                // Determine signal
                let signal = 'WAIT'
                let confidence = 0
                let prediction = ''

                if (analysis.evenPercent >= 60) {
                    signal = 'BUY'
                    confidence = analysis.evenPercent
                    prediction = 'Even'
                } else if (analysis.oddPercent >= 60) {
                    signal = 'BUY'
                    confidence = analysis.oddPercent
                    prediction = 'Odd'
                } else if (analysis.risePercent >= 60) {
                    signal = 'BUY'
                    confidence = analysis.risePercent
                    prediction = 'Rise'
                } else if (analysis.fallPercent >= 60) {
                    signal = 'BUY'
                    confidence = analysis.fallPercent
                    prediction = 'Fall'
                }

                results.push({
                    market: market.name,
                    symbol: market.symbol,
                    signal,
                    confidence: Math.round(confidence),
                    prediction,
                    price: analysis.currentPrice,
                    even: Math.round(analysis.evenPercent),
                    odd: Math.round(analysis.oddPercent),
                    rise: Math.round(analysis.risePercent),
                    fall: Math.round(analysis.fallPercent)
                })
            }
        } catch (error) {
            console.error(`Scan error for ${market.symbol}:`, error)
        }
    }

    if (scanBtn) {
        scanBtn.textContent = '🔄 Scan Again'
        scanBtn.disabled = false
    }

    if (scanStatus) {
        scanStatus.textContent = `✅ Scanned ${results.length} markets`
        scanStatus.style.color = 'var(--green)'
    }

    renderScannerResults(results)
    return results
}

function renderScannerResults(results) {
    const container = document.getElementById('scannerResults')
    if (!container) return

    if (results.length === 0) {
        container.innerHTML = '<div class="scan-empty">No signals detected</div>'
        return
    }

    let html = '<div class="scan-results-grid">'
    results.forEach(r => {
        const signalColor = r.signal === 'BUY' ? 'var(--green)' : 
                           r.signal === 'SELL' ? 'var(--red)' : 'var(--gold)'
        html += `
            <div class="scan-result">
                <div class="scan-market">${r.market}</div>
                <div class="scan-price">$${r.price.toFixed(2)}</div>
                <div class="scan-signal" style="color: ${signalColor}">
                    ${r.signal} ${r.prediction}
                </div>
                <div class="scan-confidence">Confidence: ${r.confidence}%</div>
                <div class="scan-stats">
                    <span>E:${r.even}% O:${r.odd}%</span>
                    <span>R:${r.rise}% F:${r.fall}%</span>
                </div>
            </div>
        `
    })
    html += '</div>'
    container.innerHTML = html
}

// ============================================================
// EXPORTS
// ============================================================

window.scanner = {
    SCANNER_MARKETS,
    runAIScanner,
    renderScannerResults
}

console.log('🔍 Scanner module loaded')
