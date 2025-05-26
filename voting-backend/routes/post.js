const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, postController.createPost);
router.get('/', postController.getPosts);
router.get('/news', postController.getNews);
router.get('/my-posts', authMiddleware, postController.getMyPosts);
router.post('/:id/approve', authMiddleware, postController.approvePost);
router.post('/:id/like', authMiddleware, postController.likePost);
router.post('/:id/comment', authMiddleware, postController.commentPost);

module.exports = router;