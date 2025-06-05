const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  degree: { type: String, required: true },
  faculty: { type: String, required: true },
  program: { type: String, required: true },
  major: { type: String },
  yearOrSemester: { type: String, required: true },
  symbolNumber: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  photo: { type: String, required: true },
  semesterBill: { type: String, required: true },
  identityCard: { type: String, required: true },
  voterId: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    resultNotifications: { type: Boolean, default: true },
  },
  hasVoted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);