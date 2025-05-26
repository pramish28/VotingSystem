const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

exports.createElection = async (req, res) => {
  try {
    const election = new Election(req.body);
    await election.save();
    res.status(201).json(election);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create election' });
  }
};

exports.getElections = async (req, res) => {
  try {
    const elections = await Election.find();
    res.json(elections);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch elections' });
  }
};

exports.addCandidate = async (req, res) => {
  try {
    const candidate = new Candidate({ ...req.body, electionId: '670f1234567890abcdef1234' });
    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add candidate' });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};