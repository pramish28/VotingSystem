const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vote = require('../models/Vote'); // Added missing import
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');

// ===== File Upload Setup =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowedTypes.test(file.mimetype);
    if (extValid && mimeValid) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .jpeg, .png files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'semesterBill', maxCount: 1 },
  { name: 'identityCard', maxCount: 1 },
  { name: 'data', maxCount: 1 },
]);

// ===== Email Setup =====
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ===== REGISTER =====
const register = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err.message);
      return res.status(400).json({ error: err.message });
    }

    try {
      const data = JSON.parse(req.body.data || '{}');
      const {
        name,
        email,
        password,
        degree,
        faculty,
        program,
        major,
        yearOrSemester,
        symbolNumber,
        phoneNumber,
        address,
      } = data;

      // === Validate Fields ===
      if (
        !name ||
        !email ||
        !password ||
        !degree ||
        !faculty ||
        !program ||
        !yearOrSemester ||
        !symbolNumber ||
        !phoneNumber ||
        !address ||
        !req.files?.photo ||
        !req.files?.semesterBill ||
        !req.files?.identityCard
      ) {
        return res.status(400).json({ error: 'All required fields and files are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

              // === Check Duplicate ===
          const existingUser = await User.findOne({
          $or: [
            { email },
            { symbolNumber },
            { phoneNumber }
          ]
          });

          if (existingUser) {
          // Figure out which field is duplicate
          let duplicateField = '';
          if (existingUser.email === email) duplicateField = 'Email';
          else if (existingUser.symbolNumber === symbolNumber) duplicateField = 'Symbol Number';
          else if (existingUser.phoneNumber === phoneNumber) duplicateField = 'Phone Number';

          return res.status(400).json({ error: `${duplicateField} already exists` });
          }


      // === Hash Password ===
      const hashedPassword = await bcrypt.hash(password, 12);

      // === Create Voter ID ===
      const voterId = `VOTE-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 'student',
        degree,
        faculty,
        program,
        major: major || '',
        yearOrSemester,
        symbolNumber,
        phoneNumber,
        address,
        photo: req.files.photo[0].path,
        semesterBill: req.files.semesterBill[0].path,
        identityCard: req.files.identityCard[0].path,
        voterId,
        preferences: { emailNotifications: true, smsAlerts: false, resultNotifications: true },
      });

      await newUser.save();
      res.status(201).json({ message: 'Registration successful. Awaiting verification.' });
    } catch (error) {
      console.error('Register error:', error.message);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  });
};

// ===== LOGIN =====
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    console.log('User:', req.body, user);

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Account not verified. Please contact the admin for verification.' });
    }
    if (!user.password) {
      return res.status(400).json({ error: 'No password set for this user' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        photo: user.photo,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// ===== GET ALL USERS =====
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// ===== VERIFY USER =====
const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User already verified' });
    }

    user.isVerified = true;
    await user.save();

    // Send voter ID
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Voter ID',
      text: `Your Voter ID is: ${user.voterId}`,
    });

    res.json({ message: 'User verified and voter ID sent' });
  } catch (error) {
    console.error('Verify user error:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// ===== GET ME =====
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};


// ===== GET VOTING HISTORY =====
const getVotingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const votes = await Vote.find({ userId })
      .populate({
        path: 'candidateId',
        select: 'name position',
      })
      .populate({
        path: 'electionId',
        select: 'title',
      });
    const history = votes.map(vote => ({
      election: vote.electionId ? vote.electionId.title : 'Unknown',
      date: vote.createdAt.toISOString().split('T')[0],
      status: 'Completed',
      statusColor: 'bg-green-500',
      candidate: vote.candidateId ? vote.candidateId.name : 'Unknown',
    }));
    res.json(history);
  } catch (err) {
    console.error('Get voting history error:', err.message);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
};

module.exports = { register, login, getUsers, verifyUser, getMe, getVotingHistory };