// const Candidate = require("../models/Candidate");
// const Election = require("../models/Election");
// const Notification = require("../models/Notification");
// const User = require("../models/User");
// const Vote = require("../models/Vote");

// // ---------- helpers ----------
// async function getCurrentVoterId(req) {
//   try {
//     if (!req.user?.id) return null;
//     const u = await User.findById(req.user.id).select("voterId").lean();
//     return u?.voterId || null;
//   } catch {
//     return null;
//   }
// }

// function shapeElectionCandidates(election) {
//   const positions = { president: [], vicePresident: [], secretary: [], treasurer: [], members: [] };

//   for (const section of election.partySections || []) {
//     const party = section.partyName || '';
//     const c = section.candidates || {};

//     for (const k of ['president', 'vicePresident', 'secretary', 'treasurer']) {
//       const slot = c[k];
//       if (slot && (slot.name || slot.photo) && slot._id) {
//         positions[k].push({
//           candidateId: String(slot._id),
//           name: slot.name || '',
//           party,
//           photo: slot.photo ? `http://localhost:5000${slot.photo}` : '',
//         });
//       }
//     }

//     for (const m of c.members || []) {
//       if ((m?.name || m?.photo) && m?._id) {
//         positions.members.push({
//           candidateId: String(m._id),
//           name: m.name || '',
//           party,
//           photo: m.photo ? `http://localhost:5000${m.photo}` : '',
//         });
//       }
//     }
//   }

//   for (const ind of election.independents || []) {
//     if ((ind?.name || ind?.photo) && ind?._id && ind?.post) {
//       const k = ind.post;
//       if (positions[k]) {
//         positions[k].push({
//           candidateId: String(ind._id),
//           name: ind.name || '',
//           party: 'Independent',
//           photo: ind.photo ? `http://localhost:5000${ind.photo}` : '',
//         });
//       }
//     }
//   }

//   return {
//     electionId: String(election._id),
//     title: election.electionTitle,
//     positions,
//   };
// }

// // ---------- existing handlers you already had (keep them) ----------
// const getCandidates = async (req, res) => {
//   try {
//     const candidates = await Candidate.find().select("_id name department slogan platform position color");
//     res.json(candidates);
//   } catch (err) {
//     console.error('Get candidates error:', err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// const getElectionNews = async (req, res) => {
//   try {
//     const news = await Notification.find().sort({ createdAt: -1 });
//     res.json(news.map(item => ({
//       type: item.type,
//       typeColor: item.typeColor || "text-blue-600 bg-blue-100",
//       date: item.createdAt.toISOString().split("T")[0],
//       title: item.title,
//       content: item.content,
//       featured: item.featured || false,
//     })));
//   } catch (err) {
//     console.error('Get election news error:', err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// const getMoreNews = async (req, res) => {
//   try {
//     const news = await Notification.find().sort({ createdAt: -1 }).skip(3).limit(5);
//     res.json(news.map(item => ({
//       type: item.type,
//       typeColor: item.typeColor || "text-blue-600 bg-blue-100",
//       date: item.createdAt.toISOString().split("T")[0],
//       title: item.title,
//       content: item.content,
//       featured: item.featured || false,
//     })));
//   } catch (err) {
//     console.error('Get more news error:', err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// const getElectionStats = async (req, res) => {
//   try {
//     const now = new Date();
//     const election = await Election.findOne({ startDate: { $lte: now }, endDate: { $gte: now } });
//     if (!election) return res.status(404).json({ message: "No active election found" });

//     const totalVoters = await User.countDocuments({ isVerified: true, role: { $ne: 'admin' } });
//     const votesCast = await Vote.countDocuments({ electionId: election._id, status: 'confirmed' });

//     const candidateCount =
//       (election.partySections || []).reduce((acc, section) => {
//         const c = section.candidates || {};
//         let count = 0;
//         ['president','vicePresident','secretary','treasurer'].forEach(k => { if (c[k]?.name) count++; });
//         count += (c.members || []).filter(m => m?.name).length;
//         return acc + count;
//       }, 0) + (election.independents || []).filter(i => i?.name).length;

