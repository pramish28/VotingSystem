// // voting-backend/routes/election.js
// const express = require('express');
// const router = express.Router();

// const auth = require('../middleware/auth');          // your token-verifying middleware
// const upload = require('../middleware/upload');      // your multer setup

// const {
//   getCandidates,
//   getElectionNews,
//   getMoreNews,
//   getElectionStats,
//   createElection,
//   getCurrentElectionCandidates,
//   getElectionCandidatesById,
//   getAvailableElections,
//   listAllElections,
//   listVerifiedStudents,
//   getElectionProbabilityById,
//   getCurrentElectionProbability,
// } = require('../controllers/electionController');

// // Simple role guard stacked AFTER auth
// const requireAdmin = (req, res, next) => {
//   if (!req.user || req.user.role !== 'admin') {
//     return res.status(403).json({ error: 'Forbidden: admin only' });
//   }
//   next();
// };

// /* ----------------------- Admin-only ----------------------- */
// // Create election
// router.post('/create', auth, requireAdmin, upload.any(), createElection);

// /* ----------------------- Public / Mixed ----------------------- */
// // Candidates / results / stats / news
// router.get('/candidates', getCandidates);
// router.get('/news', getElectionNews);
// router.get('/news/more', getMoreNews);
// router.get('/stats', getElectionStats);
// router.get('/', listAllElections);

// /* ----------------------- Auth-required ----------------------- */
// router.get('/available', auth, getAvailableElections);
// router.get('/current-candidates', auth, getCurrentElectionCandidates);
// router.get('/:id/candidates', auth, getElectionCandidatesById);

// // Probability (public)
// router.get('/probability', getCurrentElectionProbability);
// router.get('/:id/probability', getElectionProbabilityById);

// // Optional student selector (auth-required)
// router.get('/verified-students', auth, listVerifiedStudents);

// module.exports = router;

// voting-backend/routes/election.js
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
