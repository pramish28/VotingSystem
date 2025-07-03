// const express = require('express');
// const router = express.Router();
// const postController = require('../controllers/postController');
// const authMiddleware = require('../middleware/auth');
// const upload = require('../middleware/upload');


// console.log('postController:', postController);


// router.post('/', authMiddleware, postController.createPost);

// router.get('/', postController.getPosts);
// router.get('/news', postController.getNews);
// router.get('/my-posts', authMiddleware, postController.getMyPosts);
// router.post('/:id/approve', authMiddleware, postController.approvePost);
// router.post('/:id/like', authMiddleware, postController.likePost);
// router.post('/:id/comment', authMiddleware, postController.commentPost);
// router.post('/', authMiddleware, upload.fields([{ name: 'image', maxCount: 1 }]), postController.createPost);

// module.exports = router;

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', authMiddleware, upload.single('image'), postController.createPost);
router.get('/', postController.getPosts);
router.get('/news', postController.getNews);
router.get('/my-posts', authMiddleware, postController.getMyPosts);
router.post('/:id/approve', authMiddleware, postController.approvePost);
router.post('/:id/like', authMiddleware, postController.likePost);
router.post('/:id/dislike', authMiddleware, postController.dislikePost);
router.post('/:id/comment', authMiddleware, postController.commentPost);
router.get('/all-approved', postController.getAllApprovedPosts); // ✅ new route
router.get('/pending', authMiddleware, postController.getPendingPosts);
router.delete('/:id', authMiddleware, postController.rejectPost);


module.exports = router;