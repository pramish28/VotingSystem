
// voting-backend/routes/election.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');      // factory -> call like auth('admin')
const upload = require('../middleware/upload');

// ✅ Destructure the handlers you actually use
const {
  getCandidates,
  getElectionNews,
  getMoreNews,
  getElectionStats,
  createElection,
  getCurrentElectionCandidates,
  getElectionCandidatesById,
  getAvailableElections,
  listAllElections,
  listVerifiedStudents,
  getElectionProbabilityById,
  getCurrentElectionProbability,
  deleteElectionById,
} = require('../controllers/electionController');

/* ----------------------- Admin-only ----------------------- */
router.post('/create', auth('admin'), upload.any(), createElection);
router.delete('/:id', auth('admin'), deleteElectionById);

/* ----------------------- Public / Mixed ----------------------- */
router.get('/candidates', getCandidates);
router.get('/news', getElectionNews);
router.get('/news/more', getMoreNews);
router.get('/stats', getElectionStats);
router.get('/', listAllElections);

// Probability (public)
router.get('/probability', getCurrentElectionProbability);
router.get('/:id/probability', getElectionProbabilityById);

/* ----------------------- Auth-required ----------------------- */
router.get('/available', auth(), getAvailableElections);
router.get('/current-candidates', auth(), getCurrentElectionCandidates);
router.get('/:id/candidates', auth(), getElectionCandidatesById);

// Optional student selector (auth-required)
router.get('/verified-students', auth(), listVerifiedStudents);

module.exports = router;
