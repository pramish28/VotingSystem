
// const express = require('express');
// const router = express.Router();

// // ✅ import the controller function
// const { getElectionStats } = require('../controllers/electionController');

// // Student dashboard stats passthrough
// router.get('/student-stats', getElectionStats);

// module.exports = router;


// voting-backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const User = require('../models/User');
const Post = require('../models/Post');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const Notification = require('../models/Notification'); // ok if unused fields; countDocuments() will just return 0

// Small role guard to stack after auth
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin only' });
  }
  next();
};

// Helper to compute "active elections" robustly (status OR future endDate)
async function getActiveElectionCount() {
  const now = new Date();
  const [byStatus, byEndDate] = await Promise.all([
    Election.countDocuments({ status: 'active' }).catch(() => 0),
    Election.countDocuments({ endDate: { $gte: now } }).catch(() => 0),
  ]);
  return byStatus || byEndDate || 0;
}

// Helper to compute "active posts" robustly (approved OR isActive OR any)
async function getActivePostCount() {
  const [approved, isActive, any] = await Promise.all([
    Post.countDocuments({ status: 'approved' }).catch(() => 0),
    Post.countDocuments({ isActive: true }).catch(() => 0),
    Post.countDocuments({}).catch(() => 0),
  ]);
  return approved || isActive || any || 0;
}

/**
 * GET /api/dashboard/stats
 * Admin dashboard summary
 * Returns: { verifiedUsers, pendingStudents, activePosts, activeElections, totalVotes }
 */
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const [verifiedUsers, pendingStudents, activePosts, activeElections, totalVotes] =
      await Promise.all([
        User.countDocuments({ isVerified: true, role: { $ne: 'admin' } }).catch(() => 0),
        User.countDocuments({ isVerified: false, role: { $ne: 'admin' } }).catch(() => 0),
        getActivePostCount(),
        getActiveElectionCount(),
        Vote.countDocuments({}).catch(() => 0),
      ]);

    res.json({ verifiedUsers, pendingStudents, activePosts, activeElections, totalVotes });
  } catch (err) {
    console.error('Admin /stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/dashboard/student-stats
 * Student dashboard summary
 * Returns: { totalPosts, activeElections, totalVotes, unreadNews }
 */
router.get('/student-stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalPosts, activeElections, totalVotesByUser, unreadNews] = await Promise.all([
      // Posts available to students (fallbacks built in)
      getActivePostCount(),
      getActiveElectionCount(),
      // Count votes by this user (adjust if you prefer global votes instead)
      Vote.countDocuments({ user: userId }).catch(() => 0),
      // Notifications for this user (supports either "user" or "recipient" field + read flag)
      Notification.countDocuments({
        $or: [{ user: userId }, { recipient: userId }],
        read: false,
      }).catch(() => 0),
    ]);

    res.json({
      totalPosts,
      activeElections,
      totalVotes: totalVotesByUser,
      unreadNews,
    });
  } catch (err) {
    console.error('Student /student-stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

