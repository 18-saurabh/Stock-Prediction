import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from "../components/Navbar";

const News = () => {
  const [ticker, setTicker] = useState('');
  const [news, setNews] = useState([]);
  const [sentimentResults, setSentimentResults] = useState({});
  const [error, setError] = useState('');

  // Auto-clear sentiment after 10 seconds
  useEffect(() => {
    if (Object.keys(sentimentResults).length > 0) {
      const timer = setTimeout(() => setSentimentResults({}), 10000);
      return () => clearTimeout(timer);
    }
  }, [sentimentResults]);

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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Stock News with Sentiment Analysis</h1>

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

      {error && <p className="text-red-500 mt-4">{error}</p>}

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
  );
};

export default News;
