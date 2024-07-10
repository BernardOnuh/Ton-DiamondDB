const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  inviterUsername: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  referralBalance: {
    type: Number,
    default: 0,
  },
  gameBalance: {
    type: Number,
    default: 0,
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
