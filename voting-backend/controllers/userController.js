const User = require('../models/User');

exports.getVerifiedUsers = async (req, res) => {
  try {
    const verifiedUsers = await User.find({ isVerified: true }).select('name email role');
    res.json(verifiedUsers);
  } catch (error) {
    console.error('Error fetching verified users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
