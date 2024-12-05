const mongoose = require('mongoose');
const moment = require('moment-timezone'); // Import moment-timezone to handle timezone conversion

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['login', 'logout'], required: true },
  // Explicitly set timestamp using moment to store in IST timezone
  timestamp: {
    type: Date,
    default: () => moment().tz('Asia/Kolkata').toDate(), // Save the timestamp in IST
  },
});

module.exports = mongoose.model('UserActivity', userActivitySchema);