//     const endDate = election.endDate.toISOString().split("T")[0];
//     const countdownDays = Math.max(0, Math.ceil((election.endDate - now) / (1000 * 60 * 60 * 24)));

//     res.json({
//       electionId: election._id,
//       totalVoters,
//       votesCast,
//       turnout: totalVoters ? ((votesCast / totalVoters) * 100).toFixed(1) : '0.0',
//       candidateCount,
//       positionCount: 4,
//       status: 'active',
//       endDate,
//       countdown: `${countdownDays} days remaining`,
//       timeRemainingPercent: Math.max(0, Math.min(100, ((election.endDate - now) / (election.endDate - election.startDate)) * 100)),
//       timeRemainingText: `${countdownDays} days remaining`,
//     });
//   } catch (err) {
//     console.error('Get election stats error:', err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// const createElection = async (req, res) => {
//   console.log('Request body:', req.body);
//   console.log('Uploaded files:', req.files);
//   try {
//     const { electionTitle, startDate, endDate, partySections, independents, samanupatikParties } = req.body;
//     const files = req.files || [];

//     if (!electionTitle || !startDate || !endDate) {
//       return res.status(400).json({ message: 'electionTitle, startDate, and endDate are required' });
//     }

//     let parsedPartySections = [];
//     let parsedIndependents = [];
//     let parsedSamanupatikParties = [];
//     try {
//       parsedPartySections = partySections ? JSON.parse(partySections) : [];
//       parsedIndependents = independents ? JSON.parse(independents) : [];
//       parsedSamanupatikParties = samanupatikParties ? JSON.parse(samanupatikParties) : [];
//     } catch (err) {
//       console.error('JSON parsing error:', err);
//       return res.status(400).json({ message: 'Invalid JSON format in request body', error: err.message });
//     }

//     const updatedPartySections = parsedPartySections.map((section, index) => {
//       const candidates = { ...section.candidates };
//       Object.keys(candidates).forEach((key) => {
//         if (key !== 'members') {
//           const fileKey = `partySections[${index}][candidates][${key}][photo]`;
//           const file = files.find(f => f.fieldname === fileKey);
//           candidates[key] = {
//             name: candidates[key].name || "",
//             photo: file ? `/Uploads/${file.filename}` : "",
//           };
//         } else {
//           candidates.members = candidates.members.map((member, memberIndex) => {
//             const memberFileKey = `partySections[${index}][candidates][members][${memberIndex}][photo]`;
//             const file = files.find(f => f.fieldname === memberFileKey);
//             return {
//               name: member.name || "",
//               photo: file ? `/Uploads/${file.filename}` : "",
//             };
//           });
//         }
//       });
//       return { ...section, candidates, partyName: section.partyName || "" };
//     });

//     const updatedIndependents = parsedIndependents.map((cand, index) => {
//       const fileKey = `independents[${index}][photo]`;
//       const file = files.find(f => f.fieldname === fileKey);
//       return {
//         post: cand.post || "",
//         name: cand.name || "",
//         photo: file ? `/Uploads/${file.filename}` : "",
//       };
//     });

//     const election = new Election({
//       electionTitle,
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       partySections: updatedPartySections,
//       independents: updatedIndependents,
//       samanupatikParties: parsedSamanupatikParties,
//     });

//     console.log('Election to save:', election);
//     await election.save();
//     res.status(201).json({ message: 'Election created successfully', election });
//   } catch (error) {
//     console.error('Create election error:', error);
//     res.status(500).json({ message: 'Error creating election', error: error.message });
//   }
// };

// // ---------- NEW endpoints your Voting page relies on ----------

// // GET /api/election/current-candidates (active/latest election) — blocks if already voted
// const getCurrentElectionCandidates = async (req, res) => {
//   try {
//     const voterId = await getCurrentVoterId(req);
//     if (!voterId) return res.status(401).json({ message: 'Unauthorized' });

//     const now = new Date();
//     let election = await Election.findOne({ startDate: { $lte: now }, endDate: { $gte: now } }).sort({ startDate: -1 });
//     if (!election) election = await Election.findOne().sort({ startDate: -1 });
//     if (!election) return res.status(404).json({ message: 'No elections found' });

