// calculations.js - All portfolio metric calculations
import * as math from 'mathjs';

export const calculations = {
  // ==================== PORTFOLIO-LEVEL METRICS ====================
  
  calculatePortfolioValue(positions) {
    return positions.reduce((sum, pos) => sum + (pos.currentPrice * pos.shares), 0);
  },

  calculateTotalCost(positions) {
    return positions.reduce((sum, pos) => sum + (pos.costBasis * pos.shares), 0);
  },

  calculateTotalGainLoss(positions) {
    return positions.reduce((sum, pos) => {
      const gainLoss = (pos.currentPrice - pos.costBasis) * pos.shares;
      return sum + gainLoss;
    }, 0);
  },

  calculateDayChange(positions) {
    return positions.reduce((sum, pos) => sum + (pos.dayChange * pos.shares), 0);
  },

  calculatePositionWeights(positions) {
    const totalValue = this.calculatePortfolioValue(positions);
    return positions.map(pos => ({
      ...pos,
      weight: totalValue > 0 ? ((pos.currentPrice * pos.shares) / totalValue) * 100 : 0
    }));
  },

  // ==================== RETURN METRICS ====================

  calculateReturns(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    return returns;
  },

  calculateCAGR(beginningValue, endingValue, years) {
    if (beginningValue <= 0 || years <= 0) return 0;
    return Math.pow(endingValue / beginningValue, 1 / years) - 1;
  },

  calculateAnnualizedReturn(returns) {
    if (returns.length === 0) return 0;
    
    const geometricMean = this.calculateGeometricMean(returns);
    // Annualize assuming daily returns
    return Math.pow(1 + geometricMean, 252) - 1;
  },

  calculateGeometricMean(values) {
    if (values.length === 0) return 0;
    
    const product = values.reduce((prod, val) => prod * (1 + val), 1);
    return Math.pow(product, 1 / values.length) - 1;
  },

  // ==================== VOLATILITY METRICS ====================

  calculateStandardDeviation(returns) {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / (returns.length - 1);
    
    // Annualize: multiply by sqrt(252) for daily returns
    return Math.sqrt(variance) * Math.sqrt(252);
  },

  calculateDownsideDeviation(returns, threshold = 0) {
    const downsideReturns = returns.filter(r => r < threshold);
    if (downsideReturns.length < 2) return 0;
    
    const mean = downsideReturns.reduce((sum, r) => sum + r, 0) / downsideReturns.length;
    const squaredDiffs = downsideReturns.map(r => Math.pow(r - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / (downsideReturns.length - 1);
    
    // Annualize
    return Math.sqrt(variance) * Math.sqrt(252);
  },

  calculateMaxDrawdown(historicalValues) {
    if (historicalValues.length < 2) return { maxDrawdown: 0, peak: null, trough: null };
    
    let maxDrawdown = 0;
    let peak = historicalValues[0];
    let peakIndex = 0;
    let troughIndex = 0;
    
    for (let i = 1; i < historicalValues.length; i++) {
      if (historicalValues[i] > peak) {
        peak = historicalValues[i];
        peakIndex = i;
      }
      
      const drawdown = (historicalValues[i] - peak) / peak;
      if (drawdown < maxDrawdown) {
        maxDrawdown = drawdown;
        troughIndex = i;
      }
    }
    
    return {
      maxDrawdown,
      peakIndex,
      troughIndex,
      peak,
      trough: historicalValues[troughIndex]
    };
  },

  // ==================== RISK-ADJUSTED METRICS ====================

  calculateSharpeRatio(returns, riskFreeRate) {
    if (returns.length < 2) return 0;
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = this.calculateStandardDeviation(returns) / Math.sqrt(252); // De-annualize first
    
    if (stdDev === 0) return 0;
    
    // Annualize the Sharpe ratio
    return ((avgReturn * 252) - riskFreeRate) / (stdDev * Math.sqrt(252));
  },

  calculateSortinoRatio(returns, riskFreeRate) {
    if (returns.length < 2) return 0;
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const downsideDeviation = this.calculateDownsideDeviation(returns) / Math.sqrt(252);
    
    if (downsideDeviation === 0) return 0;
    
    return ((avgReturn * 252) - riskFreeRate) / (downsideDeviation * Math.sqrt(252));
  },

  calculateBeta(portfolioReturns, marketReturns) {
    if (portfolioReturns.length < 2 || marketReturns.length < 2) return 1;
    
    // Ensure same length
    const minLength = Math.min(portfolioReturns.length, marketReturns.length);
    const portReturns = portfolioReturns.slice(0, minLength);
    const mktReturns = marketReturns.slice(0, minLength);
    
    // Calculate covariance and variance
    const portMean = portReturns.reduce((sum, r) => sum + r, 0) / portReturns.length;
    const mktMean = mktReturns.reduce((sum, r) => sum + r, 0) / mktReturns.length;
    
    let covariance = 0;
    let mktVariance = 0;
    
    for (let i = 0; i < portReturns.length; i++) {
      covariance += (portReturns[i] - portMean) * (mktReturns[i] - mktMean);
      mktVariance += Math.pow(mktReturns[i] - mktMean, 2);
    }
    
    covariance /= (portReturns.length - 1);
    mktVariance /= (mktReturns.length - 1);
    
    return mktVariance !== 0 ? covariance / mktVariance : 1;
  },

  calculateAlpha(portfolioReturn, beta, marketReturn, riskFreeRate) {
    return portfolioReturn - (riskFreeRate + beta * (marketReturn - riskFreeRate));
  },

  calculatePortfolioBeta(positions) {
    const positionsWithWeights = this.calculatePositionWeights(positions);
    return positionsWithWeights.reduce((sum, pos) => {
      return sum + (pos.weight / 100) * (pos.beta || 1);
    }, 0);
  },

  // ==================== DIVERSIFICATION METRICS ====================

  calculateConcentration(positions) {
    const positionsWithWeights = this.calculatePositionWeights(positions)
      .sort((a, b) => b.weight - a.weight);
    
    return positionsWithWeights.slice(0, 3).reduce((sum, pos) => sum + pos.weight, 0);
  },

  calculateHerfindahlIndex(weights) {
    return weights.reduce((sum, weight) => sum + Math.pow(weight / 100, 2), 0);
  },

  calculateCorrelationMatrix(returnsData) {
    const tickers = Object.keys(returnsData);
    const matrix = [];
    
    for (const ticker1 of tickers) {
      const row = [];
      for (const ticker2 of tickers) {
        const correlation = this.calculateCorrelation(
          returnsData[ticker1],
          returnsData[ticker2]
        );
        row.push(correlation);
      }
      matrix.push(row);
    }
    
    return { tickers, matrix };
  },

  calculateCorrelation(returns1, returns2) {
    if (returns1.length < 2 || returns2.length < 2) return 0;
    
    const minLength = Math.min(returns1.length, returns2.length);
    const r1 = returns1.slice(0, minLength);
    const r2 = returns2.slice(0, minLength);
    
    const mean1 = r1.reduce((sum, val) => sum + val, 0) / r1.length;
    const mean2 = r2.reduce((sum, val) => sum + val, 0) / r2.length;
    
    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;
    
    for (let i = 0; i < r1.length; i++) {
      const diff1 = r1[i] - mean1;
      const diff2 = r2[i] - mean2;
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    return denominator !== 0 ? numerator / denominator : 0;
  },

  // ==================== MARKET COMPARISON ====================

  calculateInformationRatio(portfolioReturns, benchmarkReturns) {
    if (portfolioReturns.length < 2) return 0;
    
    const trackingError = this.calculateTrackingError(portfolioReturns, benchmarkReturns);
    if (trackingError === 0) return 0;
    
    const avgPortReturn = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    const avgBenchReturn = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length;
    
    return ((avgPortReturn - avgBenchReturn) * 252) / trackingError;
  },

  calculateTrackingError(portfolioReturns, benchmarkReturns) {
    if (portfolioReturns.length < 2) return 0;
    
    const minLength = Math.min(portfolioReturns.length, benchmarkReturns.length);
    const differences = [];
    
    for (let i = 0; i < minLength; i++) {
      differences.push(portfolioReturns[i] - benchmarkReturns[i]);
    }
    
    return this.calculateStandardDeviation(differences);
  },

  calculateRSquared(portfolioReturns, marketReturns) {
    const correlation = this.calculateCorrelation(portfolioReturns, marketReturns);
    return correlation * correlation;
  },

  // ==================== RISK METRICS ====================

  calculateVaR(portfolioValue, dailyStdDev, confidenceLevel = 0.95) {
    const zScores = {
      0.90: 1.28,
      0.95: 1.65,
      0.99: 2.33
    };
    
    const zScore = zScores[confidenceLevel] || 1.65;
    return zScore * portfolioValue * dailyStdDev;
  },

  calculateCVaR(returns, confidenceLevel = 0.95) {
    if (returns.length === 0) return 0;
    
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const cutoffIndex = Math.floor((1 - confidenceLevel) * sortedReturns.length);
    const worstReturns = sortedReturns.slice(0, cutoffIndex);
    
    if (worstReturns.length === 0) return 0;
    
    return worstReturns.reduce((sum, r) => sum + r, 0) / worstReturns.length;
  },

  // ==================== SECTOR ALLOCATION ====================

  calculateSectorAllocation(positions) {
    const sectors = {};
    const totalValue = this.calculatePortfolioValue(positions);
    
    positions.forEach(pos => {
      const sector = pos.sector || 'Unknown';
      const value = pos.currentPrice * pos.shares;
      
      if (!sectors[sector]) {
        sectors[sector] = 0;
      }
      sectors[sector] += (value / totalValue) * 100;
    });
    
    return sectors;
  },

  // ==================== OTHER METRICS ====================

  calculateWeightedMarketCap(positions) {
    const positionsWithWeights = this.calculatePositionWeights(positions);
    return positionsWithWeights.reduce((sum, pos) => {
      return sum + (pos.weight / 100) * (pos.marketCap || 0);
    }, 0);
  },

  calculateAverageDaysHeld(positions) {
    const now = new Date();
    const daysHeld = positions.map(pos => {
      const purchaseDate = new Date(pos.purchaseDate);
      const diffTime = Math.abs(now - purchaseDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });
    
    return daysHeld.reduce((sum, days) => sum + days, 0) / daysHeld.length;
  },

  calculateDividendYield(positions) {
    const positionsWithWeights = this.calculatePositionWeights(positions);
    return positionsWithWeights.reduce((sum, pos) => {
      return sum + (pos.weight / 100) * (pos.dividendYield || 0);
    }, 0);
  },

  // ==================== ADDITIONAL RISK-ADJUSTED METRICS ====================

  calculateTreynorRatio(portfolioReturn, beta, riskFreeRate) {
    if (beta === 0) return 0;
    return (portfolioReturn - riskFreeRate) / beta;
  },

  calculateCalmarRatio(annualizedReturn, maxDrawdown) {
    if (maxDrawdown === 0) return 0;
    return annualizedReturn / Math.abs(maxDrawdown);
  },

  calculateUlcerIndex(historicalValues) {
    if (historicalValues.length < 2) return 0;

    let sumSquaredDrawdowns = 0;
    let peak = historicalValues[0];

    for (let i = 0; i < historicalValues.length; i++) {
      if (historicalValues[i] > peak) {
        peak = historicalValues[i];
      }

      const drawdown = ((historicalValues[i] - peak) / peak) * 100;
      sumSquaredDrawdowns += drawdown * drawdown;
    }

    return Math.sqrt(sumSquaredDrawdowns / historicalValues.length);
  },

  calculateOmegaRatio(returns, threshold = 0) {
    if (returns.length === 0) return 0;

    let gainsSum = 0;
    let lossesSum = 0;

    returns.forEach(r => {
      const excess = r - threshold;
      if (excess > 0) {
        gainsSum += excess;
      } else {
        lossesSum += Math.abs(excess);
      }
    });

    return lossesSum === 0 ? (gainsSum > 0 ? Infinity : 0) : gainsSum / lossesSum;
  },

  calculateWinRate(positions) {
    if (positions.length === 0) return 0;

    const profitablePositions = positions.filter(pos =>
      (pos.currentPrice - pos.costBasis) > 0
    ).length;

    return (profitablePositions / positions.length) * 100;
  },

  calculateExpectedReturn(positions) {
    const totalValue = this.calculatePortfolioValue(positions);
    if (totalValue === 0) return 0;

    return positions.reduce((sum, pos) => {
      const positionValue = pos.currentPrice * pos.shares;
      const weight = positionValue / totalValue;
      const expectedReturn = ((pos.currentPrice - pos.costBasis) / pos.costBasis);
      return sum + (weight * expectedReturn);
    }, 0);
  },

  calculatePayoffRatio(positions) {
    if (positions.length === 0) return 0;

    const winners = positions.filter(pos => (pos.currentPrice - pos.costBasis) > 0);
    const losers = positions.filter(pos => (pos.currentPrice - pos.costBasis) < 0);

    if (winners.length === 0 || losers.length === 0) return 0;

    const avgWin = winners.reduce((sum, pos) =>
      sum + ((pos.currentPrice - pos.costBasis) / pos.costBasis), 0) / winners.length;

    const avgLoss = Math.abs(losers.reduce((sum, pos) =>
      sum + ((pos.currentPrice - pos.costBasis) / pos.costBasis), 0) / losers.length);

    return avgLoss === 0 ? 0 : avgWin / avgLoss;
  },

  calculateProfitFactor(positions) {
    if (positions.length === 0) return 0;

    let grossProfit = 0;
    let grossLoss = 0;

    positions.forEach(pos => {
      const gainLoss = (pos.currentPrice - pos.costBasis) * pos.shares;
      if (gainLoss > 0) {
        grossProfit += gainLoss;
      } else {
        grossLoss += Math.abs(gainLoss);
      }
    });

    return grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss;
  }
};
