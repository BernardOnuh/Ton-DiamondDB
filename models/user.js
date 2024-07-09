const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  inviterId: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: false,
  },
  balance: {
    type: Number,
    default: 0,
  },
  realGameBalance: {
    type: Number,
    default: 0,
  },
  dashboardId: {
    type: String,
    required: true,
    unique: true,
  },
  walletAddress: {
    type: String,
    required: false,
  },
  invitedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  score: {
    type: Number,
    default: 0,
  },
});

// Model
module.exports = mongoose.model('User', userSchema);
