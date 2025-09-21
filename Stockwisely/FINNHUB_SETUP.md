# Finnhub API Integration Setup Guide

## Overview
This guide explains how to set up the Finnhub API integration for live stock market news in your StockWisely application.

## Getting Your Finnhub API Key

1. **Visit Finnhub Website**
   - Go to [https://finnhub.io/](https://finnhub.io/)
   - Click "Get free API key" or "Sign Up"

2. **Create Account**
   - Sign up with your email address
   - Verify your email if required
   - Log in to your dashboard

3. **Get API Key**
   - Once logged in, you'll see your API key on the dashboard
   - Copy the API key (it looks like: `your_api_key_here`)

## Environment Setup

1. **Add to .env file**
   ```env
   # Add this line to your backend/.env file
   FINNHUB_API_KEY=your_actual_api_key_here
   ```

2. **Restart your backend server**
   ```bash
   cd Stockwisely/backend
   npm start
   ```

## Features Added

### Live News Section
- **Auto-refresh**: News updates every 10 minutes automatically
- **Manual refresh**: Click the refresh button to get latest news
- **Responsive design**: Works on all screen sizes
- **Error handling**: Graceful fallback when API is unavailable

### News Display
- **Headlines**: Clear, readable news headlines
- **Summaries**: Brief article summaries
- **Images**: Article thumbnails when available
- **Sources**: News source attribution
- **External links**: Direct links to full articles
- **Timestamps**: When the news was published

### API Endpoints
- **GET /api/live-news**: Fetches latest stock market news
- **Filtering**: Only shows business/stock market related news
- **Limit**: Returns top 10 most relevant articles

## Chatbot Authentication Features

### Sign-in Page Behavior
- **Limited responses**: Only answers onboarding questions
- **Restricted access**: Other queries prompt user to sign in
- **Onboarding keywords**: Responds to "what is this app about?" type questions

### Logged-in Behavior  
- **Full access**: Answers all questions about app features
- **Context-aware**: Knows user authentication status
- **Enhanced help**: Provides detailed assistance

## Usage Instructions

### For Users
1. **Live News**: Visit the News page to see latest market updates
2. **Refresh**: Click refresh button for latest news
3. **Read More**: Click on any article to read the full story
4. **Chatbot**: Sign in to access full chatbot features

### For Developers
1. **API Rate Limits**: Finnhub free tier has rate limits
2. **Error Handling**: Check console for API errors
3. **Customization**: Modify news filtering in server.js
4. **Styling**: Update News.jsx for custom styling

## Troubleshooting

### Common Issues

1. **No news showing**
   - Check if FINNHUB_API_KEY is set in .env
   - Verify API key is valid on Finnhub dashboard
   - Check browser console for errors

2. **API Rate Limit**
   - Free tier has limited requests per minute
   - Consider upgrading Finnhub plan for production
   - Implement caching if needed

3. **Chatbot not working**
   - Check if user is properly authenticated
   - Verify localStorage has authToken
   - Check browser console for errors

### API Limits
- **Free Tier**: 60 calls/minute
- **Upgrade**: Consider paid plan for production use
- **Caching**: Implement Redis caching for better performance

## Security Notes

- **API Key**: Never expose API key in frontend code
- **Environment**: Keep .env file secure and not in version control
- **Rate Limiting**: Implement rate limiting for production use

## Next Steps

1. **Test the integration** with your Finnhub API key
2. **Customize news filtering** based on your needs  
3. **Style the news display** to match your design
4. **Monitor API usage** to stay within limits
5. **Consider caching** for better performance

The integration is now complete and ready for use!