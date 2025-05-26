const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, electionController.createElection);
router.get('/', electionController.getElections);
router.post('/candidates', authMiddleware, electionController.addCandidate);
router.get('/candidates', electionController.getCandidates);

module.exports = router;