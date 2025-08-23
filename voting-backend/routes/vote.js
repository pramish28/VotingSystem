// const express = require('express');
// const router = express.Router();
// const voteController = require('../controllers/voteController');
// const authMiddleware = require('../middleware/auth');

// router.post('/submit', authMiddleware, voteController.submitVote);
// router.post('/confirm', authMiddleware, voteController.confirmVote);
// router.get('/results', voteController.getResults);

// module.exports = router;
const router = require('express').Router();
const auth = require('../middleware/auth'); // if you protect voting
const voteController = require('../controllers/voteController');

router.post('/', /*auth,*/ voteController.submitVote);
router.post('/confirm', /*auth,*/ voteController.confirmVote);
router.get('/results', voteController.getResults);

module.exports = router;
