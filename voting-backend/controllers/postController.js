// // voting-backend/controllers/postController.js
// const Post = require('../models/Post');
// const User = require('../models/User');

// /**
//  * Create a post (students => pending; admins => auto-approved).
//  */
// exports.createPost = async (req, res) => {
//   try {
//     const { content, category } = req.body;
//     if (!content || !category) {
//       return res.status(400).json({ error: 'Content and category are required' });
//     }

//     const image = req.file?.filename || null;

//     const post = new Post({
//       userId: req.user.id,
//       content,
//       category,
//       image,
//       isApproved: req.user.role === 'admin',
//     });

//     await post.save();
//     return res
//       .status(201)
//       .json({ message: req.user.role === 'admin' ? 'Post created' : 'Post submitted for approval' });
//   } catch (err) {
//     console.error('❌ Failed to create post:', err);
//     return res.status(500).json({ error: 'Failed to create post' });
//   }
// };

// /**
//  * Public: get all approved posts
//  */
// exports.getPosts = async (req, res) => {
//   try {
//     const posts = await Post.find({ isApproved: true })
//       .sort({ createdAt: -1 })
//       .populate('userId', 'name photo')
//       .populate('comments.userId', 'name');

//     return res.json(posts);
//   } catch (err) {
//     console.error('❌ Failed to fetch posts:', err);
//     return res.status(500).json({ error: 'Failed to fetch posts' });
//   }
// };

// /**
//  * Public news: approved posts authored by admins
//  */
// exports.getNews = async (req, res) => {
//   try {
//     const adminIds = await User.find({ role: 'admin' }).select('_id');
//     const posts = await Post.find({
//       isApproved: true,
//       userId: { $in: adminIds.map((u) => u._id) },
//     })
//       .sort({ createdAt: -1 })
//       .populate('userId', 'name photo');

//     return res.json(posts);
//   } catch (err) {
//     console.error('❌ Failed to fetch news:', err);
//     return res.status(500).json({ error: 'Failed to fetch news' });
//   }
// };

// /**
//  * Authed: get my posts (approved & pending)
//  */
// exports.getMyPosts = async (req, res) => {
//   try {
//     const posts = await Post.find({ userId: req.user.id })
//       .sort({ createdAt: -1 })
//       .populate('userId', 'name photo')
//       .populate('comments.userId', 'name');

//     const approved = posts.filter((p) => p.isApproved);
//     const pending = posts.filter((p) => !p.isApproved);

//     return res.json({ approved: approved || [], pending: pending || [] });
//   } catch (err) {
//     console.error('❌ Failed to fetch my posts:', err);
//     return res.status(500).json({ error: 'Failed to fetch posts' });
//   }
// };

// /**
//  * Authed (admin assumed via route policy): approve a post
//  */
// exports.approvePost = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     if (!post) return res.status(404).json({ error: 'Post not found' });

//     post.isApproved = true;
//     await post.save();

//     return res.json({ message: 'Post approved' });
//   } catch (err) {
//     console.error('❌ Failed to approve post:', err);
//     return res.status(500).json({ error: 'Failed to approve post' });
//   }
// };

// /**
//  * Authed: LIKE toggle — mutually exclusive with dislike.
//  * Always return populated doc so UI can show poster's name.
//  */
// exports.likePost = async (req, res) => {
//   try {
//     const postId = req.params.id;
//     const uid = req.user.id;

//     // Try to set liked (add like, remove dislike) if not already liked
//     let updated = await Post.findOneAndUpdate(
//       { _id: postId, likes: { $ne: uid } },
//       { $addToSet: { likes: uid }, $pull: { dislikes: uid } },
//       { new: true }
//     );

//     if (!updated) {
//       // Already liked → unlike
//       updated = await Post.findOneAndUpdate(
//         { _id: postId },
//         { $pull: { likes: uid } },
//         { new: true }
//       );
//     }

//     await updated.populate('userId', 'name photo').populate('comments.userId', 'name');
//     return res.json(updated);
//   } catch (err) {
//     console.error('❌ Failed to like post:', err);
//     return res.status(500).json({ error: 'Failed to like post' });
//   }
// };

// /**
//  * Authed: DISLIKE toggle — mutually exclusive with like.
//  * Always return populated doc so UI can show poster's name.
//  */
// exports.dislikePost = async (req, res) => {
//   try {
//     const postId = req.params.id;
//     const uid = req.user.id;

//     // Try to set disliked (add dislike, remove like) if not already disliked
//     let updated = await Post.findOneAndUpdate(
//       { _id: postId, dislikes: { $ne: uid } },
//       { $addToSet: { dislikes: uid }, $pull: { likes: uid } },
//       { new: true }
//     );

