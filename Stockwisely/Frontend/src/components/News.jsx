import React, { useState } from 'react';

function News() {
  const [ticker, setTicker] = useState('');
  const [news, setNews] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchNews = async () => {
    if (!ticker.trim()) {
      setErrorMessage('Please enter a stock ticker.');
      setNews([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/news?ticker=${ticker}`);

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (Array.isArray(data.articles) && data.articles.length > 0) {
        setNews(data.articles);
        setErrorMessage('');
      } else {
        setNews([]);
        setErrorMessage('No news available for this stock ticker.');
      }
    } catch (error) {
      console.error('Error:', error);
      setNews([]);
      setErrorMessage('Failed to fetch news. Please try again.');
    }
  };

  return (
    <div>
      <h2>Stock News</h2>
      <input 
        type="text" 
        placeholder="Enter Stock Ticker (e.g., AAPL)" 
        value={ticker} 
        onChange={(e) => setTicker(e.target.value)} 
      />
      <button onClick={fetchNews}>Get News</button>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <ul>
        {news.map((article, index) => (
          <li key={index}>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title || 'No Title'}
            </a>
            <p>{article.description || 'No description available.'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default News;
