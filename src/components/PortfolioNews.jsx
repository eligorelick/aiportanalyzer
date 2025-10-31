// PortfolioNews.jsx - Display portfolio-related news
import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, RefreshCw, Loader } from 'lucide-react';
import { newsFetcher } from '../utils/newsFetcher';

export default function PortfolioNews({ positions }) {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' or 'market'

  useEffect(() => {
    if (positions.length > 0) {
      fetchNews();
    }
  }, [positions]);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const tickers = positions.map(p => p.ticker).filter(t => t !== 'SWVXX');

      if (activeTab === 'portfolio' && tickers.length > 0) {
        const newsData = await newsFetcher.fetchPortfolioNews(tickers, 12);
        setNews(newsData);
      } else {
        const newsData = await newsFetcher.fetchMarketNews(12);
        setNews(newsData);
      }
    } catch (err) {
      setError('Failed to fetch news. Please try again later.');
      console.error('News fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      return dateString;
    }
  };

  const getSentimentBadge = (sentiment, score) => {
    if (!sentiment) return null;

    const sentimentLower = sentiment.toLowerCase();
    let color = 'bg-gray-100 text-gray-800';
    let icon = null;

    if (sentimentLower.includes('bullish') || sentimentLower.includes('positive')) {
      color = 'bg-green-100 text-green-800';
      icon = <TrendingUp className="h-3 w-3" />;
    } else if (sentimentLower.includes('bearish') || sentimentLower.includes('negative')) {
      color = 'bg-red-100 text-red-800';
      icon = <TrendingDown className="h-3 w-3" />;
    } else if (sentimentLower.includes('neutral')) {
      color = 'bg-blue-100 text-blue-800';
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {icon}
        {sentiment}
      </span>
    );
  };

  if (positions.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Portfolio News</h2>
        </div>

        <button
          onClick={fetchNews}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('portfolio');
            setNews([]);
            setTimeout(fetchNews, 0);
          }}
          className={`pb-2 px-1 font-medium transition-colors ${
            activeTab === 'portfolio'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Your Holdings
        </button>
        <button
          onClick={() => {
            setActiveTab('market');
            setNews([]);
            setTimeout(fetchNews, 0);
          }}
          className={`pb-2 px-1 font-medium transition-colors ${
            activeTab === 'market'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Market News
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-600">Loading news...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* News Grid */}
      {!isLoading && !error && news.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((article, index) => (
            <a
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Image */}
              {article.image && (
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Ticker & Sentiment */}
                <div className="flex items-center gap-2 mb-2">
                  {article.ticker && (
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {article.ticker}
                    </span>
                  )}
                  {getSentimentBadge(article.sentiment, article.sentimentScore)}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>

                {/* Description */}
                {article.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {article.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{article.source}</span>
                  <div className="flex items-center gap-1">
                    <span>{formatDate(article.publishedDate)}</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* No News State */}
      {!isLoading && !error && news.length === 0 && (
        <div className="text-center py-12">
          <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No news available</p>
          <p className="text-sm text-gray-500">
            {activeTab === 'portfolio'
              ? 'Try adding some stocks to your portfolio'
              : 'Unable to fetch market news at this time'}
          </p>
        </div>
      )}
    </div>
  );
}
