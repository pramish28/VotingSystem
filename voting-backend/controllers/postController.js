const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const Activity = require('../models/Activity');

exports.createPost = async (req, res) => {
  try {
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
     // ✅ Log activity
    const user = await User.findById(req.user.id).select('name email');
    const activity = new Activity({
      user: user?.name || "Unknown",
      type: "post_created",
      message: ` created a post in category "${category}"`,
    });
    await activity.save();

    // If admin’s post is auto-approved, probabilities may shift → broadcast
    if (post.isApproved) {
      const io = req.app.get('io');
      if (io) io.emit('probability:update', { scope: 'all' });
    }

    res.status(201).json({ message: req.user.role === 'admin' ? 'Post created' : 'Post submitted for approval' });
  } catch (err) {
    console.error('❌ Failed to create post:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

exports.getPosts = async (_req, res) => {
  try {
    const posts = await Post.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .populate('userId', 'name photo')
      .populate('comments.userId', 'name');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

exports.getNews = async (_req, res) => {
  try {
    const adminIds = await User.find({ role: 'admin' }).select('_id');
    const posts = await Post.find({ isApproved: true, userId: { $in: adminIds } })
      .sort({ createdAt: -1 })
      .populate('userId', 'name photo');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name photo')
      .populate('comments.userId', 'name');

    const approved = posts.filter((p) => p.isApproved);
    const pending = posts.filter((p) => !p.isApproved);
    res.json({ approved, pending });
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
   // ✅ Log activity
    await new Activity({
      user: (await User.findById(post.userId).select('name')).name || 'Unknown',
      type: 'post_approved',
      message:` Post in category "${post.category}" was approved`,
    }).save();

    const io = req.app.get('io');
    if (io) io.emit('probability:update', { scope: 'all' });

    res.json({ message: 'Post approved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve post', err });
  }
};

exports.likePost = async (req, res) => {
  try {
    const me = req.user.id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const likeIdx = post.likes.findIndex(id => String(id) === String(me));
    if (likeIdx >= 0) {
      post.likes.splice(likeIdx, 1);
    } else {
      post.likes.push(me);
      post.dislikes = post.dislikes.filter(id => String(id) !== String(me));
    }

    await post.save();
    const populated = await Post.findById(post._id)
      .populate('userId', 'name photo')
      .populate('comments.userId', 'name');

    const io = req.app.get('io');
    if (io) io.emit('probability:update', { scope: 'all' });

    res.json(populated);
  } catch (err) {
    console.error('Failed to like post:', err);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

exports.dislikePost = async (req, res) => {
  try {
    const me = req.user.id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const disIdx = post.dislikes.findIndex(id => String(id) === String(me));
    if (disIdx >= 0) {
      post.dislikes.splice(disIdx, 1);
    } else {
      post.dislikes.push(me);
      post.likes = post.likes.filter(id => String(id) !== String(me));
    }

    await post.save();
    const populated = await Post.findById(post._id)
      .populate('userId', 'name photo')
      .populate('comments.userId', 'name');

    const io = req.app.get('io');
    if (io) io.emit('probability:update', { scope: 'all' });

    res.json(populated);
  } catch (err) {
    console.error('Failed to dislike post:', err);
    res.status(500).json({ error: 'Failed to dislike post' });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment cannot be empty.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({ userId: req.user.id, content: content.trim() });
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('userId', 'name photo')
      .populate('comments.userId', 'name');

    // Comments also affect social score → notify
    const io = req.app.get('io');
    if (io) io.emit('probability:update', { scope: 'all' });

    res.json(populated);
  } catch (err) {
    console.error('Failed to comment:', err);
    res.status(500).json({ error: 'Failed to comment' });
  }
};

exports.getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isApproved: false })
      .populate('userId', 'name email photo')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error('Failed to get pending posts:', err);
    res.status(500).json({ error: 'Failed to fetch pending posts' });
  }
};

// exports.rejectPost = async (req, res) => {
//   try {
//     await Post.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Post rejected and deleted' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to reject post' });
//   }
// };

exports.rejectPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // ✅ Log activity
    await new Activity({
      user: (await User.findById(post.userId).select('name')).name || 'Unknown',
      type: 'post_rejected',
      message:` Post in category "${post.category}" was rejected`,
    }).save();

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post rejected and deleted' });
  } catch (err) {
    console.error('Error rejecting post:', err);
    res.status(500).json({ error: 'Failed to reject post'});
}
};


exports.getAllApprovedPosts = async (_req, res) => {
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

// Admin delete any post (approved or pending) + broadcast probability update
exports.adminDeletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Best-effort: remove image file from disk (Uploads/)
    if (post.image) {
      try {
        const p = path.join(__dirname, '..', 'Uploads', post.image);
        fs.unlink(p, () => {}); // ignore callback errors
      } catch (_) {}
    }

    await Post.deleteOne({ _id: id });

    // Notify probability engine (approved post removal can change scores)
    const io = req.app.get('io');
    if (io) io.emit('probability:update', { scope: 'all' });

    return res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('adminDeletePost error:', err);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
};
