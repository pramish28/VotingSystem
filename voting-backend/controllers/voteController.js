// const mongoose = require('mongoose');
// const Vote = require('../models/Vote');
// const Election = require('../models/Election');

// const POSITION_KEYS = new Set(['president', 'vicePresident', 'secretary', 'treasurer', 'members']);

// function findCandidateInElection(election, position, candidateId) {
//   if (!election || !POSITION_KEYS.has(position) || !candidateId) return null;

//   for (const section of election.partySections || []) {
//     const party = section.partyName || '';
//     const c = section.candidates || {};

//     if (position !== 'members') {
//       const slot = c[position];
//       if (slot?._id?.toString() === String(candidateId)) {
//         return { name: slot.name, party, position, candidateId: String(slot._id), photo: slot.photo || '' };
//       }
//     } else {
//       for (const m of c.members || []) {
//         if (m?._id?.toString() === String(candidateId)) {
//           return { name: m.name, party, position: 'members', candidateId: String(m._id), photo: m.photo || '' };
//         }
//       }
//     }
//   }

//   for (const ind of election.independents || []) {
//     if (ind?.post === position && ind?._id?.toString() === String(candidateId)) {
//       return { name: ind.name, party: 'Independent', position, candidateId: String(ind._id), photo: ind.photo || '' };
//     }
//   }
//   return null;
// }

// /** POST /api/vote  -> create a PENDING vote (idempotent per position/candidate) */
// const submitVote = async (req, res) => {
//   try {
//     const { electionId, voterId, position, candidateId } = req.body;

//     if (!electionId || !voterId || !position || !candidateId) {
//       return res.status(400).json({ message: 'electionId, voterId, position, candidateId are required.' });
//     }
//     if (!POSITION_KEYS.has(position)) {
//       return res.status(400).json({ message: 'Invalid position.' });
//     }

//     const election = await Election.findById(electionId).lean();
//     if (!election) return res.status(404).json({ message: 'Election not found.' });

//     const candidate = findCandidateInElection(election, position, candidateId);
//     if (!candidate) return res.status(404).json({ message: 'Candidate not found for this election/position.' });

//     // Idempotent: if the exact vote exists (pending/confirmed), return OK
//     const existingExact = await Vote.findOne({ electionId, voterId, position, candidateId });
//     if (existingExact) {
//       return res.status(200).json({ message: 'Vote already recorded (pending or confirmed).', voteId: existingExact._id });
//     }

//     // Selection limits per position
//     const existingForPosition = await Vote.countDocuments({ electionId, voterId, position });
//     if (position === 'members') {
//       if (existingForPosition >= 12) return res.status(400).json({ message: 'You can select up to 12 members only.' });
//     } else {
//       if (existingForPosition >= 1) return res.status(400).json({ message: `You have already selected a ${position}.` });
//     }

//     const vote = new Vote({
//       electionId: new mongoose.Types.ObjectId(electionId),
//       voterId: String(voterId),
//       position,
//       candidateId: String(candidateId),
//       status: 'pending',
//     });

//     await vote.save();
//     return res.json({ message: 'Vote recorded (pending).', voteId: vote._id });
//   } catch (err) {
//     console.error('Submit vote error:', err);
//     // If an old unique index on {userId, electionId} still exists and triggers 11000, treat as success
//     if (err && err.code === 11000) {
//       return res.status(200).json({ message: 'Vote already recorded (duplicate index).', duplicate: true });
//     }
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// /** POST /api/vote/confirm -> confirm SINGLE vote */
// const confirmVote = async (req, res) => {
//   try {
//     const { electionId, voterId, position, candidateId } = req.body;
//     if (!electionId || !voterId || !position || !candidateId) {
//       return res.status(400).json({ message: 'electionId, voterId, position, candidateId are required.' });
//     }

//     const vote = await Vote.findOne({ electionId, voterId, position, candidateId });
//     if (!vote) return res.status(404).json({ message: 'Vote not found.' });

//     if (vote.status !== 'confirmed') {
//       vote.status = 'confirmed';
//       await vote.save();
//     }
//     return res.json({ message: 'Vote confirmed.' });
//   } catch (err) {
//     console.error('Confirm vote error:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// /** POST /api/vote/confirm-all -> confirm ALL pending votes for voter/election */
// const confirmAllVotes = async (req, res) => {
//   try {
//     const { electionId, voterId } = req.body;
//     if (!electionId || !voterId) {
//       return res.status(400).json({ message: 'electionId and voterId are required.' });
//     }

//     const result = await Vote.updateMany(
//       { electionId, voterId, status: 'pending' },
//       { $set: { status: 'confirmed' } }
//     );

//     return res.json({ message: 'All votes confirmed.', modified: result.modifiedCount || 0 });
//   } catch (err) {
//     console.error('Confirm all votes error:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// /** GET /api/vote/results?electionId=... -> tallies by position (confirmed only) */
// const getResults = async (req, res) => {
//   try {
//     let { electionId } = req.query;

