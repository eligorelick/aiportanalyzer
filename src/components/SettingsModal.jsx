// SettingsModal.jsx - Settings modal for API key and preferences
import { X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsModal({ isOpen, onClose, settings, onSave }) {
  const [formData, setFormData] = useState({
    apiKey: '',
    riskFreeRate: 4.2,
    refreshInterval: 300000,
    currency: 'USD'
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        apiKey: settings.apiKey || '',
        riskFreeRate: (settings.riskFreeRate * 100) || 4.2,
        refreshInterval: settings.refreshInterval || 300000,
        currency: settings.currency || 'USD'
      });
    }
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert risk-free rate back to decimal
    const settingsToSave = {
      ...formData,
      riskFreeRate: parseFloat(formData.riskFreeRate) / 100
    };
    
    onSave(settingsToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* API Key Section */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Anthropic API Key
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sk-ant-..."
            />
            <p className="text-sm text-gray-600 mt-2">
              Get your API key from{' '}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                console.anthropic.com
              </a>
              . Required for AI insights feature.
            </p>
          </div>

          {/* Risk-Free Rate */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Risk-Free Rate (%)
            </label>
            <input
              type="number"
              value={formData.riskFreeRate}
              onChange={(e) => handleChange('riskFreeRate', e.target.value)}
              step="0.01"
              min="0"
              max="100"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-600 mt-2">
              Current 10-year Treasury yield. Used for calculating risk-adjusted metrics like Sharpe Ratio.
              Default: 4.2%
            </p>
          </div>

          {/* Auto-Refresh Interval */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Auto-Refresh Prices
            </label>
            <select
              value={formData.refreshInterval}
              onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">Manual Only</option>
              <option value="300000">Every 5 minutes</option>
              <option value="900000">Every 15 minutes</option>
              <option value="1800000">Every 30 minutes</option>
              <option value="3600000">Every hour</option>
            </select>
            <p className="text-sm text-gray-600 mt-2">
              How often to automatically refresh price data from Yahoo Finance.
            </p>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
            </select>
            <p className="text-sm text-gray-600 mt-2">
              Display currency for portfolio values.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Info Section */}
        <div className="p-6 bg-blue-50 border-t">
          <h3 className="font-semibold text-blue-900 mb-2">About this Dashboard</h3>
          <p className="text-sm text-blue-800">
            This professional portfolio analytics dashboard provides institutional-quality metrics
            and AI-powered insights for your investment portfolio. All data is stored locally in
            your browser and is never sent to external servers (except for price data fetching and AI insights).
          </p>
        </div>
      </div>
    </div>
  );
}
