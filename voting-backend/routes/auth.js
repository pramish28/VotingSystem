
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);

// ✅ call the factory:
router.get('/users', auth(), authController.getUsers);
router.post('/verify/:id', auth('admin'), authController.verifyUser);
router.get('/me', auth(), authController.getMe);
router.get('/user', auth(), authController.getMe);
router.get('/voting-history', auth(), authController.getVotingHistory);

router.post('/change-password', auth(), authController.changePassword);
router.post('/admin/reset-password', auth('admin'), authController.adminResetPassword);


module.exports = router;
