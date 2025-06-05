const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const authMiddleware = require('../middleware/auth');

router.post('/submit', authMiddleware, voteController.submitVote);
router.post('/confirm', authMiddleware, voteController.confirmVote);
router.get('/results', voteController.getResults);

module.exports = router;