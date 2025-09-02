// const express = require('express');
// const router = express.Router();
// const postController = require('../controllers/postController');
// const authMiddleware = require('../middleware/auth');
// const upload = require('../middleware/upload');

// router.post('/', authMiddleware, upload.single('image'), postController.createPost);
// router.get('/', postController.getPosts);
// router.get('/news', postController.getNews);
// router.get('/my-posts', authMiddleware, postController.getMyPosts);
// router.post('/:id/approve', authMiddleware, postController.approvePost);
// router.post('/:id/like', authMiddleware, postController.likePost);
// router.post('/:id/dislike', authMiddleware, postController.dislikePost);
// router.post('/:id/comment', authMiddleware, postController.commentPost);
// router.get('/all-approved', postController.getAllApprovedPosts); // ✅ new route
// router.get('/pending', authMiddleware, postController.getPendingPosts);
// router.delete('/:id', authMiddleware, postController.rejectPost);


// module.exports = router;


// voting-backend/routes/post.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');      // invoke as auth() / auth('admin')
const upload = require('../middleware/upload');
const postController = require('../controllers/postController');

// Optional tiny wrapper so thrown async errors hit your global error handler
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Create (student or admin) → pending unless admin
router.post('/', auth(), upload.single('image'), wrap(postController.createPost));

// Public reads
router.get('/', wrap(postController.getPosts));
router.get('/news', wrap(postController.getNews));
router.get('/all-approved', wrap(postController.getAllApprovedPosts));

// Authenticated reads
router.get('/my-posts', auth(), wrap(postController.getMyPosts));

// Admin-only moderation
router.get('/pending', auth('admin'), wrap(postController.getPendingPosts));
router.post('/:id/approve', auth('admin'), wrap(postController.approvePost));
router.delete('/:id', auth('admin'), wrap(postController.rejectPost));

// Reactions / comments (auth’d users)
router.post('/:id/like', auth(), wrap(postController.likePost));
router.post('/:id/dislike', auth(), wrap(postController.dislikePost));
router.post('/:id/comment', auth(), wrap(postController.commentPost));

router.delete('/:id/force', auth('admin'), wrap(postController.adminDeletePost));


module.exports = router;
