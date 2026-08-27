// ============================================================
// TRADENOVAX - DCIRCLES ANALYSIS TOOL
// ============================================================
 
const DCIRCLES_INDICES = [
    'R_10', 'R_25', 'R_50', 'R_75', 'R_100',
    'R_10_1S', 'R_25_1S', 'R_50_1S', 'R_75_1S', 'R_100_1S'
]

async function analyzeDcircles(symbol, ticks = 120) {
    try {
        const prices = await window.strategies.getHistoricalPrices(symbol, ticks)
        if (prices.length === 0) return null

        // Calculate digit distribution
        const digits = prices.map(p => Math.floor(p) % 10)
        const distribution = Array(10).fill(0)
        digits.forEach(d => distribution[d]++)
        
        const percentages = distribution.map(count => (count / digits.length) * 100)

        // Calculate Even/Odd
        const evenCount = digits.filter(d => d % 2 === 0).length
        const oddCount = digits.length - evenCount

        // Calculate Rise/Fall
        let rises = 0, falls = 0
        for (let i = 1; i < prices.length; i++) {
            if (prices[i] > prices[i-1]) rises++
            else if (prices[i] < prices[i-1]) falls++
        }

        // Calculate Over/Under 4
        const over4Count = digits.filter(d => d > 4).length
        const under5Count = digits.filter(d => d < 5).length

        return {
            symbol,
            ticks,
            currentPrice: prices[prices.length - 1],
            distribution,
            percentages,
            evenPercent: (evenCount / digits.length) * 100,
            oddPercent: (oddCount / digits.length) * 100,
            risePercent: (rises / (prices.length - 1)) * 100,
            fallPercent: (falls / (prices.length - 1)) * 100,
            over4Percent: (over4Count / digits.length) * 100,
            under5Percent: (under5Count / digits.length) * 100,
            lastDigits: digits.slice(-10)
        }
    } catch (error) {
        console.error('Dcircles error:', error)
        return null
    }
}

function renderDcircles(data) {
    if (!data) return '<div class="error">Failed to analyze data</div>'
    
    const digits = data.distribution.map((count, i) => 
        `${i}: ${(count / data.ticks * 100).toFixed(1)}%`
    ).join(' ')

    const lastDigits = data.lastDigits.join(' ')

    return `
        <div class="dcircles-container">
            <div class="dcircles-header">
                <span class="dcircles-symbol">${data.symbol}</span>
                <span class="dcircles-price">${data.currentPrice.toFixed(2)}</span>
            </div>
            <div class="dcircles-digits">
                ${data.distribution.map((count, i) => `
                    <div class="digit-bar">
                        <span class="digit-label">${i}</span>
                        <div class="bar" style="height: ${(count / data.ticks * 100)}%"></div>
                        <span class="digit-percent">${(count / data.ticks * 100).toFixed(1)}%</span>
                    </div>
                `).join('')}
            </div>
            <div class="dcircles-stats">
                <span>Even: ${data.evenPercent.toFixed(1)}%</span>
                <span>Odd: ${data.oddPercent.toFixed(1)}%</span>
                <span>Rise: ${data.risePercent.toFixed(1)}%</span>
                <span>Fall: ${data.fallPercent.toFixed(1)}%</span>
                <span>Over 4: ${data.over4Percent.toFixed(1)}%</span>
                <span>Under 5: ${data.under5Percent.toFixed(1)}%</span>
            </div>
            <div class="dcircles-last">
                Last 10: ${lastDigits}
            </div>
        </div>
    `
}

// ============================================================
// EXPORTS
// ============================================================

window.dcircles = {
    DCIRCLES_INDICES,
    analyzeDcircles,
    renderDcircles
}

console.log('🔵 Dcircles module loaded')
