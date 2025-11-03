
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

const call = (fnName) => (req, res, next) => {
  const fn = userController && userController[fnName];
  if (typeof fn !== 'function') {
    return res.status(500).json({ message: `${fnName} is not available on userController` });
  }
  return fn(req, res, next);
};
router.get('/available-slots', auth('admin'), call('getAvailableCandidateSlots'));

router.get('/', call('getAllCandidates'));
router.delete('/:id', auth('admin'), call('deleteCandidate'));
router.delete('/:candidateId', auth('admin'), call('deleteCandidate')); // back-compat

router.put('/:id', auth('admin'), call('updateCandidate'));
router.post('/assign', auth('admin'), call('assignCandidate'));
router.get('/eligible-students', auth('admin'), call('listEligibleVerifiedStudents'));


module.exports = router;


