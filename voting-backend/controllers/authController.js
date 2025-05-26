const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Notification = require('../models/Notification');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      photo: req.files?.photo?.[0]?.path,
      semesterBill: req.files?.semesterBill?.[0]?.path,
      identityCard: req.files?.identityCard?.[0]?.path,
    });

    await user.save();
    res.status(201).json({ message: 'User registered. Awaiting verification.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ email, role });
    if (!user || !user.isVerified) {
      return res.status(401).json({ error: 'Invalid credentials or unverified account' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, photo: user.photo } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.verifyUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: 'User already verified' });
    }

    const voterId = Math.random().toString(36).substring(2, 10).toUpperCase();
    user.isVerified = true;
    user.voterId = voterId;
    await user.save();

    const notification = new Notification({
      userId: user._id,
      message: `Your account has been verified. Voter ID: ${voterId}`,
    });
    await notification.save();

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Voter ID Credentials',
        text: `Your account has been verified. Your Voter ID is: ${voterId}`,
      });
    } catch (emailErr) {
      console.error('Email sending error:', emailErr);
      return res.status(500).json({ error: 'User verified, but failed to send email. Voter ID saved.' });
    }

    res.json({ message: 'User verified. Credentials sent to email.' });
  } catch (err) {
    console.error('Verify user error:', err);
    res.status(500).json({ error: 'Failed to verify user' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};