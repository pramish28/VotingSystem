const Vote = require('../models/Vote');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

const submitVote = async (req, res) => {
  try {
    const { candidateId, electionId } = req.body;
    const userId = req.user.id;

    // Check if user has already voted in this election
    const existingVote = await Vote.findOne({ userId, electionId });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election.' });
    }

    // Verify candidate and election
    const candidate = await Candidate.findById(candidateId);
    const election = await Election.findById(electionId);
    if (!candidate || !election) {
      return res.status(404).json({ message: 'Invalid candidate or election.' });
    }

    // Create vote
    const vote = new Vote({ userId, candidateId, electionId });
    await vote.save();

    // Update user's hasVoted status
    await User.findByIdAndUpdate(userId, { hasVoted: true });

    res.json({ message: 'Vote submitted successfully.' });
  } catch (err) {
    console.error('Submit vote error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const confirmVote = async (req, res) => {
  try {
    const { candidateId, electionId } = req.body;
    const userId = req.user.id;

    // Verify vote exists
    const vote = await Vote.findOne({ userId, candidateId, electionId });
    if (!vote) {
      return res.status(404).json({ message: 'Vote not found.' });
    }

    res.json({ message: 'Vote confirmed successfully.' });
  } catch (err) {
    console.error('Confirm vote error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getResults = async (req, res) => {
  try {
    const votes = await Vote.aggregate([
      { $group: { _id: '$candidateId', votes: { $sum: 1 } } },
      {
        $lookup: {
          from: 'candidates',
          localField: '_id',
          foreignField: '_id',
          as: 'candidate',
        },
      },
      { $unwind: '$candidate' },
      {
        $project: {
          _id: '$candidate._id',
          name: '$candidate.name',
          position: '$candidate.position',
          votes: 1,
          percentage: {
            $multiply: [{ $divide: ['$votes', { $literal: await Vote.countDocuments() }] }, 100],
          },
          color: '$candidate.color',
        },
      },
    ]);
    res.json(votes);
  } catch (err) {
    console.error('Get results error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitVote, confirmVote, getResults };