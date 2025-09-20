# StockWisely AI Chatbot - Deployment Guide

## Overview
This chatbot integration adds an AI-powered assistant to StockWisely using Google Gemini API. The chatbot is stateless on the backend and stores chat history only in the frontend memory.

## Features
- **Stateless Backend**: No chat history stored on server
- **Frontend-Only Memory**: Chat history cleared on logout/refresh
- **Context-Aware**: Understands StockWisely's features and functionality
- **Real-time Responses**: Powered by Google Gemini Pro model
- **Responsive UI**: Modern chat interface with animations
- **Quick Questions**: Predefined common queries for better UX

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd Stockwisely/backend
npm install @google/generative-ai
```

#### Environment Variables
Create a `.env` file in the backend directory:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

#### Get Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

### 2. Frontend Setup

The chatbot component is automatically integrated into the main App component and will appear on all pages as a floating chat button.

#### Features Included:
- **Floating Chat Button**: Bottom-right corner of the screen
- **Minimizable Window**: Users can minimize/maximize the chat
- **Auto-scroll**: Messages automatically scroll to bottom
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Graceful fallback messages
- **Quick Questions**: Predefined questions for common queries

### 3. API Endpoint

The chatbot uses a single stateless endpoint:

**POST** `/api/chatbot`
```json
{
  "message": "How do I make a stock prediction?",
  "context": [] // Optional: last 5 messages for context
}
```

**Response:**
```json
{
  "response": "To make a stock prediction with StockWisely...",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

## Chat History Management

### Frontend Storage
- Chat history stored in React component state
- No persistence across page refreshes
- Automatically cleared on component unmount
- No localStorage or sessionStorage used

### Backend Stateless Design
- No chat history stored on server
- Each request is independent
- Context passed from frontend when needed
- Scalable and memory-efficient

## Example Queries and Responses

### Query: "How do I make a stock prediction?"
**Response:** "To make a stock prediction with StockWisely: 1) Go to the Home page, 2) Enter a stock ticker symbol (like AAPL, GOOGL, TSLA), 3) Select a future date, 4) Click 'Predict Stock Price'. Our AI will analyze historical data and provide a prediction with accuracy metrics and a visual graph."

### Query: "What is the prediction accuracy?"
**Response:** "StockWisely's prediction accuracy typically ranges from 70-85%, depending on the stock and market conditions. We use Support Vector Machine (SVM) and Artificial Neural Networks (ANN) trained on historical data from Yahoo Finance. The accuracy is displayed with each prediction along with a detailed graph showing actual vs predicted prices."

### Query: "How do I add stocks to my watchlist?"
**Response:** "To add stocks to your watchlist: 1) Navigate to the Watchlist page, 2) Use the search bar to enter a stock ticker, 3) Press Enter or click the search button, 4) Click the '+' button on the stock preview to add it. You can track multiple stocks with real-time price updates and interactive charts."

## Customization

### Modifying System Prompt
Edit the `systemPrompt` in `server.js` to customize the chatbot's knowledge base and personality.

### Adding Quick Questions
Modify the `quickQuestions` array in `Chatbot.jsx` to add more predefined questions.

### Styling
The chatbot uses Tailwind CSS classes. Modify the component styles to match your design preferences.

## Error Handling

### API Failures
- Graceful fallback messages
- Retry mechanisms
- User-friendly error display

### Network Issues
- Loading states during requests
- Timeout handling
- Offline detection (optional)

## Security Considerations

### API Key Protection
- Store Gemini API key in environment variables
- Never expose API keys in frontend code
- Use server-side proxy for all AI requests

### Rate Limiting
Consider implementing rate limiting on the `/api/chatbot` endpoint to prevent abuse.

### Input Validation
- Sanitize user inputs
- Limit message length
- Prevent injection attacks

## Performance Optimization

### Frontend
- Lazy loading of chat component
- Message virtualization for large chat histories
- Debounced input handling

### Backend
- Stateless design for horizontal scaling
- Efficient prompt engineering
- Response caching (optional)

## Monitoring and Analytics

### Metrics to Track
- Chat engagement rates
- Common user queries
- Response accuracy
- API usage and costs

### Logging
- User interactions (anonymized)
- API response times
- Error rates and types

## Deployment Checklist

- [ ] Install backend dependencies
- [ ] Set up environment variables
- [ ] Obtain Google Gemini API key
- [ ] Test chatbot functionality
- [ ] Verify chat history clearing
- [ ] Test error handling
- [ ] Deploy to production
- [ ] Monitor API usage
- [ ] Set up logging and analytics

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify key is correct in `.env`
   - Check Google AI Studio for key status
   - Ensure billing is enabled (if required)

2. **Chat Not Appearing**
   - Check console for JavaScript errors
   - Verify component is imported in App.jsx
   - Check CSS z-index conflicts

3. **Messages Not Sending**
   - Verify backend endpoint is running
   - Check network requests in browser dev tools
   - Confirm CORS settings

4. **Chat History Not Clearing**
   - Verify useEffect cleanup in component
   - Check for memory leaks
   - Test logout/refresh scenarios

## Support

For issues or questions about the chatbot integration, please check:
1. Console logs for error messages
2. Network tab for API request failures
3. Environment variable configuration
4. Google Gemini API documentation

The chatbot is designed to be self-contained and should not interfere with existing StockWisely functionality.