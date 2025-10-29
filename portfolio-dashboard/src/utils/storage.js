// storage.js - Handle localStorage operations for portfolio data

const STORAGE_KEYS = {
  PORTFOLIO: 'portfolio_data',
  SETTINGS: 'portfolio_settings',
  CACHE: 'price_cache'
};

// Check if localStorage is available
const isStorageAvailable = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

export const storage = {
  // Save portfolio data
  savePortfolio(data) {
    if (!isStorageAvailable()) return false;
    try {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving portfolio:', error);
      return false;
    }
  },

  // Load portfolio data
  loadPortfolio() {
    if (!isStorageAvailable()) return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading portfolio:', error);
      return null;
    }
  },

  // Save settings
  saveSettings(settings) {
    if (!isStorageAvailable()) return false;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  },

  // Load settings
  loadSettings() {
    if (!isStorageAvailable()) {
      return {
        apiKey: '',
        riskFreeRate: 0.042,
        refreshInterval: 300000,
        currency: 'USD'
      };
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        apiKey: '',
        riskFreeRate: 0.042,
        refreshInterval: 300000,
        currency: 'USD'
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        apiKey: '',
        riskFreeRate: 0.042,
        refreshInterval: 300000,
        currency: 'USD'
      };
    }
  },

  // Cache price data (with expiry)
  cachePrice(ticker, data, ttlMs = 300000) { // 5 min default
    if (!isStorageAvailable()) return;
    try {
      const cache = this.loadCache();
      cache[ticker] = {
        data,
        expires: Date.now() + ttlMs
      };
      localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(cache));
    } catch (error) {
      console.error('Error caching price:', error);
    }
  },

  // Get cached price if not expired
  getCachedPrice(ticker) {
    if (!isStorageAvailable()) return null;
    try {
      const cache = this.loadCache();
      const cached = cache[ticker];
      if (cached && cached.expires > Date.now()) {
        return cached.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting cached price:', error);
      return null;
    }
  },

  // Load entire cache
  loadCache() {
    if (!isStorageAvailable()) return {};
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CACHE);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading cache:', error);
      return {};
    }
  },

  // Clear old cache entries
  cleanCache() {
    if (!isStorageAvailable()) return;
    try {
      const cache = this.loadCache();
      const now = Date.now();
      const cleaned = {};

      Object.entries(cache).forEach(([ticker, entry]) => {
        if (entry.expires > now) {
          cleaned[ticker] = entry;
        }
      });

      localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(cleaned));
    } catch (error) {
      console.error('Error cleaning cache:', error);
    }
  },

  // Clear all data
  clearAll() {
    if (!isStorageAvailable()) return false;
    try {
      localStorage.removeItem(STORAGE_KEYS.PORTFOLIO);
      localStorage.removeItem(STORAGE_KEYS.CACHE);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
};
