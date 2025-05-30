// models/User.js
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
  photo: { type: String, required: true },
  semesterBill: { type: String, required: true },
  identityCard: { type: String, required: true },
  voterId: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  }, { timestamps: true});

// // Hash password before saving
// userSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

module.exports = mongoose.model('User', userSchema);