//     // If not provided, use active by date else latest
//     if (!electionId) {
//       const now = new Date();
//       let el = await Election.findOne({ startDate: { $lte: now }, endDate: { $gte: now } }).sort({ startDate: -1 }).lean();
//       if (!el) el = await Election.findOne().sort({ startDate: -1 }).lean();
//       if (!el) return res.json({ electionId: '', results: [] });
//       electionId = String(el._id);
//     }

//     const election = await Election.findById(electionId).lean();
//     if (!election) return res.status(404).json({ message: 'Election not found.' });

//     const agg = await Vote.aggregate([
//       { $match: { electionId: election._id, status: 'confirmed' } },
//       { $group: { _id: { candidateId: '$candidateId', position: '$position' }, votes: { $sum: 1 } } },
//     ]);

//     const candidateMap = new Map();
//     for (const section of election.partySections || []) {
//       const party = section.partyName || '';
//       const c = section.candidates || {};
//       for (const k of ['president', 'vicePresident', 'secretary', 'treasurer']) {
//         const slot = c[k];
//         if (slot?._id) candidateMap.set(String(slot._id), { name: slot.name, party, position: k });
//       }
//       for (const m of c.members || []) {
//         if (m?._id) candidateMap.set(String(m._id), { name: m.name, party, position: 'members' });
//       }
//     }
//     for (const ind of election.independents || []) {
//       if (ind?._id) candidateMap.set(String(ind._id), { name: ind.name, party: 'Independent', position: ind.post });
//     }

//     const totalsByPosition = {};
//     for (const row of agg) {
//       const pos = row._id.position;
//       totalsByPosition[pos] = (totalsByPosition[pos] || 0) + row.votes;
//     }

//     const results = agg.map(row => {
//       const { candidateId, position } = row._id;
//       const meta = candidateMap.get(String(candidateId)) || { name: 'Unknown', party: '', position };
//       const total = totalsByPosition[position] || 0;
//       const pct = total ? (row.votes / total) * 100 : 0;
//       return {
//         candidateId: String(candidateId),
//         position,
//         name: meta.name,
//         party: meta.party,
//         votes: row.votes,
//         percentage: +pct.toFixed(2),
//       };
//     });

//     return res.json({ electionId, results });
//   } catch (err) {
//     console.error('Get results error:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = {
//   submitVote,
//   confirmVote,
//   confirmAllVotes,
//   getResults,
// };

// controllers/voteController.js
const mongoose = require('mongoose');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const User = require('../models/User');

const POSITION_KEYS = new Set(['president', 'vicePresident', 'secretary', 'treasurer', 'members']);

function findCandidateInElection(election, position, candidateId) {
  if (!election || !POSITION_KEYS.has(position) || !candidateId) return null;

  for (const section of election.partySections || []) {
    const party = section.partyName || '';
    const c = section.candidates || {};

    if (position !== 'members') {
      const slot = c[position];
      if (slot?._id?.toString() === String(candidateId)) {
        return { name: slot.name, party, position, candidateId: String(slot._id), photo: slot.photo || '' };
      }
    } else {
      for (const m of c.members || []) {
        if (m?._id?.toString() === String(candidateId)) {
          return { name: m.name, party, position: 'members', candidateId: String(m._id), photo: m.photo || '' };
        }
      }
    }
  }

  for (const ind of election.independents || []) {
    if (ind?.post === position && ind?._id?.toString() === String(candidateId)) {
      return { name: ind.name, party: 'Independent', position, candidateId: String(ind._id), photo: ind.photo || '' };
    }
  }
  return null;
}

