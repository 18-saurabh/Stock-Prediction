require("dotenv").config();   

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');
const path = require('path');
const yahooFinance = require('yahoo-finance2').default;
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => console.error("❌ MongoDB connection error:", err));


const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  watchlist: [
    {
      ticker: String,
      companyName: String,
      prices: [Number], 
      dates: [String],
    },
  ],
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/graphs', express.static(path.join(__dirname, 'graphs')));

// Chatbot Route - Stateless Gemini API Integration
app.post('/api/chatbot', async (req, res) => {
  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Create context-aware prompt for StockWisely
    const systemPrompt = `You are StockWisely AI Assistant, a helpful chatbot for a stock prediction application called "StockWisely". 

About StockWisely:
- AI-powered stock price prediction platform using Support Vector Machine (SVM) and Artificial Neural Networks (ANN)
- Built with MERN stack (MongoDB, Express, React, Node.js)
- Features: Stock price predictions, watchlist management, news sentiment analysis, real-time stock tracking
- Uses Yahoo Finance API for stock data and Polygon.io for news
- Prediction accuracy varies but typically ranges from 70-85%
- Free to use with user registration required
- Supports major stock tickers (AAPL, GOOGL, TSLA, etc.)

Key Features:
1. Stock Price Prediction: Enter ticker symbol and future date to get AI predictions
2. Watchlist: Track favorite stocks with real-time price updates and charts
3. News & Sentiment: Get latest stock news with AI sentiment analysis
4. User Profile: Manage account settings and view prediction history

How to use:
1. Sign up/Login on the landing page
2. Navigate to Home to make stock predictions
3. Use Watchlist to track multiple stocks
4. Check News section for market updates and sentiment analysis
5. Manage your profile and settings in Profile section

Answer user questions about StockWisely's functionality, features, and usage. Be helpful, concise, and accurate.`;

    const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ 
      response: text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ 
      error: 'Failed to generate response. Please try again.',
      fallback: "I'm having trouble connecting right now. For help with StockWisely, you can: 1) Use the Home page to make stock predictions, 2) Add stocks to your Watchlist, 3) Check the News section for market updates, or 4) Visit your Profile to manage settings."
    });
  }
});

// Routes

// Signup Route
app.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, username });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//news route

  
  
  let newsHistory = {};

app.get('/api/news', async (req, res) => {
  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ message: 'Ticker symbol is required' });
  }

  const apiUrl = `https://api.polygon.io/v2/reference/news?limit=5&order=desc&ticker=AAPL&apiKey=YG9En1g1c3nWObqLqpzwutMGYDUN0nkG`;

  try {
    const response = await axios.get(apiUrl);

    if (response.data && response.data.results && response.data.results.length > 0) {
      const articles = response.data.results;

      if (!newsHistory[ticker]) {
        newsHistory[ticker] = 0;
      }

      
      const newsIndex = newsHistory[ticker] % articles.length;
      const selectedNews = articles[newsIndex];

      
      newsHistory[ticker]++;

      res.json(selectedNews);
    } else {
      res.json({ message: 'No news available for this stock ticker.' });
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
});


    
  
  
//sentiment analysis

const HUGGINGFACE_API_KEY = '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';
const HUGGINGFACE_URL = 'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english';

app.post('/api/sentiment', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const response = await axios.post(
      HUGGINGFACE_URL,
      { inputs: text },
      { headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` } }
    );

    const sentiment = response.data[0];
    res.json({ sentiment });
  } catch (error) {
    console.error('Error analyzing sentiment:', error.message);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});


// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Password Route
app.post('/api/user/update-password', async (req, res) => {
  const { email, password } = req.body;
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, 'secretkey');
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Fetch Stock Data from Yahoo Finance
app.get('/api/stocks/:ticker', async (req, res) => {
  const { ticker } = req.params;

  try {
    const quote = await yahooFinance.quote(ticker);
    const history = await yahooFinance.historical(ticker, {
      period1: '2021-01-01',
      interval: '1d',
    });

    const stockData = {
      companyName: quote.shortName || 'Unknown',
      currentPrice: quote.regularMarketPrice,  // Add current price here
      prices: history.map(item => item.close),
      dates: history.map(item => item.date.toISOString().split('T')[0]),
    };

    res.json(stockData);
  } catch (error) {
    console.error('Error fetching stock data from Yahoo Finance:', error);
    res.status(500).json({ message: 'Error fetching stock data' });
  }
});




// Prediction Route (using a Python script or model)
app.post('/predict', (req, res) => {
  const { ticker, predictionDate } = req.body;

  if (!ticker || !predictionDate) {
    return res.status(400).json({ error: 'Ticker and prediction date are required.' });
  }

  const scriptPath = path.join(__dirname, 'model', 'model.py');
  const command = `python "${scriptPath}" "${ticker}" "${predictionDate}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${stderr}`);
      return res.status(500).json({ error: `Failed to process prediction: ${stderr}` });
    }
  
    try {
      // Get only the last line which is JSON
      const lines = stdout.trim().split('\n');
      const responseJson = JSON.parse(lines[lines.length - 1]); // Last line assumed to be JSON
      res.json(responseJson);
    } catch (parseError) {
      console.error('Error parsing Python script output:', parseError);
      res.status(500).json({ error: 'Unexpected script output.' });
    }
  });
  
});

// Watchlist Routes (Add, Remove, Fetch)
app.post('/watchlist/add', async (req, res) => {
  const { email, ticker, companyName = 'Unknown', prices = [], dates = [] } = req.body;

  if (!email || !ticker) {
    return res.status(400).json({ message: 'Email and ticker are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stockExists = user.watchlist.some(stock => stock.ticker === ticker);
    if (stockExists) {
      return res.status(400).json({ message: 'Stock already in watchlist' });
    }

    user.watchlist.push({ ticker, companyName, prices, dates });
    await user.save();

    res.status(200).json({ message: 'Stock added to watchlist' });
  } catch (error) {
    console.error('Error adding stock to watchlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/watchlist/remove', async (req, res) => {
  const { email, ticker } = req.body;

  if (!email || !ticker) {
    return res.status(400).json({ message: 'Email and ticker are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedWatchlist = user.watchlist.filter(stock => stock.ticker !== ticker);
    user.watchlist = updatedWatchlist;
    await user.save();

    res.status(200).json({ message: 'Stock removed from watchlist' });
  } catch (error) {
    console.error('Error removing stock from watchlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Watchlist Route
app.get('/watchlist/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ watchlist: user.watchlist });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});