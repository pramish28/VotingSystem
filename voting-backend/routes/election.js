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
  listAllElections,       // 👈 new
  listVerifiedStudents,   // 👈 new (optional)
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

// 👇 NEW: ResultPage uses this (harmless for others)
router.get('/', listAllElections);

// 👇 OPTIONAL: to power a “pick verified student” autocomplete later
router.get('/verified-students', authMiddleware, listVerifiedStudents);

module.exports = router;

