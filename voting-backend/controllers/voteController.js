const Vote = require('../models/Vote');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Post = require('../models/Post');

exports.vote = async (req, res) => {
  const { voterId, candidateId } = req.body;
  try {
    const user = await User.findOne({ voterId });
    if (!user || !user.isVerified) {
      return res.status(401).json({ error: 'Invalid voter ID' });
    }
    const existingVote = await Vote.findOne({ userId: user._id });
    if (existingVote) {
      return res.status(400).json({ error: 'Already voted' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Vote failed' });
  }
};

exports.confirmVote = async (req, res) => {
  const { voterId, candidateId } = req.body;
  try {
    const user = await User.findOne({ voterId });
    const vote = new Vote({ userId: user._id, candidateId, electionId: '670f1234567890abcdef1234' });
    await vote.save();
    res.json({ message: 'Vote recorded' });
  } catch (err) {
    res.status(500).json({ error: 'Vote confirmation failed' });
  }
};

exports.getResults = async (req, res) => {
  try {
    const results = await Vote.aggregate([
      { $group: { _id: '$candidateId', votes: { $sum: 1 } } },
      { $lookup: { from: 'candidates', localField: '_id', foreignField: '_id', as: 'candidate' } },
      { $unwind: '$candidate' },
      { $project: { candidateName: '$candidate.name', votes: 1 } },
    ]);

    const posts = await Post.find().populate('userId');
    const totalInteractions = posts.reduce((sum, p) => sum + p.likes.length + p.comments.length, 0);
    const probabilities = await Promise.all(results.map(async (result) => {
      const candidatePosts = posts.filter(p => p.userId.name === result.candidateName);
      const interactions = candidatePosts.reduce((sum, p) => sum + p.likes.length + p.comments.length, 0);
      return { candidateName: result.candidateName, probability: totalInteractions ? interactions / totalInteractions : 0 };
    }));

    res.json({ results, probabilities });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};