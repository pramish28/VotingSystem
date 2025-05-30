const express = require('express');
const router = express.Router();


// Import your Mongoose models
const User = require('../models/User');
const Post = require('../models/Post');
const Election = require('../models/Election');
const Vote = require('../models/Vote');



router.get('/stats', async (req, res) => {
  try {
    // Use Mongoose to count documents
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    console.log('Verified Users:', verifiedUsers);//debugging line
    const pendingStudents = await User.countDocuments({ isVerified: false });
    const activePosts = await Post.countDocuments({ status: 'approved' });
    const activeElections = await Election.countDocuments({ status: 'active' });
    const totalVotes = await Vote.countDocuments();

    res.json({
      verifiedUsers,
      pendingStudents,
      activePosts,
      activeElections,
      totalVotes
    });

  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router;
