import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm StockWisely AI Assistant. I can help you with stock predictions, using the app, understanding features, and answering any questions about our platform. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, [location]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Clear chat history on component unmount (logout/refresh)
  useEffect(() => {
    return () => {
      setMessages([]);
    };
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chatbot', {
        message: inputMessage,
        context: messages.slice(-5), // Send last 5 messages for context
        isAuthenticated: isAuthenticated,
        currentPage: location.pathname
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'bot',
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: error.response?.data?.fallback || "I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Predefined quick questions
  const quickQuestions = [
    ...(isAuthenticated ? [
      "How do I make a stock prediction?",
      "What is the prediction accuracy?",
      "How do I add stocks to my watchlist?",
      "How does sentiment analysis work?"
    ] : [
      "What is this app about?",
      "What features does StockWisely offer?"
    ]),
    "What data sources do you use?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-xl z-50 transition-all duration-300"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl z-50 border border-gray-200 ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
            } transition-all duration-500`}
          >
            {/* Chat Header */}
            <div className="bg-orange-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bot className="h-6 w-6" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <span className="font-bold text-lg">
                    StockWisely AI
                  </span>
                  {!isAuthenticated && <span className="text-xs ml-2 opacity-75">(Limited)</span>}
                  <div className="text-xs opacity-75">Always here to help</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMinimize}
                  className="hover:bg-orange-600 p-2 rounded-lg transition-colors duration-200"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={closeChat}
                  className="hover:bg-orange-600 p-2 rounded-lg transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 h-96 bg-gray-50">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-3 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                          message.sender === 'user' 
                            ? 'bg-orange-500' 
                            : 'bg-white border-2 border-gray-200'
                        }`}>
                          {message.sender === 'user' ? (
                            <User className="h-5 w-5 text-white" />
                          ) : (
                            <Bot className="h-5 w-5 text-orange-500" />
                          )}
                        </div>
                        <div className={`p-4 rounded-2xl shadow-lg ${
                          message.sender === 'user' 
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                          <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-orange-100' : 'text-gray-500'}`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start mb-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-gray-200">
                          <Bot className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-gray-200">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                {messages.length === 1 && (
                  <div className="px-4 py-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-3">
                      {isAuthenticated ? '✨ Quick questions:' : '🚀 Try asking:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.slice(0, 3).map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickQuestion(question)}
                          className="text-xs px-3 py-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-all duration-200 hover:scale-105"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        isAuthenticated 
                          ? "Ask me anything about StockWisely..." 
                          : "Ask about StockWisely features..."
                      }
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      disabled={isLoading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white p-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:scale-100 shadow-lg"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;