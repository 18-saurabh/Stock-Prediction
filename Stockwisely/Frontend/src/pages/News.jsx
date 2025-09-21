import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Clock, ExternalLink, TrendingUp, Newspaper, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from 'axios';

const News = () => {
  const [liveNews, setLiveNews] = useState([]);
  const [tickerNews, setTickerNews] = useState([]);
  const [searchTicker, setSearchTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [tickerLoading, setTickerLoading] = useState(false);
  const [error, setError] = useState('');
  const [tickerError, setTickerError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchedTicker, setSearchedTicker] = useState('');

  // Fetch live news on component mount
  useEffect(() => {
    fetchLiveNews();
    
    // Set up auto-refresh every 10 minutes
    const interval = setInterval(fetchLiveNews, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveNews = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/live-news');
      setLiveNews(response.data.news || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching live news:', error);
      setError('Failed to fetch live news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const searchTickerNews = async () => {
    if (!searchTicker.trim()) {
      setTickerError('Please enter a stock ticker symbol');
      return;
    }

    setTickerLoading(true);
    setTickerError('');
    setSearchedTicker(searchTicker.toUpperCase());
    
    try {
      const response = await axios.get(`http://localhost:5000/api/ticker-news/${searchTicker.toUpperCase()}`);
      setTickerNews(response.data.news || []);
      
      if (!response.data.news || response.data.news.length === 0) {
        setTickerError(`No recent news found for ${searchTicker.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Error fetching ticker news:', error);
      setTickerError('Failed to fetch ticker news. Please try again.');
      setTickerNews([]);
    } finally {
      setTickerLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchTickerNews();
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const NewsCard = ({ article, isLive = false }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {article.image && (
        <div className="h-48 overflow-hidden">
          <img 
            src={article.image} 
            alt={article.headline}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
            {article.source || 'Financial News'}
          </span>
          {isLive && (
            <div className="flex items-center text-green-500 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
              LIVE
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 hover:text-orange-600 transition-colors">
          {article.headline}
        </h3>
        
        {article.summary && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {article.summary}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-xs">
            <Clock className="w-4 h-4 mr-1" />
            {formatDate(article.datetime)}
          </div>
          
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
            >
              Read More
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Newspaper className="h-12 w-12 text-orange-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Stock Market News</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Stay updated with the latest market trends and company news
          </p>
        </div>

        {/* Live News Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-orange-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Live Market News</h2>
              <div className="ml-3 flex items-center text-green-500 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                Auto-updating
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <span className="text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={fetchLiveNews}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <LoadingSkeleton key={index} />
              ))
            ) : liveNews.length > 0 ? (
              liveNews.map((article, index) => (
                <NewsCard key={article.id || index} article={article} isLive={true} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No live news available at the moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Ticker News Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <Search className="h-6 w-6 text-orange-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Search Company News</h2>
          </div>

          {/* Search Input */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTicker}
                onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Enter stock ticker (e.g., AAPL, TSLA, GOOGL)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-lg"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <button
              onClick={searchTickerNews}
              disabled={tickerLoading || !searchTicker.trim()}
              className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {tickerLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Results */}
          {searchedTicker && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                News for {searchedTicker}
                {tickerNews.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({tickerNews.length} articles found)
                  </span>
                )}
              </h3>

              {tickerError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-yellow-700">{tickerError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickerLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <LoadingSkeleton key={index} />
                  ))
                ) : tickerNews.length > 0 ? (
                  tickerNews.map((article, index) => (
                    <NewsCard key={article.id || index} article={article} />
                  ))
                ) : searchedTicker && !tickerLoading && !tickerError ? (
                  <div className="col-span-full text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No news found for {searchedTicker}</p>
                    <p className="text-gray-400 text-sm mt-2">Try searching for a different ticker symbol</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Popular Tickers Suggestion */}
          {!searchedTicker && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Try searching for popular stocks:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['AAPL', 'GOOGL', 'TSLA', 'AMZN', 'MSFT', 'META', 'NVDA', 'NFLX'].map((ticker) => (
                  <button
                    key={ticker}
                    onClick={() => {
                      setSearchTicker(ticker);
                      setSearchedTicker(ticker);
                      searchTickerNews();
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-600 rounded-full text-sm transition-colors"
                  >
                    {ticker}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default News;