const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');      // <-- factory: call it!
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
  listAllElections,
  listVerifiedStudents,
  getElectionProbabilityById,
  getCurrentElectionProbability,
} = require('../controllers/electionController');

/* ----------------------- Admin-only ----------------------- */
router.post('/create', auth('admin'), upload.any(), createElection);

/* ----------------------- Public / Mixed ----------------------- */
router.get('/candidates', getCandidates);
router.get('/news', getElectionNews);
router.get('/news/more', getMoreNews);
router.get('/stats', getElectionStats);
router.get('/', listAllElections);

/* ----------------------- Auth-required ----------------------- */
router.get('/available', auth(), getAvailableElections);
router.get('/current-candidates', auth(), getCurrentElectionCandidates);
router.get('/:id/candidates', auth(), getElectionCandidatesById);

// Probability (public)
router.get('/probability', getCurrentElectionProbability);
router.get('/:id/probability', getElectionProbabilityById);

// Optional student selector (auth-required)
router.get('/verified-students', auth(), listVerifiedStudents);

module.exports = router;
