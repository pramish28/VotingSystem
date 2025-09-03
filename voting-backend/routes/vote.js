const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  submitVote,
  confirmVote,
  confirmAllVotes,
  getResults,
  deleteMyVotesForElection, 
  exportResultsPdf,
  exportAllElectionsPdf,
  shareResultsSummaryPdf,

  // optional helper
} = require('../controllers/voteController');

router.post('/', submitVote);
router.post('/confirm', confirmVote);
router.post('/confirm-all', confirmAllVotes);
router.get('/results', getResults);

// Optional: reset my votes for one election (useful for testing)
router.delete('/by-election/:electionId', auth, deleteMyVotesForElection);


router.get('/results/export.pdf', auth('admin'), exportResultsPdf);
router.get('/results/export-all.pdf', auth('admin'), exportAllElectionsPdf);
router.post('/results/share-summary-pdf', auth('admin'), shareResultsSummaryPdf);



module.exports = router;
