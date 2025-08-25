const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  submitVote,
  confirmVote,
  confirmAllVotes,
  getResults,
  deleteMyVotesForElection, // optional helper
} = require('../controllers/voteController');

router.post('/', submitVote);
router.post('/confirm', confirmVote);
router.post('/confirm-all', confirmAllVotes);
router.get('/results', getResults);

// Optional: reset my votes for one election (useful for testing)
router.delete('/by-election/:electionId', auth, deleteMyVotesForElection);

module.exports = router;
