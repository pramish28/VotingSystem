const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const image = req.files.find(f => f.fieldname === 'image')?.path;
    const post = new Post({
      userId: req.user.id,
      content,
      image,
      isApproved: req.user.role === 'admin',
    });
    await post.save();
    res.status(201).json({ message: req.user.role === 'admin' ? 'Post created' : 'Post submitted for approval' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isApproved: true }).populate('userId').populate('comments.userId');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

exports.getNews = async (req, res) => {
  try {
    const posts = await Post.find({ isApproved: true, userId: { $in: await User.find({ role: 'admin' }).select('_id') } })
      .populate('userId');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id }).populate('userId').populate('comments.userId');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

exports.approvePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.isApproved = true;
    await post.save();
    res.json({ message: 'Post approved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve post' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to like post' });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.comments.push({ userId: req.user.id, content });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to comment' });
  }
};