const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const User = require('../models/User');

// Mock news data
const mockNews = [
  { type: 'Update', typeColor: 'bg-blue-500', date: '2025-06-04', title: 'Election Started', content: 'The election has officially begun.' },
  { type: 'Announcement', typeColor: 'bg-green-500', date: '2025-06-03', title: 'Candidate List', content: 'Candidates have been announced.' },
];

// Create election
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, startDate, endDate } = req.body;
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const election = new Election({ title, startDate, endDate });
    await election.save();
    res.status(201).json(election);
  } catch (err) {
    console.error('Create election error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all elections
router.get('/', async (req, res) => {
  try {
    const elections = await Election.find();
    res.json(elections);
  } catch (err) {
    console.error('Get elections error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add candidate
router.post('/candidates', authMiddleware, async (req, res) => {
  try {
    const { name, department, slogan, platform, position, electionId } = req.body;
    if (!name || !department || !position || !electionId) {
      return res.status(400).json({ error: 'All required fields are required' });
    }
    const candidate = new Candidate({ name, department, slogan, platform, position, electionId });
    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    console.error('Add candidate error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get candidates
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find().populate('electionId');
    res.json(candidates);
  } catch (err) {
    console.error('Get candidates error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get election news
router.get('/news', async (req, res) => {
  try {
    res.json(mockNews);
  } catch (err) {
    console.error('Get news error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get more news
router.get('/news/more', async (req, res) => {
  try {
    res.json([]);
  } catch (err) {
    console.error('Get more news error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get election stats
router.get('/stats', async (req, res) => {
  try {
    const totalVoters = await User.countDocuments();
    const votesCast = await Vote.countDocuments();
    const candidateCount = await Candidate.countDocuments();
    const election = await Election.findOne();
    res.json({
      totalVoters,
      votesCast,
      candidateCount,
      turnout: totalVoters ? (votesCast / totalVoters) * 100 : 0,
      positionCount: candidateCount,
      status: election ? 'Active' : 'Inactive',
      endDate: election ? election.endDate.toISOString().split('T')[0] : 'N/A',
      countdown: '1 day remaining',
      timeRemainingPercent: 50,
      timeRemainingText: '1 day left',
      electionId: election ? election._id : null,
    });
  } catch (err) {
    console.error('Get stats error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;