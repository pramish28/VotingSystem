const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, voteController.vote);
router.post('/confirm', authMiddleware, voteController.confirmVote);
router.get('/results', voteController.getResults);

module.exports = router;