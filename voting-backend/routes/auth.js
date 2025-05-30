// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Debug logs to verify imports
console.log('authController:', authController);
console.log('authMiddleware:', authMiddleware);

// Register route
router.post('/register', (req, res, next) => {
  console.log('Register route hit');
  authController.register(req, res, next);
});

// Other routes
router.post('/login', (req, res, next) => {
  console.log('Login route hit');
  authController.login(req, res, next);
});
router.get('/users', authMiddleware, (req, res, next) => {
  console.log('Users route hit');
  authController.getUsers(req, res, next);
});
router.post('/verify/:id', authMiddleware, (req, res, next) => {
  console.log('Verify route hit');
  authController.verifyUser(req, res, next);
});
router.get('/me', authMiddleware, (req, res, next) => {
  console.log('Me route hit');
  authController.getMe(req, res, next);
});

module.exports = router;