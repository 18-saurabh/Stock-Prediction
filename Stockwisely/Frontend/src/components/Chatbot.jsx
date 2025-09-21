import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
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

  // Theme classes
  const themeClasses = {
    chatWindow: isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 border-purple-500/30' 
      : 'bg-gradient-to-br from-white via-blue-50 to-purple-50 border-blue-200',
    header: isDarkMode 
      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
      : 'bg-gradient-to-r from-blue-500 to-purple-600',
    messagesArea: isDarkMode 
      ? 'bg-gray-800/50' 
      : 'bg-white/70',
    userMessage: isDarkMode 
      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
    botMessage: isDarkMode 
      ? 'bg-gray-700 text-gray-100 border-gray-600' 
      : 'bg-white text-gray-800 border-gray-200',
    input: isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500',
    quickButton: isDarkMode 
      ? 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50' 
      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
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
            className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl z-50 transition-all duration-300"
            style={{
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)',
            }}
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
            className={`fixed bottom-6 right-6 rounded-2xl shadow-2xl z-50 border-2 backdrop-blur-sm ${themeClasses.chatWindow} ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
            } transition-all duration-500`}
            style={{
              boxShadow: isDarkMode 
                ? '0 25px 50px rgba(147, 51, 234, 0.3)' 
                : '0 25px 50px rgba(59, 130, 246, 0.3)',
            }}
          >
            {/* Chat Header */}
            <div className={`${themeClasses.header} text-white p-4 rounded-t-2xl flex items-center justify-between`}>
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
                  onClick={toggleDarkMode}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors duration-200"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button
                  onClick={toggleMinimize}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors duration-200"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={closeChat}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className={`flex-1 overflow-y-auto p-4 h-96 ${themeClasses.messagesArea} backdrop-blur-sm`}>
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
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                            : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          {message.sender === 'user' ? (
                            <User className="h-5 w-5 text-white" />
                          ) : (
                            <Bot className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                          )}
                        </div>
                        <div className={`p-4 rounded-2xl shadow-lg border ${
                          message.sender === 'user' 
                            ? themeClasses.userMessage
                            : themeClasses.botMessage
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                          <p className={`text-xs mt-2 opacity-70`}>
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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <Bot className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                        </div>
                        <div className={`p-4 rounded-2xl border ${themeClasses.botMessage}`}>
                          <div className="flex space-x-2">
                            <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-purple-400' : 'bg-blue-400'}`}></div>
                            <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-purple-400' : 'bg-blue-400'}`} style={{ animationDelay: '0.1s' }}></div>
                            <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-purple-400' : 'bg-blue-400'}`} style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                {messages.length === 1 && (
                  <div className="px-4 py-3 border-t border-opacity-20">
                    <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {isAuthenticated ? '✨ Quick questions:' : '🚀 Try asking:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.slice(0, 3).map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickQuestion(question)}
                          className={`text-xs px-3 py-2 rounded-full transition-all duration-200 hover:scale-105 ${themeClasses.quickButton}`}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-opacity-20">
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
                      className={`flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${themeClasses.input}`}
                      disabled={isLoading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:scale-100 shadow-lg"
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

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default Chatbot;