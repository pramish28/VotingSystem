const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authMiddleware, authController.getUsers);
router.post('/verify/:id', authMiddleware, authController.verifyUser);
router.get('/me', authMiddleware, authController.getMe);

router.post(
    '/register',
    upload.fields([
      { name: 'photo', maxCount: 1 },
      { name: 'semesterBill', maxCount: 1 },
      { name: 'identityCard', maxCount: 1 },
    ]),
    authController.register
  );

module.exports = router;