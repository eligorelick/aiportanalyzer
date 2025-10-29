// newsFetcher.js - Fetch news from Financial Modeling Prep and Alpha Vantage

const FMP_API_KEY = import.meta.env.VITE_FMP_API_KEY;
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

// Cache news for 15 minutes
const NEWS_CACHE_DURATION = 15 * 60 * 1000;
const newsCache = new Map();

const getCachedNews = (key) => {
  const cached = newsCache.get(key);
  if (cached && Date.now() - cached.timestamp < NEWS_CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedNews = (key, data) => {
  newsCache.set(key, { data, timestamp: Date.now() });
};

export const newsFetcher = {
  // Fetch news from Financial Modeling Prep
  async fetchFMPNews(tickers, limit = 5) {
    if (!FMP_API_KEY) {
      console.warn('FMP API key not configured');
      return [];
    }

    try {
      const tickerList = tickers.slice(0, 5).join(','); // Limit to 5 tickers
      const cacheKey = `fmp-${tickerList}`;

      const cached = getCachedNews(cacheKey);
      if (cached) return cached;

      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/stock_news?tickers=${tickerList}&limit=${limit}&apikey=${FMP_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`FMP API error: ${response.status}`);
      }

      const news = await response.json();

      const formattedNews = news.map(item => ({
        title: item.title,
        description: item.text || item.summary,
        url: item.url,
        publishedDate: item.publishedDate,
        source: item.site || 'Financial Modeling Prep',
        ticker: item.symbol,
        image: item.image,
        sentiment: null
      }));

      setCachedNews(cacheKey, formattedNews);
      return formattedNews;
    } catch (error) {
      console.error('Error fetching FMP news:', error);
      return [];
    }
  },

  // Fetch news from Alpha Vantage
  async fetchAlphaVantageNews(tickers, limit = 5) {
    if (!ALPHA_VANTAGE_API_KEY) {
      console.warn('Alpha Vantage API key not configured');
      return [];
    }

    try {
      const ticker = tickers[0]; // Alpha Vantage works with one ticker at a time
      const cacheKey = `av-${ticker}`;

      const cached = getCachedNews(cacheKey);
      if (cached) return cached;

      const response = await fetch(
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&limit=${limit}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.Note) {
        console.warn('Alpha Vantage API rate limit reached');
        return [];
      }

      const formattedNews = (data.feed || []).map(item => ({
        title: item.title,
        description: item.summary,
        url: item.url,
        publishedDate: item.time_published,
        source: item.source,
        ticker: item.ticker_sentiment?.[0]?.ticker || ticker,
        image: item.banner_image,
        sentiment: item.overall_sentiment_label,
        sentimentScore: item.overall_sentiment_score
      }));

      setCachedNews(cacheKey, formattedNews);
      return formattedNews;
    } catch (error) {
      console.error('Error fetching Alpha Vantage news:', error);
      return [];
    }
  },

  // Fetch news from both sources and merge
  async fetchPortfolioNews(tickers, limit = 10) {
    if (!tickers || tickers.length === 0) {
      return [];
    }

    try {
      // Fetch from both sources in parallel
      const [fmpNews, avNews] = await Promise.all([
        this.fetchFMPNews(tickers, Math.ceil(limit / 2)),
        this.fetchAlphaVantageNews(tickers, Math.ceil(limit / 2))
      ]);

      // Merge and deduplicate news
      const allNews = [...fmpNews, ...avNews];
      const uniqueNews = Array.from(
        new Map(allNews.map(item => [item.url, item])).values()
      );

      // Sort by date (most recent first)
      uniqueNews.sort((a, b) => {
        const dateA = new Date(a.publishedDate);
        const dateB = new Date(b.publishedDate);
        return dateB - dateA;
      });

      return uniqueNews.slice(0, limit);
    } catch (error) {
      console.error('Error fetching portfolio news:', error);
      return [];
    }
  },

  // Fetch general market news
  async fetchMarketNews(limit = 10) {
    if (!FMP_API_KEY) {
      return [];
    }

    try {
      const cacheKey = 'market-news';
      const cached = getCachedNews(cacheKey);
      if (cached) return cached;

      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/fmp/articles?page=0&size=${limit}&apikey=${FMP_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`FMP API error: ${response.status}`);
      }

      const news = await response.json();

      const formattedNews = (news.content || news).slice(0, limit).map(item => ({
        title: item.title,
        description: item.content || item.text,
        url: item.url,
        publishedDate: item.publishedDate || item.date,
        source: item.site || 'FMP',
        image: item.image,
        ticker: null
      }));

      setCachedNews(cacheKey, formattedNews);
      return formattedNews;
    } catch (error) {
      console.error('Error fetching market news:', error);
      return [];
    }
  }
};
