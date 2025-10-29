// aiService.js - Anthropic Claude API integration for portfolio insights
import Anthropic from '@anthropic-ai/sdk';

export const aiService = {
  async generateInsights(portfolioData, metrics, apiKey) {
    if (!apiKey) {
      throw new Error('API key not configured. Please add your Anthropic API key in settings.');
    }

    try {
      const anthropic = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const prompt = this.buildPrompt(portfolioData, metrics);

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      // Parse the JSON response
      const responseText = message.content[0].text;
      // Remove markdown code blocks if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const insights = JSON.parse(jsonText);

      return insights;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      throw new Error(`Failed to generate insights: ${error.message}`);
    }
  },

  buildPrompt(portfolioData, metrics) {
    return `You are a professional portfolio analyst. Analyze this investment portfolio and provide 5-7 actionable insights.

Portfolio Summary:
- Total Value: $${portfolioData.totalValue.toLocaleString()}
- Total Cost: $${portfolioData.totalCost.toLocaleString()}
- Total Gain/Loss: $${portfolioData.totalGainLoss.toLocaleString()} (${((portfolioData.totalGainLoss / portfolioData.totalCost) * 100).toFixed(2)}%)
- Number of Positions: ${portfolioData.positions.length}
- Top 3 Holdings: ${portfolioData.top3Holdings.map(h => `${h.ticker} (${h.weight.toFixed(1)}%)`).join(', ')}

Sector Allocation:
${Object.entries(portfolioData.sectorAllocation).map(([sector, weight]) => 
  `- ${sector}: ${weight.toFixed(1)}%`
).join('\n')}

Key Performance Metrics:
- Sharpe Ratio: ${metrics.sharpe.toFixed(2)}
- Sortino Ratio: ${metrics.sortino.toFixed(2)}
- Beta: ${metrics.beta.toFixed(2)}
- Alpha: ${(metrics.alpha * 100).toFixed(2)}%
- R-Squared: ${metrics.rSquared.toFixed(2)}
- Information Ratio: ${metrics.infoRatio.toFixed(2)}

Risk Metrics:
- Annualized Volatility: ${(metrics.volatility * 100).toFixed(2)}%
- Max Drawdown: ${(metrics.maxDrawdown * 100).toFixed(2)}%
- Portfolio Concentration (Top 3): ${metrics.concentration.toFixed(1)}%
- Herfindahl Index: ${metrics.herfindahlIndex.toFixed(3)}
- Value at Risk (95%): $${metrics.var.toLocaleString()}

Position Details:
${portfolioData.positions.map(pos => 
  `${pos.ticker}: ${pos.shares} shares @ $${pos.currentPrice.toFixed(2)} (${pos.weight.toFixed(1)}% of portfolio, ${pos.totalGainLossPercent.toFixed(1)}% return)`
).join('\n')}

Provide insights covering:
1. Risk assessment (is portfolio too risky, well-balanced, or too conservative?)
2. Concentration concerns (any positions too large? diversification issues?)
3. Diversification quality (sector correlation issues? missing diversification?)
4. Performance evaluation (how good are the Sharpe/Sortino/Alpha? what do they indicate?)
5. Specific actionable recommendations (what concrete actions should be taken?)

Format your response ONLY as a valid JSON array with no additional text before or after:
[
  {
    "category": "Risk|Concentration|Diversification|Performance|Recommendation",
    "severity": "high|medium|low",
    "title": "Brief insightful title (5-8 words)",
    "description": "Detailed explanation with specific numbers from the portfolio (2-3 sentences)",
    "action": "Specific, actionable recommendation (1-2 sentences)"
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown formatting, no additional text.`;
  }
};
