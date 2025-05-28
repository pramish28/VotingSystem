const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  faculty: { type: String, required: true },
  program: { type: String },
  major: { type: String },
  photo: { type: String },
  semesterBill: { type: String },
  identityCard: { type: String },
  voterId: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String }, // New field for verification code
});

module.exports = mongoose.model('User', userSchema);