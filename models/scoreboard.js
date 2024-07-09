const mongoose = require('mongoose');

const scoreboardSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Scoreboard', scoreboardSchema);
