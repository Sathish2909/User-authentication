const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true, enum: ['login', 'logout'] }, // Only 'login' or 'logout' actions
  timestamp: { type: Date, required: true }, // Date and time of the action
});

module.exports = mongoose.model('UserActivity', userActivitySchema);