/** POST /api/vote -> create a PENDING vote (idempotent per position/candidate) */
const submitVote = async (req, res) => {
  try {
    const { electionId, voterId, position, candidateId } = req.body;

    if (!electionId || !voterId || !position || !candidateId) {
      return res.status(400).json({ message: 'electionId, voterId, position, candidateId are required.' });
    }
    if (!POSITION_KEYS.has(position)) {
      return res.status(400).json({ message: 'Invalid position.' });
    }

    const election = await Election.findById(electionId).lean();
    if (!election) return res.status(404).json({ message: 'Election not found.' });

    const candidate = findCandidateInElection(election, position, candidateId);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found for this election/position.' });

    // Idempotent: same vote (pending/confirmed) -> OK
    const existingExact = await Vote.findOne({ electionId, voterId, position, candidateId });
    if (existingExact) {
      return res.status(200).json({ message: 'Vote already recorded (pending or confirmed).', voteId: existingExact._id });
    }

    // One per position (except up to 12 members)
    const existingForPosition = await Vote.countDocuments({ electionId, voterId, position });
    if (position === 'members') {
      if (existingForPosition >= 12) return res.status(400).json({ message: 'You can select up to 12 members only.' });
    } else {
      if (existingForPosition >= 1) return res.status(400).json({ message: `You have already selected a ${position}.` });
    }

    const vote = new Vote({
      electionId: new mongoose.Types.ObjectId(electionId),
      voterId: String(voterId),
      position,
      candidateId: String(candidateId),
      status: 'pending',
    });

    await vote.save();
    return res.json({ message: 'Vote recorded (pending).', voteId: vote._id });
  } catch (err) {
    console.error('Submit vote error:', err);
    if (err && err.code === 11000) {
      // legacy unique index hit -> treat as idempotent success
      return res.status(200).json({ message: 'Vote already recorded (duplicate index).' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

/** POST /api/vote/confirm -> confirm SINGLE vote */
const confirmVote = async (req, res) => {
  try {
    const { electionId, voterId, position, candidateId } = req.body;
    if (!electionId || !voterId || !position || !candidateId) {
      return res.status(400).json({ message: 'electionId, voterId, position, candidateId are required.' });
    }

    const vote = await Vote.findOne({ electionId, voterId, position, candidateId });
    if (!vote) return res.status(404).json({ message: 'Vote not found.' });

    if (vote.status !== 'confirmed') {
      vote.status = 'confirmed';
      await vote.save();
    }
    return res.json({ message: 'Vote confirmed.' });
  } catch (err) {
    console.error('Confirm vote error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/** POST /api/vote/confirm-all -> confirm ALL pending votes for voter/election */
const confirmAllVotes = async (req, res) => {
  try {
    const { electionId, voterId } = req.body;
    if (!electionId || !voterId) {
      return res.status(400).json({ message: 'electionId and voterId are required.' });
    }

    const result = await Vote.updateMany(
      { electionId, voterId, status: 'pending' },
      { $set: { status: 'confirmed' } }
    );

    return res.json({ message: 'All votes confirmed.', modified: result.modifiedCount || 0 });
  } catch (err) {
    console.error('Confirm all votes error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/** GET /api/vote/results?electionId=... -> tallies by position (confirmed only) */
const getResults = async (req, res) => {
  try {
    let { electionId } = req.query;

    if (!electionId) {
      const now = new Date();
      let el = await Election.findOne({ startDate: { $lte: now }, endDate: { $gte: now } }).sort({ startDate: -1 }).lean();
      if (!el) el = await Election.findOne().sort({ startDate: -1 }).lean();
      if (!el) return res.json({ electionId: '', results: [] });
      electionId = String(el._id);
    }

    const election = await Election.findById(electionId).lean();
    if (!election) return res.status(404).json({ message: 'Election not found.' });

    const agg = await Vote.aggregate([
      { $match: { electionId: election._id, status: 'confirmed' } },
      { $group: { _id: { candidateId: '$candidateId', position: '$position' }, votes: { $sum: 1 } } },
    ]);

    const candidateMap = new Map();
    for (const section of election.partySections || []) {
      const party = section.partyName || '';
      const c = section.candidates || {};
      for (const k of ['president', 'vicePresident', 'secretary', 'treasurer']) {
        const slot = c[k];
        if (slot?._id) candidateMap.set(String(slot._id), { name: slot.name, party, position: k });
      }
      for (const m of c.members || []) {
        if (m?._id) candidateMap.set(String(m._id), { name: m.name, party, position: 'members' });
      }
    }
    for (const ind of election.independents || []) {
      if (ind?._id) candidateMap.set(String(ind._id), { name: ind.name, party: 'Independent', position: ind.post });
    }

    const totalsByPosition = {};
    for (const row of agg) {
      const pos = row._id.position;
      totalsByPosition[pos] = (totalsByPosition[pos] || 0) + row.votes;
    }

    const results = agg.map(row => {
      const { candidateId, position } = row._id;
      const meta = candidateMap.get(String(candidateId)) || { name: 'Unknown', party: '', position };
      const total = totalsByPosition[position] || 0;
      const pct = total ? (row.votes / total) * 100 : 0;
      return {
        candidateId: String(candidateId),
        position,
        name: meta.name,
        party: meta.party,
        votes: row.votes,
        percentage: +pct.toFixed(2),
      };
    });

    return res.json({ electionId, results });
  } catch (err) {
    console.error('Get results error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/** OPTIONAL test helper: DELETE my votes for an election (auth) */
const deleteMyVotesForElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    if (!electionId) return res.status(400).json({ message: 'electionId is required.' });

    const me = await User.findById(req.user.id).select('voterId').lean();
    if (!me?.voterId) return res.status(401).json({ message: 'Unauthorized' });

    const r = await Vote.deleteMany({
      electionId: new mongoose.Types.ObjectId(electionId),
      voterId: me.voterId,
    });

    return res.json({ deleted: r.deletedCount || 0 });
  } catch (err) {
    console.error('deleteMyVotesForElection error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitVote,
  confirmVote,
  confirmAllVotes,
  getResults,
  deleteMyVotesForElection, // optional
};

