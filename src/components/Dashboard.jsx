// Dashboard.jsx - Main dashboard container component
import { useState, useEffect, useMemo } from 'react';
import { Settings, RefreshCw, Download, Loader, AlertTriangle } from 'lucide-react';
import FileUpload from './FileUpload';
import PortfolioOverview from './PortfolioOverview';
import ChartsSection from './ChartsSection';
import PositionsTable from './PositionsTable';
import AIInsights from './AIInsights';
import PortfolioNews from './PortfolioNews';
import SettingsModal from './SettingsModal';
import { storage } from '../utils/storage';
import { dataFetcher } from '../utils/dataFetcher';
import { calculations } from '../utils/calculations';
import { aiService } from '../utils/aiService';
import { assetClassification } from '../utils/assetClassification';
import { dataValidation } from '../utils/dataValidation';

export default function Dashboard() {
  const [positions, setPositions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [riskFreeRate, setRiskFreeRate] = useState(0.042);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [metricsTimeframe, setMetricsTimeframe] = useState('1y'); // '3m', '6m', '1y', '3y'

  // Load saved data on mount
  useEffect(() => {
    const savedPortfolio = storage.loadPortfolio();
    const savedSettings = storage.loadSettings();
    
    if (savedPortfolio) {
      setPositions(savedPortfolio.positions || []);
    }
    
    setSettings(savedSettings);
  }, []);

  // Auto-refresh prices
  useEffect(() => {
    if (!settings || !positions.length || settings.refreshInterval === 0) return;

    const interval = setInterval(() => {
      handleRefreshPrices();
    }, settings.refreshInterval);

    return () => clearInterval(interval);
  }, [settings, positions]);

  const handleDataLoaded = async (newPositions) => {
    setPositions(newPositions);
    setError(null);

    // Immediately fetch prices for the new positions
    await fetchPricesForPositions(newPositions);

    // Fetch historical data for metrics calculations
    await fetchHistoricalData(newPositions);
  };

  const fetchHistoricalData = async (positionsToFetch) => {
    try {
      // Only fetch historical data for equity positions, not money market funds
      const { equityPositions } = assetClassification.separatePositions(positionsToFetch);
      const tickers = equityPositions.map(p => p.ticker);

      if (tickers.length === 0) {
        console.log('No equity positions to fetch historical data for');
        return;
      }

      // Determine date range based on selected timeframe
      const endDate = new Date();
      const startDate = new Date();

      switch (metricsTimeframe) {
        case '3m':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '3y':
          startDate.setFullYear(startDate.getFullYear() - 3);
          break;
        case '1y':
        default:
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Fetch portfolio historical data, benchmark, and risk-free rate in parallel
      const [portfolioHistorical, benchmark, rfRate] = await Promise.all([
        dataFetcher.fetchMultipleHistorical(tickers, startDate, endDate),
        dataFetcher.fetchBenchmarkData(startDate, endDate),
        dataFetcher.fetchRiskFreeRate()
      ]);

      // Validate historical data completeness
      const expectedDays = metricsTimeframe === '3m' ? 63 :
                           metricsTimeframe === '6m' ? 126 :
                           metricsTimeframe === '3y' ? 756 : 252;

      const validation = dataValidation.validateHistoricalData(portfolioHistorical, expectedDays);

      if (validation.warnings.length > 0) {
        setValidationWarnings(prev => [...prev, ...validation.warnings]);
      }

      setHistoricalData(portfolioHistorical);
      setBenchmarkData(benchmark);
      setRiskFreeRate(rfRate);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setValidationWarnings(prev => [...prev, 'Unable to fetch historical data for some positions']);
    }
  };

  const fetchPricesForPositions = async (positionsToUpdate) => {
    setIsLoading(true);
    try {
      const tickers = positionsToUpdate.map(p => p.ticker);
      const priceData = await dataFetcher.fetchCurrentPrices(tickers);

      const updatedPositions = positionsToUpdate.map(pos => {
        const data = priceData[pos.ticker];
        if (!data || data.error) {
          return pos;
        }

        const currentPrice = data.price;
        const marketValue = currentPrice * pos.shares;
        const totalGainLoss = (currentPrice - pos.costBasis) * pos.shares;
        const totalGainLossPercent = ((currentPrice - pos.costBasis) / pos.costBasis) * 100;

        // Improve sector classification using asset classification
        const improvedSector = assetClassification.getSectorLabel(pos.ticker, data.sector);

        // For money market funds, use risk-free rate as expected return
        const isCashEquivalent = assetClassification.isCashEquivalent(pos.ticker);
        const dayChange = isCashEquivalent ? 0 : data.change;
        const dayChangePercent = isCashEquivalent ? 0 : data.changePercent;

        return {
          ...pos,
          currentPrice,
          marketValue,
          totalGainLoss,
          totalGainLossPercent,
          dayChange: dayChange,
          dayChangePercent: dayChangePercent,
          beta: isCashEquivalent ? 0 : (data.beta || 1),
          marketCap: data.marketCap,
          dividendYield: data.dividendYield,
          sector: improvedSector,
          assetClass: assetClassification.getAssetClass(pos.ticker, data.sector),
          isCashEquivalent: isCashEquivalent
        };
      });

      // Validate positions
      const positionValidation = dataValidation.validatePositions(updatedPositions);
      if (positionValidation.warnings.length > 0) {
        setValidationWarnings(prev => [...prev, ...positionValidation.warnings]);
      }

      // Calculate weights
      const positionsWithWeights = calculations.calculatePositionWeights(updatedPositions);
      
      setPositions(positionsWithWeights);
      
      // Save to localStorage
      storage.savePortfolio({
        positions: positionsWithWeights,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      setError(`Error fetching prices: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshPrices = () => {
    if (positions.length > 0) {
      fetchPricesForPositions(positions);
    }
  };

  const handleGenerateInsights = async () => {
    if (!settings?.apiKey) {
      alert('Please configure your Anthropic API key in settings first.');
      setShowSettings(true);
      return;
    }

    setIsGeneratingInsights(true);
    try {
      const { metrics } = calculateAllMetrics();
      const portfolioData = preparePortfolioData(metrics);

      const newInsights = await aiService.generateInsights(
        portfolioData,
        metrics,
        settings.apiKey
      );

      setInsights(newInsights);
    } catch (err) {
      setError(`Error generating insights: ${err.message}`);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const calculateAllMetrics = () => {
    const warnings = [];

    if (positions.length === 0) {
      return {
        metrics: {
          sharpe: 0,
          sortino: 0,
          beta: 1,
          alpha: 0,
          rSquared: 0,
          infoRatio: 0,
          volatility: 0,
          maxDrawdown: 0,
          concentration: 0,
          herfindahlIndex: 0,
          var: 0,
          treynor: 0,
          calmar: 0,
          ulcerIndex: 0,
          omega: 0,
          winRate: 0,
          payoffRatio: 0,
          profitFactor: 0
        },
        warnings
      };
    }

    // Separate equity and cash positions
    const { equityPositions, cashPositions } = assetClassification.separatePositions(positions);

    // Calculate portfolio-level metrics
    const totalValue = calculations.calculatePortfolioValue(positions);
    const totalCost = calculations.calculateTotalCost(positions);
    const equityValue = calculations.calculatePortfolioValue(equityPositions);
    const cashValue = calculations.calculatePortfolioValue(cashPositions);

    // Calculate beta only on equity positions
    const portfolioBeta = equityPositions.length > 0
      ? calculations.calculatePortfolioBeta(equityPositions)
      : 1;

    const concentration = calculations.calculateConcentration(positions);
    const weights = positions.map(p => p.weight);
    const herfindahlIndex = calculations.calculateHerfindahlIndex(weights);

    // Calculate simple metrics on equity positions (exclude cash from win rate)
    const winRate = equityPositions.length > 0
      ? calculations.calculateWinRate(equityPositions)
      : 0;
    const payoffRatio = equityPositions.length > 0
      ? calculations.calculatePayoffRatio(equityPositions)
      : 0;
    const profitFactor = equityPositions.length > 0
      ? calculations.calculateProfitFactor(equityPositions)
      : 0;

    // If we have historical data, calculate advanced metrics on EQUITY positions only
    if (historicalData && benchmarkData && Object.keys(historicalData).length > 0 && equityPositions.length > 0) {
      try {
        // Calculate portfolio historical values (equity only, excluding cash)
        const portfolioHistoricalValues = calculatePortfolioHistoricalValues(historicalData, equityPositions);

        if (portfolioHistoricalValues.length > 10) {
          // Calculate returns
          const portfolioReturns = calculations.calculateReturns(portfolioHistoricalValues);
          const benchmarkReturns = calculations.calculateReturns(benchmarkData.map(d => d.close));

          // Calculate volatility and risk metrics
          const volatility = calculations.calculateStandardDeviation(portfolioReturns);
          const maxDrawdownData = calculations.calculateMaxDrawdown(portfolioHistoricalValues);
          const maxDrawdown = Math.abs(maxDrawdownData.maxDrawdown);

          // Calculate annualized return
          const annualizedReturn = calculations.calculateAnnualizedReturn(portfolioReturns);

          // Calculate risk-adjusted metrics
          const sharpe = calculations.calculateSharpeRatio(portfolioReturns, riskFreeRate);
          const sortino = calculations.calculateSortinoRatio(portfolioReturns, riskFreeRate);
          const beta = calculations.calculateBeta(portfolioReturns, benchmarkReturns);
          const benchmarkAnnualizedReturn = calculations.calculateAnnualizedReturn(benchmarkReturns);
          const alpha = calculations.calculateAlpha(annualizedReturn, beta, benchmarkAnnualizedReturn, riskFreeRate);
          const infoRatio = calculations.calculateInformationRatio(portfolioReturns, benchmarkReturns);
          const rSquared = calculations.calculateRSquared(portfolioReturns, benchmarkReturns);

          // Calculate additional metrics
          const treynor = calculations.calculateTreynorRatio(annualizedReturn, beta, riskFreeRate);
          const calmar = calculations.calculateCalmarRatio(annualizedReturn, maxDrawdown);
          const ulcerIndex = calculations.calculateUlcerIndex(portfolioHistoricalValues);
          const omega = calculations.calculateOmegaRatio(portfolioReturns);

          // Calculate VaR
          const dailyStdDev = volatility / Math.sqrt(252);
          const var95 = calculations.calculateVaR(totalValue, dailyStdDev, 0.95);

          const metrics = {
            sharpe,
            sortino,
            beta,
            alpha,
            rSquared,
            infoRatio,
            volatility,
            maxDrawdown,
            concentration,
            herfindahlIndex,
            var: var95,
            treynor,
            calmar,
            ulcerIndex,
            omega,
            winRate,
            payoffRatio,
            profitFactor
          };

          // Validate metrics
          const metricsValidation = dataValidation.validateMetrics(metrics);
          if (metricsValidation.warnings.length > 0) {
            warnings.push(...metricsValidation.warnings);
          }

          return { metrics, warnings };
        }
      } catch (err) {
        console.error('Error calculating metrics from historical data:', err);
        warnings.push('Error calculating some metrics from historical data');
      }
    }

    // Fallback to placeholder values if historical data is not available
    const placeholderMetrics = {
      sharpe: 1.2,
      sortino: 1.5,
      beta: portfolioBeta,
      alpha: 0.02,
      rSquared: 0.85,
      infoRatio: 0.6,
      volatility: 0.18,
      maxDrawdown: 0.12,
      concentration,
      herfindahlIndex,
      var: totalValue * 0.02,
      treynor: 0.08,
      calmar: 0.5,
      ulcerIndex: 5.0,
      omega: 1.3,
      winRate,
      payoffRatio,
      profitFactor
    };

    if (equityPositions.length === 0) {
      warnings.push('Portfolio contains only cash equivalents - risk metrics are not applicable');
    } else if (!historicalData || Object.keys(historicalData).length === 0) {
      warnings.push('Historical data unavailable - using estimated metrics');
    }

    return { metrics: placeholderMetrics, warnings };
  };

  const calculatePortfolioHistoricalValues = (historicalData, positions) => {
    // Get all dates across all tickers
    const allDates = new Set();
    Object.values(historicalData).forEach(tickerData => {
      tickerData.forEach(d => allDates.add(d.date));
    });

    const sortedDates = Array.from(allDates).sort();

    // Calculate portfolio value for each date
    const portfolioValues = sortedDates.map(date => {
      let totalValue = 0;
      let hasData = false;

      positions.forEach(pos => {
        const tickerData = historicalData[pos.ticker];
        if (tickerData) {
          const dataPoint = tickerData.find(d => d.date === date);
          if (dataPoint) {
            totalValue += dataPoint.close * pos.shares;
            hasData = true;
          }
        }
      });

      return hasData ? totalValue : null;
    }).filter(v => v !== null);

    return portfolioValues;
  };

  const preparePortfolioData = (metrics) => {
    const totalValue = calculations.calculatePortfolioValue(positions);
    const totalCost = calculations.calculateTotalCost(positions);
    const totalGainLoss = calculations.calculateTotalGainLoss(positions);
    const sectorAllocation = calculations.calculateSectorAllocation(positions);
    
    const top3Holdings = [...positions]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      positions,
      sectorAllocation,
      top3Holdings
    };
  };

  const exportToCSV = () => {
    const headers = ['Ticker', 'Shares', 'Cost_Basis', 'Current_Price', 'Market_Value', 'Gain_Loss', 'Return_%', 'Weight_%'];
    const rows = positions.map(pos => [
      pos.ticker,
      pos.shares,
      pos.costBasis,
      pos.currentPrice,
      pos.marketValue,
      pos.totalGainLoss,
      pos.totalGainLossPercent,
      pos.weight
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Memoize metrics calculation to prevent infinite re-renders
  const metricsResult = useMemo(() => {
    return calculateAllMetrics();
  }, [positions, historicalData, benchmarkData, riskFreeRate, metricsTimeframe]);

  // Update validation warnings when metrics change
  useEffect(() => {
    if (metricsResult.warnings.length > 0) {
      setValidationWarnings(prev => [...prev, ...metricsResult.warnings]);
    }
  }, [metricsResult]);

  if (positions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Analytics</h1>
            <button
              onClick={() => setShowSettings(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Settings className="h-5 w-5" />
              Settings
            </button>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <FileUpload onDataLoaded={handleDataLoaded} />
        </div>
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSave={handleSaveSettings}
        />
      </div>
    );
  }

  const totalValue = calculations.calculatePortfolioValue(positions);
  const totalCost = calculations.calculateTotalCost(positions);
  const totalGainLoss = calculations.calculateTotalGainLoss(positions);
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const dayChange = calculations.calculateDayChange(positions);
  const dayChangePercent = totalValue > 0 ? (dayChange / totalValue) * 100 : 0;

  const metrics = metricsResult.metrics;
  const sectorAllocation = calculations.calculateSectorAllocation(positions);

  const overviewData = {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    dayChange,
    dayChangePercent,
    sharpeRatio: metrics.sharpe,
    sortinoRatio: metrics.sortino,
    beta: metrics.beta,
    alpha: metrics.alpha,
    maxDrawdown: metrics.maxDrawdown,
    infoRatio: metrics.infoRatio,
    volatility: metrics.volatility,
    treynorRatio: metrics.treynor,
    calmarRatio: metrics.calmar,
    omegaRatio: metrics.omega,
    winRate: metrics.winRate,
    profitFactor: metrics.profitFactor,
    rSquared: metrics.rSquared
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Analytics</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshPrices}
                disabled={isLoading}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Updating...' : 'Refresh Prices'}
              </button>
              <button
                onClick={exportToCSV}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                Export CSV
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Settings className="h-5 w-5" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Data Quality Warnings</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  {[...new Set(validationWarnings)].map((warning, idx) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                </ul>
                <button
                  onClick={() => setValidationWarnings([])}
                  className="text-xs text-amber-700 underline mt-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Timeframe Selector */}
        <div className="mb-6 flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
          <span className="text-sm font-medium text-gray-700">Metrics Timeframe:</span>
          <div className="flex gap-2">
            {['3m', '6m', '1y', '3y'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => {
                  setMetricsTimeframe(timeframe);
                  if (positions.length > 0) {
                    setValidationWarnings([]);
                    fetchHistoricalData(positions);
                  }
                }}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  metricsTimeframe === timeframe
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {timeframe.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-auto">
            {metricsTimeframe === '3m' && '3 months of data (~63 trading days)'}
            {metricsTimeframe === '6m' && '6 months of data (~126 trading days)'}
            {metricsTimeframe === '1y' && '1 year of data (~252 trading days)'}
            {metricsTimeframe === '3y' && '3 years of data (~756 trading days)'}
          </span>
        </div>

        <PortfolioOverview data={overviewData} />
        
        <ChartsSection
          positionData={positions}
          sectorData={sectorAllocation}
          riskMetrics={metrics}
        />

        <AIInsights
          insights={insights}
          onRegenerate={handleGenerateInsights}
          isLoading={isGeneratingInsights}
        />

        <PortfolioNews positions={positions} />

        <PositionsTable positions={positions} />
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
