const Vote = require('../models/Vote');
const User = require('../models/User');
const Election = require('../models/Election');

/** Find a candidate (embedded) by position + _id inside an election doc. */
function findCandidateInElection(election, position, candidateId) {
  if (!election) return null;

  // 1) party sections
  for (const section of election.partySections || []) {
    const party = section.partyName || '';

    if (['president','vicePresident','secretary','treasurer'].includes(position)) {
      const slot = section.candidates?.[position];
      if (slot?._id?.toString() === candidateId) {
        return { name: slot.name, party, position, candidateId, photo: slot.photo || '' };
      }
    }

    if (position === 'members') {
      for (const m of section.candidates?.members || []) {
        if (m?._id?.toString() === candidateId) {
          return { name: m.name, party, position, candidateId, photo: m.photo || '' };
        }
      }
    }
  }

  // 2) independents
  for (const ind of election.independents || []) {
    if (ind?._id?.toString() === candidateId && ind.post === position) {
      return { name: ind.name, party: 'Independent', position, candidateId, photo: ind.photo || '' };
    }
  }

  return null;
}

/**
 * POST /api/vote
 * Body: { electionId, candidateId, position, voterId }
 * Auth: optional but recommended (req.user.voterId should match body.voterId if present)
 */
const submitVote = async (req, res) => {
  try {
    const { electionId, candidateId, position, voterId: voterIdBody } = req.body;
    if (!electionId || !candidateId || !position) {
      return res.status(400).json({ message: 'electionId, candidateId and position are required.' });
    }

    // Resolve voterId: prefer authenticated user’s voterId, else allow body
    const voterIdFromUser = req.user?.voterId;
    const voterId = voterIdFromUser || voterIdBody;
    if (!voterId) {
      return res.status(400).json({ message: 'voterId is required.' });
    }
    if (voterIdFromUser && voterIdBody && voterIdFromUser !== voterIdBody) {
      return res.status(403).json({ message: 'Voter ID does not match your account.' });
    }

    const election = await Election.findById(electionId).lean();
    if (!election) return res.status(404).json({ message: 'Election not found.' });

    // Validate candidate belongs to this election + position
    const candidate = findCandidateInElection(election, position, candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found for this position/election.' });
    }

    // Enforce constraints
    const existingForCandidate = await Vote.findOne({ electionId, voterId, position, candidateId });
    if (existingForCandidate) {
      return res.status(400).json({ message: 'You already voted for this candidate in this position.' });
    }

    const existingForPosition = await Vote.countDocuments({ electionId, voterId, position });
    if (position === 'members') {
      if (existingForPosition >= 12) {
        return res.status(400).json({ message: 'You can select up to 12 members only.' });
      }
    } else {
      if (existingForPosition >= 1) {
        return res.status(400).json({ message: `You have already voted for ${position}.` });
      }
    }

    // Create pending vote
    const vote = new Vote({ electionId, voterId, position, candidateId, status: 'pending' });
    await vote.save();

    // Optional: update User.hasVoted per position or overall – your call
    // await User.findOneAndUpdate({ voterId }, { hasVoted: true });

    res.json({ message: 'Vote recorded (pending).', voteId: vote._id });
  } catch (err) {
    console.error('Submit vote error:', err);
    // Handle duplicate index nicely
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate vote not allowed.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/vote/confirm
 * Body: { electionId, candidateId, position, voterId }
 * Confirms that specific pending vote (idempotent).
 */
const confirmVote = async (req, res) => {
  try {
    const { electionId, candidateId, position, voterId: voterIdBody } = req.body;
    if (!electionId || !candidateId || !position) {
      return res.status(400).json({ message: 'electionId, candidateId and position are required.' });
    }

    const voterIdFromUser = req.user?.voterId;
    const voterId = voterIdFromUser || voterIdBody;
    if (!voterId) {
      return res.status(400).json({ message: 'voterId is required.' });
    }
    if (voterIdFromUser && voterIdBody && voterIdFromUser !== voterIdBody) {
      return res.status(403).json({ message: 'Voter ID does not match your account.' });
    }

    const vote = await Vote.findOne({ electionId, voterId, position, candidateId });
    if (!vote) return res.status(404).json({ message: 'Vote not found.' });

    if (vote.status !== 'confirmed') {
      vote.status = 'confirmed';
      await vote.save();
    }

    res.json({ message: 'Vote confirmed successfully.' });
  } catch (err) {
    console.error('Confirm vote error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/vote/results?electionId=...
 * Aggregates confirmed votes per position/candidate and enriches with names from Election.
 */
const getResults = async (req, res) => {
  try {
    let { electionId } = req.query;

    // pick active/latest if not provided
    if (!electionId) {
      const now = new Date();
      let el = await Election.findOne({ startDate: { $lte: now }, endDate: { $gte: now } })
        .sort({ startDate: -1 }).lean();
      if (!el) el = await Election.findOne().sort({ startDate: -1 }).lean();
      if (!el) return res.json({ electionId: '', results: [] });
      electionId = el._id.toString();
    }

    const election = await Election.findById(electionId).lean();
    if (!election) return res.status(404).json({ message: 'Election not found.' });

    // Aggregate confirmed votes grouped by candidateId+position
    const agg = await Vote.aggregate([
      { $match: { electionId: election._id, status: 'confirmed' } },
      { $group: { _id: { candidateId: '$candidateId', position: '$position' }, votes: { $sum: 1 } } },
    ]);

    // Build a map of candidateId -> {name, party, position}
    const candidateMap = new Map();

    // From party sections
    for (const section of election.partySections || []) {
      const party = section.partyName || '';
      for (const k of ['president','vicePresident','secretary','treasurer']) {
        const c = section.candidates?.[k];
        if (c?._id) candidateMap.set(c._id.toString(), { name: c.name, party, position: k });
      }
      for (const m of section.candidates?.members || []) {
        if (m?._id) candidateMap.set(m._id.toString(), { name: m.name, party, position: 'members' });
      }
    }
    // From independents
    for (const ind of election.independents || []) {
      if (ind?._id) candidateMap.set(ind._id.toString(), { name: ind.name, party: 'Independent', position: ind.post });
    }

    // Compute totals per position for percentage
    const totalsByPosition = {};
    for (const row of agg) {
      const pos = row._id.position;
      totalsByPosition[pos] = (totalsByPosition[pos] || 0) + row.votes;
    }

    // Enrich
    const results = agg.map(row => {
      const { candidateId, position } = row._id;
      const meta = candidateMap.get(candidateId) || { name: 'Unknown', party: '', position };
      const total = totalsByPosition[position] || 0;
      const percentage = total ? (row.votes / total) * 100 : 0;
      return {
        candidateId,
        position,
        name: meta.name,
        party: meta.party,
        votes: row.votes,
        percentage: +percentage.toFixed(2),
      };
    });

    res.json({ electionId, results });
  } catch (err) {
    console.error('Get results error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitVote, confirmVote, getResults };
