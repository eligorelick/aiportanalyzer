import express from 'express';
import cors from 'cors';
import YahooFinance from 'yahoo-finance2';

// Instantiate yahoo-finance2 with options to suppress notices
const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey']
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Cache middleware to reduce API calls
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute

const getCacheKey = (endpoint, params) => {
  return `${endpoint}-${JSON.stringify(params)}`;
};

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fetch current quote for a ticker
app.get('/api/quote/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const cacheKey = getCacheKey('quote', ticker);

    // Check cache
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const quote = await yahooFinance.quote(ticker);

    // Fetch sector information separately
    let sector = 'Unknown';
    let industry = 'Unknown';

    try {
      const summary = await yahooFinance.quoteSummary(ticker, {
        modules: ['assetProfile']
      });
      sector = summary.assetProfile?.sector || 'Unknown';
      industry = summary.assetProfile?.industry || 'Unknown';
    } catch (err) {
      // If sector fetch fails, continue with Unknown
      console.log(`Could not fetch sector for ${ticker}`);
    }

    const priceData = {
      price: quote.regularMarketPrice || quote.price || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      previousClose: quote.regularMarketPreviousClose || quote.previousClose || 0,
      marketCap: quote.marketCap || 0,
      volume: quote.regularMarketVolume || quote.volume || 0,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
      dividendYield: quote.trailingAnnualDividendYield || 0,
      beta: quote.beta || 1,
      sector: sector,
      industry: industry
    };

    setCache(cacheKey, priceData);
    res.json(priceData);
  } catch (error) {
    console.error(`Error fetching quote for ${req.params.ticker}:`, error);
    res.status(500).json({
      error: error.message,
      ticker: req.params.ticker
    });
  }
});

// Fetch historical data for a ticker
app.get('/api/historical/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const { period1, period2, interval = '1d' } = req.query;

    if (!period1 || !period2) {
      return res.status(400).json({
        error: 'period1 and period2 are required query parameters'
      });
    }

    const cacheKey = getCacheKey('historical', { ticker, period1, period2, interval });

    // Check cache
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ data: cached, cached: true });
    }

    const queryOptions = {
      period1: new Date(parseInt(period1)),
      period2: new Date(parseInt(period2)),
      interval
    };

    const result = await yahooFinance.historical(ticker, queryOptions);

    const historicalData = result.map(day => ({
      date: day.date,
      close: day.close,
      open: day.open,
      high: day.high,
      low: day.low,
      volume: day.volume
    }));

    setCache(cacheKey, historicalData);
    res.json({ data: historicalData });
  } catch (error) {
    console.error(`Error fetching historical data for ${req.params.ticker}:`, error);
    res.status(500).json({
      error: error.message,
      ticker: req.params.ticker
    });
  }
});

// Fetch risk-free rate (10-year Treasury)
app.get('/api/risk-free-rate', async (req, res) => {
  try {
    const cacheKey = getCacheKey('risk-free-rate', {});

    // Check cache
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ rate: cached, cached: true });
    }

    const quote = await yahooFinance.quote('^TNX');
    const rate = (quote.regularMarketPrice || 4.2) / 100;

    setCache(cacheKey, rate);
    res.json({ rate });
  } catch (error) {
    console.error('Error fetching risk-free rate:', error);
    res.json({ rate: 0.042 }); // Default fallback
  }
});

// Fetch sector information for a ticker
app.get('/api/sector/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const cacheKey = getCacheKey('sector', ticker);

    // Check cache
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const quote = await yahooFinance.quoteSummary(ticker, {
      modules: ['assetProfile']
    });

    const sectorInfo = {
      sector: quote.assetProfile?.sector || 'Unknown',
      industry: quote.assetProfile?.industry || 'Unknown'
    };

    setCache(cacheKey, sectorInfo);
    res.json(sectorInfo);
  } catch (error) {
    console.error(`Error fetching sector info for ${req.params.ticker}:`, error);
    res.json({ sector: 'Unknown', industry: 'Unknown' });
  }
});

// Batch fetch quotes for multiple tickers
app.post('/api/quotes/batch', async (req, res) => {
  try {
    const { tickers } = req.body;

    if (!tickers || !Array.isArray(tickers)) {
      return res.status(400).json({ error: 'tickers array is required' });
    }

    const results = {};

    for (const ticker of tickers) {
      try {
        const cacheKey = getCacheKey('quote', ticker);
        let priceData = getCached(cacheKey);

        if (!priceData) {
          const quote = await yahooFinance.quote(ticker);

          // Fetch sector information separately
          let sector = 'Unknown';
          let industry = 'Unknown';

          try {
            const summary = await yahooFinance.quoteSummary(ticker, {
              modules: ['assetProfile']
            });
            sector = summary.assetProfile?.sector || 'Unknown';
            industry = summary.assetProfile?.industry || 'Unknown';
          } catch (err) {
            // If sector fetch fails, continue with Unknown
            console.log(`Could not fetch sector for ${ticker}`);
          }

          priceData = {
            price: quote.regularMarketPrice || quote.price || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            previousClose: quote.regularMarketPreviousClose || quote.previousClose || 0,
            marketCap: quote.marketCap || 0,
            volume: quote.regularMarketVolume || quote.volume || 0,
            fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
            fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
            dividendYield: quote.trailingAnnualDividendYield || 0,
            beta: quote.beta || 1,
            sector: sector,
            industry: industry
          };

          setCache(cacheKey, priceData);

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        results[ticker] = priceData;
      } catch (error) {
        console.error(`Error fetching ${ticker}:`, error);
        results[ticker] = {
          price: 0,
          change: 0,
          changePercent: 0,
          error: error.message
        };
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error in batch quotes:', error);
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Yahoo Finance API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
