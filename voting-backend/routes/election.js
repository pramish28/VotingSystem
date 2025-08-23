// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/auth');
// const upload = require('../middleware/upload');

// const {
//   getCandidates,
//   getElectionNews,
//   getMoreNews,
//   getElectionStats,
//   createElection,
//   getCurrentElectionCandidates,
//   getElectionCandidatesById,
//   getAvailableElections,
// } = require('../controllers/electionController');

// // Create election (admin)
// router.post('/create', authMiddleware, upload.any(), createElection);

// // Legacy candidates (if used elsewhere)
// router.get('/candidates', getCandidates);

// // ✅ NEW — must exist for your VotingPage list
// router.get('/available', authMiddleware, getAvailableElections);

// // ✅ Used by VotingPage when you open a specific ballot
// router.get('/current-candidates', authMiddleware, getCurrentElectionCandidates);
// router.get('/:id/candidates', authMiddleware, getElectionCandidatesById);

// // News & stats
// router.get('/news', getElectionNews);
// router.get('/news/more', getMoreNews);
// router.get('/stats', getElectionStats);

// module.exports = router;

// routes/election.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
  getCandidates,
  getElectionNews,
  getMoreNews,
  getElectionStats,
  createElection,
  getCurrentElectionCandidates,
  getElectionCandidatesById,
  getAvailableElections,
} = require('../controllers/electionController');

// Create election (admin)
router.post('/create', authMiddleware, upload.any(), createElection);

// Legacy list used elsewhere
router.get('/candidates', getCandidates);

// NEW for VotingPage
router.get('/available', authMiddleware, getAvailableElections);
router.get('/current-candidates', authMiddleware, getCurrentElectionCandidates);
router.get('/:id/candidates', authMiddleware, getElectionCandidatesById);

// News & stats
router.get('/news', getElectionNews);
router.get('/news/more', getMoreNews);
router.get('/stats', getElectionStats);

module.exports = router;

