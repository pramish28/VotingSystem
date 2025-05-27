// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], required: true, default: 'student' },
  faculty: { type: String, required: true },
  program: { type: String, required: true },
  major: { type: String },
  photo: { type: String, required: true },
  semesterBill: { type: String, required: true },
  identityCard: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  voterId: { type: String },
});

module.exports = mongoose.model('User', userSchema);