//     const alreadyVoted = await Vote.exists({ electionId: election._id, voterId, status: 'confirmed' });
//     if (alreadyVoted) {
//       return res.status(403).json({
//         alreadyVoted: true,
//         electionId: String(election._id),
//         title: election.electionTitle,
//       });
//     }

//     return res.json(shapeElectionCandidates(election));
//   } catch (err) {
//     console.error('getCurrentElectionCandidates error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // GET /api/election/:id/candidates — blocks if already voted
// const getElectionCandidatesById = async (req, res) => {
//   try {
//     const voterId = await getCurrentVoterId(req);
//     if (!voterId) return res.status(401).json({ message: 'Unauthorized' });

//     const election = await Election.findById(req.params.id);
//     if (!election) return res.status(404).json({ message: 'Election not found' });

//     const alreadyVoted = await Vote.exists({ electionId: election._id, voterId, status: 'confirmed' });
//     if (alreadyVoted) {
//       return res.status(403).json({
//         alreadyVoted: true,
//         electionId: String(election._id),
//         title: election.electionTitle,
//       });
//     }

//     return res.json(shapeElectionCandidates(election));
//   } catch (err) {
//     console.error('getElectionCandidatesById error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // GET /api/election/available?scope=active|all — list elections NOT yet voted by current user
// const getAvailableElections = async (req, res) => {
//   try {
//     const voterId = await getCurrentVoterId(req);
//     if (!voterId) return res.status(401).json({ message: 'Unauthorized' });

//     const now = new Date();
//     const scope = (req.query.scope || 'active').toLowerCase();
//     const findQuery = scope === 'all' ? {} : { startDate: { $lte: now }, endDate: { $gte: now } };

//     const elections = await Election.find(findQuery).sort({ startDate: -1 }).lean();
//     if (!elections.length) return res.json([]);

//     const ids = elections.map(e => e._id);
//     const confirmed = await Vote.find({
//       electionId: { $in: ids },
//       voterId,
//       status: 'confirmed',
//     }).select('electionId').lean();

//     const votedSet = new Set(confirmed.map(v => String(v.electionId)));

//     const result = elections
//       .filter(e => !votedSet.has(String(e._id)))
//       .map(e => ({
//         _id: String(e._id),
//         electionTitle: e.electionTitle,
//         startDate: e.startDate,
//         endDate: e.endDate,
//       }));

//     return res.json(result);
//   } catch (err) {
//     console.error('getAvailableElections error:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = {
//   getCandidates,
//   getElectionNews,
//   getMoreNews,
//   getElectionStats,
//   createElection,
//   // new exports:
//   getCurrentElectionCandidates,
//   getElectionCandidatesById,
//   getAvailableElections,
// };

// controllers/electionController.js
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Vote = require("../models/Vote");

// ---------- helpers ----------
async function getCurrentVoterId(req) {
  try {
    if (!req.user?.id) return null;
    const u = await User.findById(req.user.id).select("voterId").lean();
    return u?.voterId || null;
  } catch {
    return null;
  }
}

function shapeElectionCandidates(election) {
  const positions = { president: [], vicePresident: [], secretary: [], treasurer: [], members: [] };

  for (const section of election.partySections || []) {
    const party = section.partyName || '';
    const c = section.candidates || {};

    for (const k of ['president', 'vicePresident', 'secretary', 'treasurer']) {
      const slot = c[k];
      if (slot && (slot.name || slot.photo) && slot._id) {
        positions[k].push({
          candidateId: String(slot._id),
          name: slot.name || '',
          party,
          photo: slot.photo ? `http://localhost:5000${slot.photo}` : '',
        });
      }
    }

    for (const m of c.members || []) {
      if ((m?.name || m?.photo) && m?._id) {
        positions.members.push({
          candidateId: String(m._id),
          name: m.name || '',
          party,
          photo: m.photo ? `http://localhost:5000${m.photo}` : '',
        });
      }
    }
  }

  for (const ind of election.independents || []) {
    if ((ind?.name || ind?.photo) && ind?._id && ind?.post) {
      const k = ind.post;
      if (positions[k]) {
        positions[k].push({
          candidateId: String(ind._id),
          name: ind.name || '',
          party: 'Independent',
          photo: ind.photo ? `http://localhost:5000${ind.photo}` : '',
        });
      }
    }
  }

  return {
    electionId: String(election._id),
    title: election.electionTitle,
    positions,
  };
}

