const Post = require('../models/Post');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  try {
    console.log('✅ POST /api/post called');
    console.log('➡️ req.user:', req.user);
    console.log('➡️ req.body:', req.body);
    console.log('➡️ req.file:', req.file);

    const { content, category } = req.body;
    const image = req.file?.filename;

    const post = new Post({
      userId: req.user.id,
      content,
      category,
      image,
      isApproved: req.user.role === 'admin',
    });

    await post.save();
    res.status(201).json({ message: req.user.role === 'admin' ? 'Post created' : 'Post submitted for approval' });
  } catch (err) {
    console.error('❌ Failed to create post:', err);
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

    const approved = posts.filter((p) => p.isApproved);
    const pending = posts.filter((p) => !p.isApproved);

    res.json({ approved: approved || [], pending: pending || [] });
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
exports.dislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.dislikes.includes(req.user.id)) {
      post.dislikes = post.dislikes.filter(id => id.toString() !== req.user.id);
    } else {
      post.dislikes.push(req.user.id);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to dislike post' });
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

// ✅ Get all unapproved posts for admin
exports.getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isApproved: false })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error('Failed to get pending posts:', err);
    res.status(500).json({ error: 'Failed to fetch pending posts' });
  }
};

exports.rejectPost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post rejected and deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject post' });
  }
};

// ✅ New controller to get all approved posts by any student
exports.getAllApprovedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .populate('userId', 'name photo')
      .populate('comments.userId', 'name');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch approved posts' });
  }
};
