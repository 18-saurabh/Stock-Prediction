import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, ExternalLink, RefreshCw } from 'lucide-react';
import Navbar from "../components/Navbar";

const News = () => {
  const [ticker, setTicker] = useState('');
  const [news, setNews] = useState([]);
  const [liveNews, setLiveNews] = useState([]);
  const [sentimentResults, setSentimentResults] = useState({});
  const [error, setError] = useState('');
  const [liveNewsLoading, setLiveNewsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Auto-clear sentiment after 10 seconds
  useEffect(() => {
    if (Object.keys(sentimentResults).length > 0) {
      const timer = setTimeout(() => setSentimentResults({}), 10000);
      return () => clearTimeout(timer);
    }
  }, [sentimentResults]);

  // Fetch live news on component mount and set up periodic refresh
  useEffect(() => {
    fetchLiveNews();
    
    // Set up periodic refresh every 10 minutes
    const interval = setInterval(() => {
      fetchLiveNews();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, []);

  const fetchLiveNews = async () => {
    setLiveNewsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/live-news');
      if (response.data && response.data.news) {
        setLiveNews(response.data.news);
        setLastUpdated(new Date());
        setError('');
      } else {
        setLiveNews([]);
        setError('No live news available at the moment.');
      }
    } catch (error) {
      console.error('Error fetching live news:', error);
      setError('Failed to fetch live news. Please try again later.');
      setLiveNews([]);
    } finally {
      setLiveNewsLoading(false);
    }
  };

  const handleRefreshNews = () => {
    fetchLiveNews();
  };

  const fetchNews = async () => {
    if (!ticker) {
      setError('Please enter a valid stock ticker.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/news?ticker=${ticker}`);
      console.log('News API Response:', response.data);

      if (response.data?.results && response.data.results.length > 0) {
        setNews(response.data.results);
        setSentimentResults({});
        setError('');
      } else {
        setNews([]);
        setError('No news available for this stock ticker.');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Failed to fetch news. Please try again later.');
    }
  };

  const analyzeSentiment = async (articleIndex) => {
    const article = news[articleIndex];
    if (!article) {
      setError('No news available for sentiment analysis.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/sentiment', { text: article.title });
      console.log('Sentiment Response:', response.data);

      const sentimentData = response.data?.sentiment;
      if (sentimentData && sentimentData.length > 0) {
        const positive = sentimentData.find(s => s.label === 'POSITIVE');
        const negative = sentimentData.find(s => s.label === 'NEGATIVE');
        const neutral = sentimentData.find(s => s.label === 'NEUTRAL');

        let sentiment = 'Neutral';
        let confidence = (neutral?.score * 100).toFixed(2) + '%';

        if (positive?.score > (negative?.score || 0) && positive?.score > (neutral?.score || 0)) {
          sentiment = 'Positive';
          confidence = (positive.score * 100).toFixed(2) + '%';
        } else if (negative?.score > (positive?.score || 0) && negative?.score > (neutral?.score || 0)) {
          sentiment = 'Negative';
          confidence = (negative.score * 100).toFixed(2) + '%';
        }

        setSentimentResults(prev => ({
          ...prev,
          [articleIndex]: { sentiment, confidence }
        }));
      } else {
        setError('Invalid sentiment data received.');
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error.message);
      setError('Failed to analyze sentiment. Please try again.');
    }
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'Positive') return 'bg-green-200 text-green-800 border-green-500';
    if (sentiment === 'Negative') return 'bg-red-200 text-red-800 border-red-500';
    if (sentiment === 'Neutral') return 'bg-yellow-200 text-yellow-800 border-yellow-500';
    return 'bg-gray-100';
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-8 bg-gray-50 pt-24">
      <Navbar />
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Stock News & Market Updates</h1>

      {/* Live Market News Section */}
      <div className="w-full max-w-6xl mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Live Market News</h2>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={handleRefreshNews}
              disabled={liveNewsLoading}
              className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${liveNewsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {liveNewsLoading && liveNews.length === 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-white p-6 shadow-md rounded-lg animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : liveNews.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {liveNews.map((article, idx) => (
              <div key={article.id || idx} className="bg-white p-6 shadow-md rounded-lg hover:shadow-lg transition-shadow">
                {article.image && (
                  <img 
                    src={article.image} 
                    alt="News" 
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2">
                  {article.headline}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{article.source}</span>
                  <span>{new Date(article.datetime * 1000).toLocaleDateString()}</span>
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
                >
                  Read More <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No live news available at the moment.</p>
          </div>
        )}
      </div>

      {/* Stock-Specific News Section */}
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Stock-Specific News & Sentiment Analysis</h2>
      <div className="flex space-x-4">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Enter Stock Ticker (e.g., AAPL)"
          className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button 
          onClick={fetchNews} 
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          Get News
        </button>
      </div>

        {error && ticker && <p className="text-red-500 mt-4">{error}</p>}

      {news.length > 0 && (
        <div className="mt-6 grid gap-6 max-w-4xl w-full">
          {news.map((article, idx) => (
            <div key={idx} className="bg-white p-4 shadow-md rounded-lg">
              {article.image && (
                <img src={article.image} alt="News" className="w-full h-48 object-cover rounded-lg mb-4" />
              )}
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-blue-500 hover:underline">
                {article.title}
              </a>
              <p className="text-gray-700 mt-2">
                {article.description || "No description available."}
              </p>
              {article.author && (
                <p className="text-gray-500 text-sm mt-2">By {article.author}</p>
              )}

              <button 
                onClick={() => analyzeSentiment(idx)} 
                className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Analyze Sentiment
              </button>

              {sentimentResults[idx] && (
                <div className={`mt-4 p-4 rounded-lg shadow border ${getSentimentColor(sentimentResults[idx].sentiment)}`}>
                  <p><strong>Sentiment:</strong> {sentimentResults[idx].sentiment}</p>
                  <p><strong>Confidence:</strong> {sentimentResults[idx].confidence}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default News;
