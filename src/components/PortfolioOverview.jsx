// PortfolioOverview.jsx - Summary cards showing key portfolio metrics
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, AlertTriangle, Gauge, Target, Award, TrendingUp as Trophy } from 'lucide-react';

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
    volatility,
    treynorRatio,
    calmarRatio,
    omegaRatio,
    winRate,
    profitFactor,
    rSquared
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

  const getTreynorRatingText = (treynor) => {
    if (treynor >= 0.1) return 'Excellent';
    if (treynor >= 0.05) return 'Good';
    if (treynor >= 0) return 'Fair';
    return 'Below market';
  };

  const getCalmarRatingText = (calmar) => {
    if (calmar >= 3) return 'Excellent';
    if (calmar >= 1) return 'Good';
    if (calmar >= 0.5) return 'Fair';
    return 'Poor';
  };

  const getOmegaRatingText = (omega) => {
    if (omega >= 1.5) return 'Excellent';
    if (omega >= 1.2) return 'Good';
    if (omega >= 1) return 'Fair';
    return 'Poor';
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

      {/* Row 3: Additional Advanced Metrics */}

      {/* Treynor Ratio Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Treynor Ratio</h3>
          <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-emerald-600 text-xs font-bold">T</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {treynorRatio.toFixed(3)}
        </p>
        <div className="text-sm mt-2">
          <span className={`font-medium ${
            treynorRatio >= 0.1 ? 'text-green-600' :
            treynorRatio >= 0.05 ? 'text-blue-600' :
            treynorRatio >= 0 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {getTreynorRatingText(treynorRatio)}
          </span>
          <span className="text-gray-600 ml-2">return per beta</span>
        </div>
      </div>

      {/* Calmar Ratio Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Calmar Ratio</h3>
          <Target className="h-5 w-5 text-cyan-600" />
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {calmarRatio.toFixed(2)}
        </p>
        <div className="text-sm mt-2">
          <span className={`font-medium ${
            calmarRatio >= 3 ? 'text-green-600' :
            calmarRatio >= 1 ? 'text-blue-600' :
            calmarRatio >= 0.5 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {getCalmarRatingText(calmarRatio)}
          </span>
          <span className="text-gray-600 ml-2">return vs drawdown</span>
        </div>
      </div>

      {/* Omega Ratio Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Omega Ratio</h3>
          <div className="h-5 w-5 rounded-full bg-violet-100 flex items-center justify-center">
            <span className="text-violet-600 text-xs font-bold">Ω</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {omegaRatio.toFixed(2)}
        </p>
        <div className="text-sm mt-2">
          <span className={`font-medium ${
            omegaRatio >= 1.5 ? 'text-green-600' :
            omegaRatio >= 1.2 ? 'text-blue-600' :
            omegaRatio >= 1 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {getOmegaRatingText(omegaRatio)}
          </span>
          <span className="text-gray-600 ml-2">gain/loss probability</span>
        </div>
      </div>

      {/* Win Rate Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Win Rate</h3>
          <Award className="h-5 w-5 text-green-600" />
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {winRate.toFixed(1)}%
        </p>
        <div className="text-sm mt-2">
          <span className={`font-medium ${
            winRate >= 60 ? 'text-green-600' :
            winRate >= 50 ? 'text-blue-600' :
            winRate >= 40 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {winRate >= 60 ? 'Excellent' : winRate >= 50 ? 'Good' : winRate >= 40 ? 'Fair' : 'Needs improvement'}
          </span>
          <span className="text-gray-600 ml-2">profitable positions</span>
        </div>
      </div>

      {/* Profit Factor Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Profit Factor</h3>
          <Trophy className="h-5 w-5 text-yellow-600" />
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
        </p>
        <div className="text-sm mt-2">
          <span className={`font-medium ${
            profitFactor >= 2 ? 'text-green-600' :
            profitFactor >= 1.5 ? 'text-blue-600' :
            profitFactor >= 1 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {profitFactor >= 2 ? 'Excellent' : profitFactor >= 1.5 ? 'Good' : profitFactor >= 1 ? 'Fair' : 'Poor'}
          </span>
          <span className="text-gray-600 ml-2">gross profit/loss</span>
        </div>
      </div>

      {/* R-Squared Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">R-Squared</h3>
          <div className="h-5 w-5 rounded-full bg-pink-100 flex items-center justify-center">
            <span className="text-pink-600 text-xs font-bold">R²</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {(rSquared * 100).toFixed(1)}%
        </p>
        <div className="text-sm mt-2">
          <span className={`font-medium ${
            rSquared >= 0.8 ? 'text-red-600' :
            rSquared >= 0.5 ? 'text-amber-600' : 'text-green-600'
          }`}>
            {rSquared >= 0.8 ? 'High correlation' : rSquared >= 0.5 ? 'Moderate' : 'Low correlation'}
          </span>
          <span className="text-gray-600 ml-2">vs market</span>
        </div>
      </div>

      {/* Alpha Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Alpha</h3>
          <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-orange-600 text-xs font-bold">α</span>
          </div>
        </div>
        <p className={`text-3xl font-bold ${
          alpha >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {formatPercent(alpha * 100)}
        </p>
        <div className="text-sm mt-2">
          <span className={`font-medium ${
            alpha >= 0.05 ? 'text-green-600' :
            alpha >= 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            {alpha >= 0.05 ? 'Outperforming' : alpha >= 0 ? 'Slight outperformance' : 'Underperforming'}
          </span>
          <span className="text-gray-600 ml-2">vs benchmark</span>
        </div>
      </div>
    </div>
  );
}
