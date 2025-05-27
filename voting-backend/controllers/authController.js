// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Notification = require('../models/notification');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.register = async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);

  const { name, email, password, role = 'student', faculty, program, major } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password || !faculty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate required files
    if (
      !req.files ||
      !req.files.photo ||
      !req.files.semesterBill ||
      !req.files.identityCard
    ) {
      return res.status(400).json({ error: 'All file uploads (photo, semesterBill, identityCard) are required' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      faculty,
      program,
      major: major || null,
      photo: req.files.photo[0].path,
      semesterBill: req.files.semesterBill[0].path,
      identityCard: req.files.identityCard[0].path,
    });

    await user.save();
    res.status(201).json({ message: 'User registered. Awaiting verification.' });
  } catch (err) {
    console.error('Register error:', err);
    if (err.name === 'MulterError') {
      return res.status(400).json({ error: 'File upload error', details: err.message });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isVerified = true;
    await user.save();
    res.json({ message: 'User verified' });
  } catch (err) {
    console.error('Verify user error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

module.exports = {
  register: exports.register,
  login: exports.login,
  getUsers: exports.getUsers,
  verifyUser: exports.verifyUser,
  getMe: exports.getMe,
};