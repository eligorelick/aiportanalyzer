// dataFetcher.js - Fetch price data from Yahoo Finance via backend API
import { storage } from './storage';

const API_BASE_URL = '/api';

export const dataFetcher = {
  // Fetch current prices for multiple tickers
  async fetchCurrentPrices(tickers) {
    try {
      // Check cache first
      const uncachedTickers = [];
      const results = {};

      for (const ticker of tickers) {
        const cached = storage.getCachedPrice(ticker);
        if (cached) {
          results[ticker] = cached;
        } else {
          uncachedTickers.push(ticker);
        }
      }

      // Fetch uncached tickers from backend
      if (uncachedTickers.length > 0) {
        const response = await fetch(`${API_BASE_URL}/quotes/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tickers: uncachedTickers }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Cache and merge results
        for (const [ticker, priceData] of Object.entries(data)) {
          if (!priceData.error) {
            storage.cachePrice(ticker, priceData);
          }
          results[ticker] = priceData;
        }
      }

      return results;
    } catch (error) {
      console.error('Error fetching current prices:', error);
      // Return error data for all tickers
      const errorResults = {};
      for (const ticker of tickers) {
        errorResults[ticker] = {
          price: 0,
          change: 0,
          changePercent: 0,
          error: error.message
        };
      }
      return errorResults;
    }
  },

  // Fetch historical prices for a ticker
  async fetchHistoricalData(ticker, startDate, endDate) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/historical/${ticker}?period1=${startDate.getTime()}&period2=${endDate.getTime()}&interval=1d`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { data } = await response.json();
      return data || [];
    } catch (error) {
      console.error(`Error fetching historical data for ${ticker}:`, error);
      return [];
    }
  },

  // Fetch market benchmark data (S&P 500)
  async fetchBenchmarkData(startDate, endDate) {
    return this.fetchHistoricalData('^GSPC', startDate, endDate);
  },

  // Fetch risk-free rate (10-year Treasury)
  async fetchRiskFreeRate() {
    try {
      const response = await fetch(`${API_BASE_URL}/risk-free-rate`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { rate } = await response.json();
      return rate;
    } catch (error) {
      console.error('Error fetching risk-free rate:', error);
      return 0.042; // Default fallback
    }
  },

  // Get sector information for a ticker
  async getSectorInfo(ticker) {
    try {
      const response = await fetch(`${API_BASE_URL}/sector/${ticker}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        sector: data.sector || 'Unknown',
        industry: data.industry || 'Unknown'
      };
    } catch (error) {
      console.error(`Error fetching sector info for ${ticker}:`, error);
      return { sector: 'Unknown', industry: 'Unknown' };
    }
  },

  // Fetch multiple historical data sets in parallel
  async fetchMultipleHistorical(tickers, startDate, endDate) {
    const promises = tickers.map(ticker => 
      this.fetchHistoricalData(ticker, startDate, endDate)
    );
    
    const results = await Promise.allSettled(promises);
    
    const historicalData = {};
    tickers.forEach((ticker, index) => {
      if (results[index].status === 'fulfilled') {
        historicalData[ticker] = results[index].value;
      } else {
        historicalData[ticker] = [];
      }
    });
    
    return historicalData;
  }
};
