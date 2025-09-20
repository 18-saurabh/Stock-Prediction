import React, { useState } from 'react';
import axios from 'axios';

const SentimentAnalysis = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!text) {
      setError('Please enter news text to analyze sentiment.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/sentiment', { text });
      setResult(response.data.sentiment);
      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to analyze sentiment. Please try again.');
    }
  };

  return (
    <div className="container">
      <h1>Stock News Sentiment Analysis</h1>
      <textarea
        rows="4"
        cols="50"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the stock news here..."
      />
      <button onClick={handleAnalyze}>Analyze Sentiment</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div>
          <p><strong>Sentiment:</strong> {result.label}</p>
          <p><strong>Confidence:</strong> {(result.score * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalysis;
