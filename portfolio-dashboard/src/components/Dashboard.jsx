// Dashboard.jsx - Main dashboard container component
import { useState, useEffect } from 'react';
import { Settings, RefreshCw, Download, Loader } from 'lucide-react';
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

export default function Dashboard() {
  const [positions, setPositions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [error, setError] = useState(null);

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

        return {
          ...pos,
          currentPrice,
          marketValue,
          totalGainLoss,
          totalGainLossPercent,
          dayChange: data.change,
          dayChangePercent: data.changePercent,
          beta: data.beta,
          marketCap: data.marketCap,
          dividendYield: data.dividendYield,
          sector: data.sector
        };
      });

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
      const metrics = calculateAllMetrics();
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
    if (positions.length === 0) {
      return {
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
        var: 0
      };
    }

    // For now, return simplified metrics
    // In a full implementation, you'd fetch historical data and calculate properly
    const portfolioBeta = calculations.calculatePortfolioBeta(positions);
    const concentration = calculations.calculateConcentration(positions);
    const weights = positions.map(p => p.weight);
    const herfindahlIndex = calculations.calculateHerfindahlIndex(weights);
    const totalValue = calculations.calculatePortfolioValue(positions);

    return {
      sharpe: 1.2, // Placeholder
      sortino: 1.5, // Placeholder
      beta: portfolioBeta,
      alpha: 0.02, // Placeholder
      rSquared: 0.85, // Placeholder
      infoRatio: 0.6, // Placeholder
      volatility: 0.18, // Placeholder
      maxDrawdown: 0.12, // Placeholder
      concentration,
      herfindahlIndex,
      var: totalValue * 0.02 // Simplified VaR
    };
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
  
  const metrics = calculateAllMetrics();
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
    volatility: metrics.volatility
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
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

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
