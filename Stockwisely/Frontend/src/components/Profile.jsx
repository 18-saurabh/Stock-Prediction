import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  User, 
  Mail, 
  Calendar, 
  Star, 
  TrendingUp, 
  Activity, 
  Settings, 
  Edit3, 
  Download,
  Eye,
  EyeOff,
  Bell,
  Moon,
  Sun,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import Navbar from "../components/Navbar"; 

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [activity, setActivity] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const email = localStorage.getItem("userEmail") || "user@example.com";
    
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileRes = await axios.get(`http://localhost:5000/api/user/profile/${email}`);
      setUserProfile(profileRes.data);
      setFormData({
        username: profileRes.data.username,
        email: profileRes.data.email,
        newPassword: '',
        confirmPassword: ''
      });
      
      // Fetch predictions
      const predictionsRes = await axios.get(`http://localhost:5000/api/user/predictions/${email}`);
      setPredictions(predictionsRes.data.predictions);
      
      // Fetch activity
      const activityRes = await axios.get(`http://localhost:5000/api/user/activity/${email}`);
      setActivity(activityRes.data);
      
      // Fetch watchlist
      const watchlistRes = await axios.get(`http://localhost:5000/watchlist/${email}`);
      setWatchlist(watchlistRes.data.watchlist || []);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      setMessage("Please log in first.");
      return;
    }

    try {
      await axios.put(
        "http://localhost:5000/api/user/profile", 
        { 
          email: userProfile.email, 
          username: formData.username,
          newEmail: formData.email
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (formData.newPassword) {
        await axios.post(
          "http://localhost:5000/api/user/update-password", 
          { email: userProfile.email, password: formData.newPassword }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      setMessage("Profile updated successfully!");
      setEditMode(false);
      fetchUserData();
    } catch (error) {
      console.error("Error updating profile", error);
      setMessage("Error updating profile");
    }
  };

  const removeFromWatchlist = async (ticker) => {
    try {
      await axios.post('http://localhost:5000/watchlist/remove', {
        email: userProfile.email,
        ticker
      });
      setWatchlist(watchlist.filter(stock => stock.ticker !== ticker));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const exportData = () => {
    const data = {
      profile: userProfile,
      predictions,
      watchlist,
      activity
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stockwisely-data.json';
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-300 rounded-xl"></div>
              <div className="h-64 bg-gray-300 rounded-xl"></div>
              <div className="h-64 bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userProfile?.username}!
              </h1>
              <p className="text-gray-600">Manage your StockWisely account and preferences</p>
            </div>
          </div>
          
          {/* <div className="flex space-x-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
            <button
              onClick={exportData}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div> */}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            // { id: 'predictions', label: 'Predictions', icon: TrendingUp },
            // { id: 'watchlist', label: 'Watchlist', icon: Star },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">{userProfile?.username}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{userProfile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">
                      {new Date(userProfile?.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            {/* <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Activity Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Predictions</span>
                  <span className="font-bold text-orange-500">{activity?.totalPredictions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-bold text-green-500">
                    {activity ? Math.round((activity.successfulPredictions / activity.totalPredictions) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">News Searches</span>
                  <span className="font-bold text-blue-500">{activity?.newsSearches}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Accuracy</span>
                  <span className="font-bold text-purple-500">{activity?.avgAccuracy}%</span>
                </div>
              </div>
            </div> */}

            {/* Portfolio Performance */}
            {/* <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Portfolio Performance</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activity?.portfolioPerformance || []}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Portfolio Value']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">Current Portfolio Value</p>
                <p className="text-2xl font-bold text-orange-500">
                  ${activity?.portfolioPerformance?.[activity.portfolioPerformance.length - 1]?.value || 0}
                </p>
              </div>
            </div> */}
          </div>
        )}

        {/* {activeTab === 'predictions' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">My Predictions</h3>
            {predictions && predictions.length > 0 ? (
              <div className="space-y-4">
                {predictions.map((prediction, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{prediction.ticker}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(prediction.createdAt).toLocaleDateString()} at {new Date(prediction.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-500">
                          ${prediction.predictedPrice?.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          for {new Date(prediction.predictionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          prediction.accuracy > 80 ? 'bg-green-100 text-green-800' :
                          prediction.accuracy > 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {prediction.accuracy ? `${(100 - prediction.accuracy).toFixed(1)}% Accuracy` : 'Calculating...'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          prediction.result === 'success' ? 'bg-green-100 text-green-800' :
                          prediction.result === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {prediction.result === 'success' ? 'Success' :
                           prediction.result === 'failed' ? 'Failed' : 'Pending'}
                        </span>
                      </div>
                      
                      {prediction.graphPath && (
                        <button
                          onClick={() => window.open(`http://localhost:5000/${prediction.graphPath}`, '_blank')}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                        >
                          View Chart
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No predictions yet</p>
                <p className="text-gray-400 text-sm mt-2">Make your first stock prediction to see it here</p>
                <button
                  onClick={() => navigate('/home')}
                  className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Make a Prediction
                </button>
              </div>
            )}
          </div>
        )} */}

        {/* {activeTab === 'predictions' && predictions && predictions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Prediction Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">{predictions.length}</div>
                <div className="text-gray-600">Total Predictions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">
                  {predictions.filter(p => p.result === 'success').length}
                </div>
                <div className="text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">
                  {predictions.length > 0 ? 
                    Math.round((predictions.reduce((sum, p) => sum + (100 - (p.accuracy || 0)), 0) / predictions.length) * 100) / 100 
                    : 0}%
                </div>
                <div className="text-gray-600">Avg Accuracy</div>
              </div>
            </div>
          </div>
        )} */}

        {/* {activeTab === 'watchlist' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Your Watchlist</h3>
              <button
                onClick={() => navigate('/watchlist')}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Manage Watchlist
              </button>
            </div>
            
            {watchlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlist.map((stock, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{stock.ticker}</h4>
                      <button
                        onClick={() => removeFromWatchlist(stock.ticker)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{stock.companyName}</p>
                    <p className="text-lg font-bold text-orange-500">
                      ${stock.currentPrice?.toFixed(2) || stock.prices?.[stock.prices.length - 1]?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Your watchlist is empty</p>
                <button
                  onClick={() => navigate('/watchlist')}
                  className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Stocks to Watchlist
                </button>
              </div>
            )}
          </div>
        )} */}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h3>
              
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none pr-10"
                        placeholder="Leave blank to keep current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleProfileUpdate}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {message && (
                    <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                      {message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Username</span>
                    <span className="font-medium">{userProfile?.username}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium">{userProfile?.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Password</span>
                    <span className="font-medium">••••••••</span>
                  </div>
                </div>
              )}
            </div>

            {/* Preferences */}
            {/* <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Preferences</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Notifications</p>
                      <p className="text-sm text-gray-500">Receive email notifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {darkMode ? <Moon className="h-5 w-5 text-orange-500" /> : <Sun className="h-5 w-5 text-orange-500" />}
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-gray-500">Toggle dark theme</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      darkMode ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;