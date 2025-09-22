const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  watchlist: [
    {
      ticker: String,
      companyName: String,
      prices: [Number], 
      dates: [String],
    },
  ],
  predictions: [
    {
      ticker: String,
      predictionDate: String,
      predictedPrice: Number,
      accuracy: Number,
      graphPath: String,
      createdAt: { type: Date, default: Date.now },
      result: String // 'pending', 'success', 'failed'
    }
  ],
  preferences: {
    darkMode: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
