const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Debug logs to verify imports
console.log('authController:', authController);
console.log('authMiddleware:', authMiddleware);

// Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authMiddleware, authController.getUsers);
router.post('/verify/:id', authMiddleware, authController.verifyUser);
router.get('/me', authMiddleware, authController.getMe);
router.get('/user', authMiddleware, authController.getMe); // Changed to use getMe
router.get('/voting-history', authMiddleware, authController.getVotingHistory);

module.exports = router;