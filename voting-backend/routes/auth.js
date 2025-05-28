const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Debug logs to verify imports
console.log('authController:', authController);
console.log('authMiddleware:', authMiddleware);
console.log('upload:', upload);

// Register route
router.post(
  '/register',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'semesterBill', maxCount: 1 },
    { name: 'identityCard', maxCount: 1 },
  ]),
  (req, res, next) => {
    console.log('Register route hit');
    authController.register(req, res, next);
  }
);

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