//     if (!updated) {
//       // Already disliked → remove dislike
//       updated = await Post.findOneAndUpdate(
//         { _id: postId },
//         { $pull: { dislikes: uid } },
//         { new: true }
//       );
//     }

//     await updated.populate('userId', 'name photo').populate('comments.userId', 'name');
//     return res.json(updated);
//   } catch (err) {
//     console.error('❌ Failed to dislike post:', err);
//     return res.status(500).json({ error: 'Failed to dislike post' });
//   }
// };

// /**
//  * Authed: add a comment
//  * Returns populated doc (owner + commenters) for immediate UI.
//  */
// exports.commentPost = async (req, res) => {
//   try {
//     const { content } = req.body;
//     const text = String(content || '').trim();
//     if (!text) return res.status(400).json({ error: 'Comment content is required' });

//     const post = await Post.findById(req.params.id);
//     if (!post) return res.status(404).json({ error: 'Post not found' });

//     post.comments.push({ userId: req.user.id, content: text });
//     await post.save();

//     await post.populate('userId', 'name photo').populate('comments.userId', 'name');
//     return res.json(post);
//   } catch (err) {
//     console.error('❌ Failed to comment:', err);
//     return res.status(500).json({ error: 'Failed to comment' });
//   }
// };

// /**
//  * Authed (admin): get all unapproved posts
//  */
// exports.getPendingPosts = async (req, res) => {
//   try {
//     const posts = await Post.find({ isApproved: false })
//       .populate('userId', 'name email photo')
//       .sort({ createdAt: -1 });

//     return res.status(200).json(posts);
//   } catch (err) {
//     console.error('❌ Failed to get pending posts:', err);
//     return res.status(500).json({ error: 'Failed to fetch pending posts' });
//   }
// };

// /**
//  * Authed (admin): reject post (delete)
//  */
// exports.rejectPost = async (req, res) => {
//   try {
//     const p = await Post.findByIdAndDelete(req.params.id);
//     if (!p) return res.status(404).json({ error: 'Post not found' });
//     return res.json({ message: 'Post rejected and deleted' });
//   } catch (err) {
//     console.error('❌ Failed to reject post:', err);
//     return res.status(500).json({ error: 'Failed to reject post' });
//   }
// };

// /**
//  * Public: get all approved posts by anyone
//  */
// exports.getAllApprovedPosts = async (req, res) => {
//   try {
//     const posts = await Post.find({ isApproved: true })
//       .sort({ createdAt: -1 })
//       .populate('userId', 'name photo')
//       .populate('comments.userId', 'name');

//     return res.json(posts);
//   } catch (err) {
//     console.error('❌ Failed to fetch approved posts:', err);
//     return res.status(500).json({ error: 'Failed to fetch approved posts' });
//   }
// };


const Post = require('../models/Post');
const User = require('../models/User');

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
    res.status(201).json({ message: req.user.role === 'admin' ? 'Post created' : 'Post submitted for approval' });
  } catch (err) {
    console.error('❌ Failed to create post:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

exports.getPosts = async (req, res) => {
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

exports.getNews = async (req, res) => {
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
    res.json({ message: 'Post approved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve post' });
  }
};

/** Toggle LIKE. Also remove a dislike if present. Always return a fully populated post. */
exports.likePost = async (req, res) => {
  try {
    const me = req.user.id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Toggle like
    const likeIdx = post.likes.findIndex(id => String(id) === String(me));
    if (likeIdx >= 0) {
      post.likes.splice(likeIdx, 1);
    } else {
      post.likes.push(me);
      // remove any existing dislike
      post.dislikes = post.dislikes.filter(id => String(id) !== String(me));
    }

    await post.save();
    const populated = await Post.findById(post._id)
      .populate('userId', 'name photo')
      .populate('comments.userId', 'name');

    res.json(populated);
  } catch (err) {
    console.error('Failed to like post:', err);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

/** Toggle DISLIKE. Also remove a like if present. Always return a fully populated post. */
exports.dislikePost = async (req, res) => {
  try {
    const me = req.user.id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Toggle dislike
    const disIdx = post.dislikes.findIndex(id => String(id) === String(me));
    if (disIdx >= 0) {
      post.dislikes.splice(disIdx, 1);
    } else {
      post.dislikes.push(me);
      // remove any existing like
      post.likes = post.likes.filter(id => String(id) !== String(me));
    }

    await post.save();
    const populated = await Post.findById(post._id)
      .populate('userId', 'name photo')
      .populate('comments.userId', 'name');

    res.json(populated);
  } catch (err) {
    console.error('Failed to dislike post:', err);
    res.status(500).json({ error: 'Failed to dislike post' });
  }
};

/** Add comment. Always return a fully populated post. */
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

exports.rejectPost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post rejected and deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject post' });
  }
};

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
