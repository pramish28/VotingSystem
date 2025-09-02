const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: String, required: true },       // who performed the action
  type: { type: String, required: true },       // e.g., 'student_deleted'
  message: { type: String, required: true },    // human-readable message
  timestamp: { type: Date, default: Date.now }  // when the action happened
});

module.exports = mongoose.model('Activity', activitySchema);