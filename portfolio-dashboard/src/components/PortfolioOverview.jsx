// PortfolioOverview.jsx - Summary cards showing key portfolio metrics
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, AlertTriangle, Gauge } from 'lucide-react';

export default function PortfolioOverview({ data }) {
  const {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    dayChange,
    dayChangePercent,
    sharpeRatio,
    sortinoRatio,
    beta,
    alpha,
    maxDrawdown,
    infoRatio,
    volatility
  } = data;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getRatingText = (sharpe) => {
    if (sharpe >= 2) return 'Excellent';
    if (sharpe >= 1.5) return 'Very Good';
    if (sharpe >= 1) return 'Good';
    if (sharpe >= 0.5) return 'Fair';
    return 'Needs Improvement';
  };

  const getBetaText = (beta) => {
    if (beta > 1.2) return 'High volatility';
    if (beta > 0.8) return 'Market-like';
    return 'Low volatility';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Row 1: Primary Metrics */}
      {/* Total Value Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Total Value</h3>
          <DollarSign className="h-5 w-5 text-blue-600" />
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(totalValue)}
        </p>
        <div className={`text-sm mt-2 flex items-center ${
          dayChange >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {dayChange >= 0 ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          <span>
            {formatCurrency(Math.abs(dayChange))} ({formatPercent(dayChangePercent)}) today
          </span>
        </div>
      </div>

      {/* Total Gain/Loss Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Total Gain/Loss</h3>
          <Activity className="h-5 w-5 text-purple-600" />
        </div>
        <p className={`text-3xl font-bold ${
          totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {formatCurrency(Math.abs(totalGainLoss))}
        </p>
        <div className={`text-sm mt-2 ${
          totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="font-medium">
            {formatPercent(totalGainLossPercent)}
          </span>
          <span className="text-gray-600 ml-2">
            on {formatCurrency(totalCost)} invested
          </span>
        </div>
      </div>

      {/* Sharpe Ratio Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Sharpe Ratio</h3>
          <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-amber-600 text-xs font-bold">S</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {sharpeRatio.toFixed(2)}
        </p>
        <div className="text-sm mt-2">
          <span className={`font-medium ${
            sharpeRatio >= 1.5 ? 'text-green-600' :
            sharpeRatio >= 1 ? 'text-blue-600' :
            sharpeRatio >= 0.5 ? 'text-amber-600' :
            'text-red-600'
          }`}>
            {getRatingText(sharpeRatio)}
          </span>
          <span className="text-gray-600 ml-2">risk-adjusted return</span>
        </div>
      </div>

      {/* Portfolio Beta Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Portfolio Beta</h3>
          <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 text-xs font-bold">β</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {beta.toFixed(2)}
        </p>
        <div className="text-sm mt-2">
          <span className="text-gray-600">{getBetaText(beta)}</span>
          {beta !== 1 && (
            <span className={`ml-2 font-medium ${
              beta > 1 ? 'text-orange-600' : 'text-blue-600'
            }`}>
              vs market
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Advanced Metrics */}

      {/* Sortino Ratio Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Sortino Ratio</h3>
          <BarChart3 className="h-5 w-5 text-green-600" />
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {sortinoRatio.toFixed(2)}
        </p>
        <div className="text-sm mt-2">
          <span className={`font-medium ${
            sortinoRatio >= 2 ? 'text-green-600' :
            sortinoRatio >= 1 ? 'text-blue-600' : 'text-amber-600'
          }`}>
            {sortinoRatio >= 2 ? 'Excellent' : sortinoRatio >= 1 ? 'Good' : 'Fair'}
          </span>
          <span className="text-gray-600 ml-2">downside risk</span>
        </div>
      </div>

      {/* Max Drawdown Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Max Drawdown</h3>
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <p className="text-3xl font-bold text-red-600">
          {(maxDrawdown * 100).toFixed(1)}%
        </p>
        <div className="text-sm mt-2">
          <span className={`font-medium ${
            maxDrawdown < 0.1 ? 'text-green-600' :
            maxDrawdown < 0.2 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {maxDrawdown < 0.1 ? 'Low' : maxDrawdown < 0.2 ? 'Moderate' : 'High'}
          </span>
          <span className="text-gray-600 ml-2">peak decline</span>
        </div>
      </div>

      {/* Volatility Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Volatility</h3>
          <Gauge className="h-5 w-5 text-purple-600" />
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {(volatility * 100).toFixed(1)}%
        </p>
        <div className="text-sm mt-2">
          <span className={`font-medium ${
            volatility < 0.15 ? 'text-green-600' :
            volatility < 0.25 ? 'text-blue-600' : 'text-orange-600'
          }`}>
            {volatility < 0.15 ? 'Low' : volatility < 0.25 ? 'Moderate' : 'High'}
          </span>
          <span className="text-gray-600 ml-2">annual std dev</span>
        </div>
      </div>

      {/* Information Ratio Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Info Ratio</h3>
          <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center">
            <span className="text-teal-600 text-xs font-bold">IR</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {infoRatio.toFixed(2)}
        </p>
        <div className="text-sm mt-2">
          <span className={`font-medium ${
            infoRatio > 0.5 ? 'text-green-600' :
            infoRatio > 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            {infoRatio > 0.5 ? 'Good' : infoRatio > 0 ? 'Fair' : 'Below benchmark'}
          </span>
          <span className="text-gray-600 ml-2">vs S&P 500</span>
        </div>
      </div>
    </div>
  );
}