// ---------- existing handlers (kept) ----------
const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().select("_id name department slogan platform position color");
    res.json(candidates);
  } catch (err) {
    console.error('Get candidates error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getElectionNews = async (req, res) => {
  try {
    const news = await Notification.find().sort({ createdAt: -1 });
    res.json(news.map(item => ({
      type: item.type,
      typeColor: item.typeColor || "text-blue-600 bg-blue-100",
      date: item.createdAt.toISOString().split("T")[0],
      title: item.title,
      content: item.content,
      featured: item.featured || false,
    })));
  } catch (err) {
    console.error('Get election news error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMoreNews = async (req, res) => {
  try {
    const news = await Notification.find().sort({ createdAt: -1 }).skip(3).limit(5);
    res.json(news.map(item => ({
      type: item.type,
      typeColor: item.typeColor || "text-blue-600 bg-blue-100",
      date: item.createdAt.toISOString().split("T")[0],
      title: item.title,
      content: item.content,
      featured: item.featured || false,
    })));
  } catch (err) {
    console.error('Get more news error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getElectionStats = async (req, res) => {
  try {
    const now = new Date();
    const election = await Election.findOne({ startDate: { $lte: now }, endDate: { $gte: now } });
    if (!election) return res.status(404).json({ message: "No active election found" });

    const totalVoters = await User.countDocuments({ isVerified: true, role: { $ne: 'admin' } });
    const votesCast = await Vote.countDocuments({ electionId: election._id, status: 'confirmed' });

    const candidateCount =
      (election.partySections || []).reduce((acc, section) => {
        const c = section.candidates || {};
        let count = 0;
        ['president','vicePresident','secretary','treasurer'].forEach(k => { if (c[k]?.name) count++; });
        count += (c.members || []).filter(m => m?.name).length;
        return acc + count;
      }, 0) + (election.independents || []).filter(i => i?.name).length;

    const endDate = election.endDate.toISOString().split("T")[0];
    const countdownDays = Math.max(0, Math.ceil((election.endDate - now) / (1000 * 60 * 60 * 24)));

    res.json({
      electionId: election._id,
      totalVoters,
      votesCast,
      turnout: totalVoters ? ((votesCast / totalVoters) * 100).toFixed(1) : '0.0',
      candidateCount,
      positionCount: 4,
      status: 'active',
      endDate,
      countdown: `${countdownDays} days remaining`,
      timeRemainingPercent: Math.max(0, Math.min(100, ((election.endDate - now) / (election.endDate - election.startDate)) * 100)),
      timeRemainingText: `${countdownDays} days remaining`,
    });
  } catch (err) {
    console.error('Get election stats error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const createElection = async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Uploaded files:', req.files);
  try {
    const { electionTitle, startDate, endDate, partySections, independents, samanupatikParties } = req.body;
    const files = req.files || [];

    if (!electionTitle || !startDate || !endDate) {
      return res.status(400).json({ message: 'electionTitle, startDate, and endDate are required' });
    }

    let parsedPartySections = [];
    let parsedIndependents = [];
    let parsedSamanupatikParties = [];
    try {
      parsedPartySections = partySections ? JSON.parse(partySections) : [];
      parsedIndependents = independents ? JSON.parse(independents) : [];
      parsedSamanupatikParties = samanupatikParties ? JSON.parse(samanupatikParties) : [];
    } catch (err) {
      console.error('JSON parsing error:', err);
      return res.status(400).json({ message: 'Invalid JSON format in request body', error: err.message });
    }

    const updatedPartySections = parsedPartySections.map((section, index) => {
      const candidates = { ...section.candidates };
      Object.keys(candidates).forEach((key) => {
        if (key !== 'members') {
          const fileKey = `partySections[${index}][candidates][${key}][photo]`;
          const file = files.find(f => f.fieldname === fileKey);
          candidates[key] = {
            name: candidates[key].name || "",
            photo: file ? `/Uploads/${file.filename}` : "",
          };
        } else {
          candidates.members = candidates.members.map((member, memberIndex) => {
            const memberFileKey = `partySections[${index}][candidates][members][${memberIndex}][photo]`;
            const file = files.find(f => f.fieldname === memberFileKey);
            return {
              name: member.name || "",
              photo: file ? `/Uploads/${file.filename}` : "",
            };
          });
        }
      });
      return { ...section, candidates, partyName: section.partyName || "" };
    });

    const updatedIndependents = parsedIndependents.map((cand, index) => {
      const fileKey = `independents[${index}][photo]`;
      const file = files.find(f => f.fieldname === fileKey);
      return {
        post: cand.post || "",
        name: cand.name || "",
        photo: file ? `/Uploads/${file.filename}` : "",
      };
    });

    const election = new Election({
      electionTitle,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      partySections: updatedPartySections,
      independents: updatedIndependents,
      samanupatikParties: parsedSamanupatikParties,
    });

    console.log('Election to save:', election);
    await election.save();
    res.status(201).json({ message: 'Election created successfully', election });
  } catch (error) {
    console.error('Create election error:', error);
    res.status(500).json({ message: 'Error creating election', error: error.message });
  }
};

// ---------- NEW endpoints used by VotingPage ----------
const getCurrentElectionCandidates = async (req, res) => {
  try {
    const voterId = await getCurrentVoterId(req);
    if (!voterId) return res.status(401).json({ message: 'Unauthorized' });

    const now = new Date();
    let election = await Election.findOne({ startDate: { $lte: now }, endDate: { $gte: now } }).sort({ startDate: -1 });
    if (!election) election = await Election.findOne().sort({ startDate: -1 });
    if (!election) return res.status(404).json({ message: 'No elections found' });

    const alreadyVoted = await Vote.exists({ electionId: election._id, voterId, status: 'confirmed' });
    if (alreadyVoted) {
      return res.status(403).json({ alreadyVoted: true, electionId: String(election._id), title: election.electionTitle });
    }

    return res.json(shapeElectionCandidates(election));
  } catch (err) {
    console.error('getCurrentElectionCandidates error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getElectionCandidatesById = async (req, res) => {
  try {
    const voterId = await getCurrentVoterId(req);
    if (!voterId) return res.status(401).json({ message: 'Unauthorized' });

    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const alreadyVoted = await Vote.exists({ electionId: election._id, voterId, status: 'confirmed' });
    if (alreadyVoted) {
      return res.status(403).json({ alreadyVoted: true, electionId: String(election._id), title: election.electionTitle });
    }

    return res.json(shapeElectionCandidates(election));
  } catch (err) {
    console.error('getElectionCandidatesById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAvailableElections = async (req, res) => {
  try {
    const voterId = await getCurrentVoterId(req);
    if (!voterId) return res.status(401).json({ message: 'Unauthorized' });

    const now = new Date();
    const scope = (req.query.scope || 'active').toLowerCase();
    const findQuery = scope === 'all' ? {} : { startDate: { $lte: now }, endDate: { $gte: now } };

    const elections = await Election.find(findQuery).sort({ startDate: -1 }).lean();
    if (!elections.length) return res.json([]);

    const ids = elections.map(e => e._id);
    const confirmed = await Vote.find({
      electionId: { $in: ids },
      voterId,
      status: 'confirmed',
    }).select('electionId').lean();

    const votedSet = new Set(confirmed.map(v => String(v.electionId)));

    const result = elections
      .filter(e => !votedSet.has(String(e._id)))
      .map(e => ({
        _id: String(e._id),
        electionTitle: e.electionTitle,
        startDate: e.startDate,
        endDate: e.endDate,
      }));

    return res.json(result);
  } catch (err) {
    console.error('getAvailableElections error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCandidates,
  getElectionNews,
  getMoreNews,
  getElectionStats,
  createElection,
  getCurrentElectionCandidates,
  getElectionCandidatesById,
  getAvailableElections,
};

