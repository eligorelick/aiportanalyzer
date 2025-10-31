// AIInsights.jsx - Display AI-generated portfolio insights from Claude
import { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, RefreshCw, Sparkles } from 'lucide-react';

export default function AIInsights({ insights, onRegenerate, isLoading }) {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-5 w-5" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityColors = (severity) => {
    switch (severity) {
      case 'high':
        return {
          border: 'border-red-500',
          bg: 'bg-red-50',
          icon: 'bg-red-200 text-red-700'
        };
      case 'medium':
        return {
          border: 'border-yellow-500',
          bg: 'bg-yellow-50',
          icon: 'bg-yellow-200 text-yellow-700'
        };
      default:
        return {
          border: 'border-blue-500',
          bg: 'bg-blue-50',
          icon: 'bg-blue-200 text-blue-700'
        };
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Risk': 'text-red-600',
      'Concentration': 'text-orange-600',
      'Diversification': 'text-blue-600',
      'Performance': 'text-green-600',
      'Recommendation': 'text-purple-600'
    };
    return colors[category] || 'text-gray-600';
  };

  if (!insights || insights.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
          </div>
        </div>
        <div className="text-center py-12 text-gray-500">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="mb-4">No insights generated yet</p>
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <>
                <RefreshCw className="inline h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="inline h-4 w-4 mr-2" />
                Generate Insights
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
        </div>
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Generating...' : 'Regenerate'}
        </button>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const colors = getSeverityColors(insight.severity);
          
          return (
            <div
              key={index}
              className={`border-l-4 ${colors.border} ${colors.bg} rounded-r-lg`}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded ${colors.icon}`}>
                    {getSeverityIcon(insight.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${getCategoryColor(insight.category)} bg-white`}>
                        {insight.category}
                      </span>
                      {insight.severity === 'high' && (
                        <span className="text-xs font-semibold px-2 py-1 rounded text-white bg-red-500">
                          High Priority
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {insight.title}
                    </h3>
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {insight.description}
                    </p>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        💡 Recommended Action:
                      </p>
                      <p className="text-sm text-gray-600">
                        {insight.action}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-900">
          <strong>Note:</strong> These insights are generated by AI and should be considered alongside your own research and investment strategy. Always consult with a financial advisor for personalized advice.
        </p>
      </div>
    </div>
  );
}
