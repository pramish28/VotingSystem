const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Vote = require("../models/Vote");
const Post = require("../models/Post");

// ----------------- helpers -----------------
async function getCurrentVoterId(req) {
  try {
    if (!req.user?.id) return null;
    const u = await User.findById(req.user.id).select("voterId").lean();
    return u?.voterId || null;
  } catch {
    return null;
  }
}
const POS_KEYS = ['president', 'vicePresident', 'secretary', 'treasurer', 'members'];
function escapeRegExp(s = '') {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Shapes election into positions & candidates for VotingPage */
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
          candidateUserId: slot.candidateUserId ? String(slot.candidateUserId) : null,
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
          candidateUserId: m.candidateUserId ? String(m.candidateUserId) : null,
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
          candidateUserId: ind.candidateUserId ? String(ind.candidateUserId) : null,
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

/* ---------------- Existing endpoints kept as-is ----------------- */
const getCandidates = async (_req, res) => {
  try {
    const candidates = await Candidate.find().select("_id name department slogan platform position color");
    res.json(candidates);
  } catch (err) {
    console.error('Get candidates error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getElectionNews = async (_req, res) => {
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

const getMoreNews = async (_req, res) => {
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

const getElectionStats = async (_req, res) => {
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

/* ---------- Create election (verified-only already enforced upstream) ---------- */
async function findVerifiedByName(name) {
  if (!name || !name.trim()) return null;
  const rx = new RegExp(`^${escapeRegExp(name.trim())}$`, 'i');
  return User.findOne({ name: rx, isVerified: true, role: { $ne: 'admin' } }).select('_id name voterId').lean();
}

async function resolveCandidateUserId(name, usedUserIds, errors, labelForError) {
  if (!name?.trim()) return null; // empty slot, ignore
  const u = await findVerifiedByName(name);
  if (!u) {
    errors.push(`"${labelForError}": "${name}" is not a verified student (exact name match required).`);
    return null;
  }
  const key = String(u._id);
  if (usedUserIds.has(key)) {
    errors.push(`"${labelForError}": ${u.name} is already nominated for another position in this election.`);
  } else {
    usedUserIds.add(key);
  }
  return u._id;
}

/** ✅ Prefer candidateUserId; fallback to name if absent */
async function resolveCandidateFromEntry(entry, usedUserIds, errors, labelForError) {
  // Use ID if present
  if (entry?.candidateUserId) {
    const u = await User.findOne({
      _id: entry.candidateUserId,
      isVerified: true,
      role: { $ne: 'admin' }
    }).select('_id name').lean();

    if (!u) {
      errors.push(`"${labelForError}": selected student is not verified or does not exist.`);
      return { candidateUserId: null, name: entry?.name || '' };
    }
    const key = String(u._id);
    if (usedUserIds.has(key)) {
      errors.push(`"${labelForError}": ${u.name} is already nominated for another position in this election.`);
    } else {
      usedUserIds.add(key);
    }
    return { candidateUserId: u._id, name: (entry?.name && entry.name.trim()) ? entry.name : u.name };
  }

  // Fall back to legacy exact-name match
  const id = await resolveCandidateUserId(entry?.name, usedUserIds, errors, labelForError);
  return { candidateUserId: id, name: entry?.name || '' };
}

const createElection = async (req, res) => {
  console.log('createElection: body bytes partySections=%sB independents=%sB',
  (req.body?.partySections || '').length, (req.body?.independents || '').length);
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

    const errors = [];
    const usedUserIds = new Set();

    const updatedPartySections = [];
    for (let index = 0; index < parsedPartySections.length; index++) {
      const section = parsedPartySections[index] || {};
      const partyName = section.partyName || '';
      const candidates = { ...(section.candidates || {}) };

      // non-member posts
      for (const k of ['president', 'vicePresident', 'secretary', 'treasurer']) {
        const entry = candidates[k] || { name: '' };
        const fileKey = `partySections[${index}][candidates][${k}][photo]`;
        const file = files.find(f => f.fieldname === fileKey);
        const label = `${partyName || 'Party'} - ${k}`;

        const resolved = await resolveCandidateFromEntry(entry, usedUserIds, errors, label);

        candidates[k] = {
          name: resolved.name || '',
          photo: file ? `/Uploads/${file.filename}` : '',
          candidateUserId: resolved.candidateUserId || null,
        };
      }

      // members (array up to 12)
      const members = Array.isArray(candidates.members) ? candidates.members : [];
      const newMembers = [];
      for (let mIdx = 0; mIdx < members.length; mIdx++) {
        const m = members[mIdx] || { name: '' };
        const memberFileKey = `partySections[${index}][candidates][members][${mIdx}][photo]`;
        const file = files.find(f => f.fieldname === memberFileKey);
        const label = `${partyName || 'Party'} - member #${mIdx + 1}`;

        // Skip truly empty rows (no id, no name, no photo)
        if (!m?.candidateUserId && !(m?.name && m.name.trim()) && !file) continue;

        const resolved = await resolveCandidateFromEntry(m, usedUserIds, errors, label);

        newMembers.push({
          name: resolved.name || '',
          photo: file ? `/Uploads/${file.filename}` : '',
          candidateUserId: resolved.candidateUserId || null,
        });
      }

      updatedPartySections.push({
        partyName,
        candidates: { ...candidates, members: newMembers },
      });
    }

    // independents
    const updatedIndependents = [];
    for (let index = 0; index < parsedIndependents.length; index++) {
      const cand = parsedIndependents[index] || {};
      const post = cand.post || '';
      const fileKey = `independents[${index}][photo]`;
      const file = files.find(f => f.fieldname === fileKey);

      // skip empty independent rows
      if (!cand?.candidateUserId && !(cand?.name && cand.name.trim()) && !file && !post) continue;

      const label = `Independent - ${post || 'unknown post'}`;
      const resolved = await resolveCandidateFromEntry(cand, usedUserIds, errors, label);

      updatedIndependents.push({
        post,
        name: resolved.name || '',
        photo: file ? `/Uploads/${file.filename}` : '',
        candidateUserId: resolved.candidateUserId || null,
      });
    }

    if (errors.length) {
      return res.status(400).json({
        message: 'Candidate validation failed',
        errors,
        hint: 'Only verified students can be nominated and a single student cannot be placed in multiple positions.',
      });
    }

    const election = new Election({
      electionTitle,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      partySections: updatedPartySections,
      independents: updatedIndependents,
      samanupatikParties: parsedSamanupatikParties,
    });

    await election.save();
    res.status(201).json({ message: 'Election created successfully', election });
  } catch (error) {
    console.error('Create election error:', error);
    res.status(500).json({ message: 'Error creating election', error: error.message });
  }
};

/* ---------------- Voting page helpers ---------------- */
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

/* ---------------- Simple list for ResultPage ---------------- */
const listAllElections = async (_req, res) => {
  try {
    const items = await Election.find({})
      .select('_id electionTitle startDate endDate createdAt')
      .sort({ startDate: -1 })
      .lean();
    res.json(items);
  } catch (err) {
    console.error('listAllElections error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ---------------- Verified students search (optional) ---------------- */
const listVerifiedStudents = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const rx = q ? new RegExp(escapeRegExp(q), 'i') : null;
    const users = await User.find({
      isVerified: true,
      role: { $ne: 'admin' },
      ...(rx ? { name: rx } : {}),
    })
      .select('_id name faculty program degree symbolNumber photo')
      .limit(50)
      .lean();
    res.json(users);
  } catch (err) {
    console.error('listVerifiedStudents error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ===================== PROBABILITY ENGINE ===================== */
/**
 * Final weights:
 *  - degree 0.10, faculty 0.10, program 0.40, socialPre 0.05, socialPost 0.10, votes 0.25
 * Social score = (unique likers * 1 + unique commenters * 2 - unique dislikers * 1), time-decayed.
 * Time decay half-life = 10 days, use max contribution per reactor across posts (keeps users unique).
 * Redistribution rules:
 *  - If candidate has zero pre/post while the position has some → that chunk goes to Program for that candidate.
 *  - If NO votes at all → move vote weight across Program, Faculty, (Pre if any), (Post if any) by base proportions,
 *      and for a candidate with zero social, their social share from this move flows 80% Program / 20% Faculty.
 *  - Everything normalizes to sum=1 for each candidate’s effective weights.
 * Bayes update:
 *  - Dirichlet posterior with prior mass C=20: alpha_i = 20*prior_i + votes_i  → posterior_i = alpha_i / sum(alpha)
 * Multi-seat (members):
 *  - Seat probability via Monte-Carlo Dirichlet sampling. Trials default 2000, K = min(12, #candidates).
 */
const WEIGHTS = {
  degree: 0.10,
  faculty: 0.10,
  program: 0.40,
  socialPre: 0.05,
  socialPost: 0.10,
  votes: 0.25,
};
const BAYES_PRIOR_STRENGTH = 20;
const SOCIAL_HALFLIFE_DAYS = 10;

// ---- gamma sampler for Dirichlet ----
function randNorm() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
function randGamma(alpha) {
  if (alpha <= 0) return 0;
  if (alpha < 1) {
    const u = Math.random();
    return randGamma(1 + alpha) * Math.pow(u, 1 / alpha);
  }
  const d = alpha - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x = randNorm();
    let v = 1 + c * x;
    if (v <= 0) continue;
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}
function dirichletSample(alphas) {
  const ys = alphas.map(a => randGamma(a));
  const s = ys.reduce((t, x) => t + x, 0);
  if (s === 0) return alphas.map(() => 1 / alphas.length);
  return ys.map(y => y / s);
}

// ---- social engagement with unique reactors + time decay ----
function decayFactor(createdAt) {
  const now = Date.now();
  const ageDays = Math.max(0, (now - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const h = SOCIAL_HALFLIFE_DAYS;
  return Math.pow(0.5, ageDays / h);
}
function accumulateUniqueWeightedReactors(posts, cutoff, before) {
  const posMap = new Map(); // reactorId -> max positive (likes=1, comments=2) * decay
  const negMap = new Map(); // reactorId -> max negative (dislike=1) * decay

  for (const p of posts) {
    const inWindow = before ? (new Date(p.createdAt) < cutoff) : (new Date(p.createdAt) >= cutoff);
    if (!inWindow) continue;
    const w = decayFactor(p.createdAt);

    const likers = Array.isArray(p.likes) ? p.likes.map(String) : [];
    const dislikers = Array.isArray(p.dislikes) ? p.dislikes.map(String) : [];
    const commenters = Array.isArray(p.comments) ? p.comments.map(c => c?.userId).filter(Boolean).map(String) : [];

    const likeSet = new Set(likers);
    const disSet = new Set(dislikers);
    const comSet = new Set(commenters);

    for (const uid of likeSet) {
      const val = 1 * w;
      posMap.set(uid, Math.max(posMap.get(uid) || 0, val));
    }
    for (const uid of comSet) {
      const val = 2 * w;
      posMap.set(uid, Math.max(posMap.get(uid) || 0, val));
    }
    for (const uid of disSet) {
      const val = 1 * w;
      negMap.set(uid, Math.max(negMap.get(uid) || 0, val));
    }
  }

  let score = 0;
  const allReactors = new Set([...posMap.keys(), ...negMap.keys()]);
  for (const uid of allReactors) {
    const pos = posMap.get(uid) || 0;
    const neg = negMap.get(uid) || 0;
    const s = pos - neg;
    if (s > 0) score += s;
  }
  return score;
}

async function computeElectionProbabilities(election, trials = 2000) {
  // 1) collect candidates by position
  const positions = { president: [], vicePresident: [], secretary: [], treasurer: [], members: [] };
  const pushC = (pos, obj) => { if (positions[pos]) positions[pos].push(obj); };

  const allCandUserIds = new Set();

  for (const section of election.partySections || []) {
    const party = section.partyName || '';
    const c = section.candidates || {};
    for (const k of ['president', 'vicePresident', 'secretary', 'treasurer']) {
      const slot = c[k];
      if (slot?._id && (slot.name || slot.photo)) {
        pushC(k, {
          candidateId: String(slot._id),
          candidateUserId: slot.candidateUserId ? String(slot.candidateUserId) : null,
          name: slot.name || '',
          party,
        });
        if (slot.candidateUserId) allCandUserIds.add(String(slot.candidateUserId));
      }
    }
    for (const m of c.members || []) {
      if (m?._id && (m.name || m.photo)) {
        pushC('members', {
          candidateId: String(m._id),
          candidateUserId: m.candidateUserId ? String(m.candidateUserId) : null,
          name: m.name || '',
          party,
        });
        if (m.candidateUserId) allCandUserIds.add(String(m.candidateUserId));
      }
    }
  }
  for (const ind of election.independents || []) {
    if (ind?._id && (ind.name || ind.photo) && ind.post && positions[ind.post]) {
      positions[ind.post].push({
        candidateId: String(ind._id),
        candidateUserId: ind.candidateUserId ? String(ind.candidateUserId) : null,
        name: ind.name || '',
        party: 'Independent',
      });
      if (ind.candidateUserId) allCandUserIds.add(String(ind.candidateUserId));
    }
  }

  // 2) user info for degree/faculty/program
  const userIds = Array.from(allCandUserIds);
  const users = await User.find({ _id: { $in: userIds } })
    .select('_id degree faculty program')
    .lean();
  const userMap = new Map(users.map(u => [String(u._id), u]));

  // totals for shares
  const verified = await User.find({ isVerified: true, role: { $ne: 'admin' } })
    .select('degree faculty program')
    .lean();
  const degCount = new Map();
  const facCount = new Map();
  const progCount = new Map();
  for (const v of verified) {
    if (v.degree) degCount.set(v.degree, (degCount.get(v.degree) || 0) + 1);
    if (v.faculty) facCount.set(v.faculty, (facCount.get(v.faculty) || 0) + 1);
    if (v.program) progCount.set(v.program, (progCount.get(v.program) || 0) + 1);
  }

  // 3) votes map
  const voteAgg = await Vote.aggregate([
    { $match: { electionId: election._id, status: 'confirmed' } },
    { $group: { _id: { pos: '$position', cid: '$candidateId' }, votes: { $sum: 1 } } }
  ]);
  const votesMap = new Map(); // `${pos}|${cid}` -> votes
  for (const row of voteAgg) {
    const key = `${row._id.pos}|${String(row._id.cid)}`;
    votesMap.set(key, row.votes || 0);
  }

  // 4) social (unique reactors with time decay) per candidate user
  const posts = userIds.length
    ? await Post.find({ isApproved: true, userId: { $in: userIds } })
        .select('userId likes dislikes comments createdAt')
        .lean()
    : [];

  const preCut = new Date(election.createdAt || election.startDate || Date.now());
  const preScoreByUser = new Map();
  const postScoreByUser = new Map();
  for (const uid of userIds) {
    const userPosts = posts.filter(p => String(p.userId) === String(uid));
    const spre  = accumulateUniqueWeightedReactors(userPosts, preCut, true);
    const spost = accumulateUniqueWeightedReactors(userPosts, preCut, false);
    preScoreByUser.set(String(uid), spre);
    postScoreByUser.set(String(uid), spost);
  }

  // 5) compute per-position
  const out = { electionId: String(election._id), title: election.electionTitle, positions: {} };

  for (const pos of POS_KEYS) {
    const list = positions[pos] || [];
    if (!list.length) { out.positions[pos] = []; continue; }

    const items = list.map(c => {
      const u = c.candidateUserId ? userMap.get(c.candidateUserId) : null;
      const degreeSize  = u?.degree  ? (degCount.get(u.degree)   || 0) : 0;
      const facultySize = u?.faculty ? (facCount.get(u.faculty)  || 0) : 0;
      const programSize = u?.program ? (progCount.get(u.program) || 0) : 0;

      const vKey = `${pos}|${c.candidateId}`;
      const votes = votesMap.get(vKey) || 0;

      const pre  = c.candidateUserId ? (preScoreByUser.get(c.candidateUserId)  || 0) : 0;
      const post = c.candidateUserId ? (postScoreByUser.get(c.candidateUserId) || 0) : 0;

      return { ...c, degreeSize, facultySize, programSize, votes, pre, post };
    });

    // sums to normalize signals into shares within the position
    const sumDegree  = items.reduce((s, x) => s + x.degreeSize,  0);
    const sumFaculty = items.reduce((s, x) => s + x.facultySize, 0);
    const sumProgram = items.reduce((s, x) => s + x.programSize, 0);
    const sumVotes   = items.reduce((s, x) => s + x.votes,       0);
    const sumPre     = items.reduce((s, x) => s + x.pre,         0);
    const sumPost    = items.reduce((s, x) => s + x.post,        0);

    // base weights
    const w = WEIGHTS;

    // if no votes: distribute the 0.25 weight across P, F, (pre if any), (post if any) by base proportions
    let baseVotesSplit = { program: 0, faculty: 0, socialPre: 0, socialPost: 0 };
    if (sumVotes === 0) {
      const recipients = [
        { key: 'program',   base: w.program,   allowed: true },
        { key: 'faculty',   base: w.faculty,   allowed: true },
        { key: 'socialPre', base: w.socialPre, allowed: sumPre  > 0 },
        { key: 'socialPost',base: w.socialPost,allowed: sumPost > 0 },
      ];
      const denom = recipients.reduce((t, r) => t + (r.allowed ? r.base : 0), 0) || 1;
      for (const r of recipients) {
        if (!r.allowed) continue;
        baseVotesSplit[r.key] = (w.votes * r.base) / denom;
      }
    }

    // per-candidate effective weights & raw scores
    const scored = items.map(x => {
      const D   = sumDegree  ? (x.degreeSize  / sumDegree)  : 0;
      const F   = sumFaculty ? (x.facultySize / sumFaculty) : 0;
      const P   = sumProgram ? (x.programSize / sumProgram) : 0;
      const Spre  = sumPre   ? (x.pre  / sumPre)  : 0;
      const Spost = sumPost  ? (x.post / sumPost) : 0;
      const V   = sumVotes   ? (x.votes / sumVotes) : 0;

      const hasPre  = (sumPre  > 0) && (x.pre  > 0);
      const hasPost = (sumPost > 0) && (x.post > 0);

      const eff = {
        degree: w.degree,
        faculty: w.faculty,
        program: w.program,
        socialPre: w.socialPre,
        socialPost: w.socialPost,
        votes: w.votes,
      };

      if (sumPre > 0 && !hasPre) {
        eff.program += eff.socialPre;
        eff.socialPre = 0;
      }
      if (sumPost > 0 && !hasPost) {
        eff.program += eff.socialPost;
        eff.socialPost = 0;
      }

      if (sumVotes === 0) {
        eff.votes = 0;
        let temp = {
          program: baseVotesSplit.program,
          faculty: baseVotesSplit.faculty,
          socialPre: baseVotesSplit.socialPre,
          socialPost: baseVotesSplit.socialPost,
        };
        if (!hasPre) {
          temp.program += 0.8 * temp.socialPre;
          temp.faculty += 0.2 * temp.socialPre;
          temp.socialPre = 0;
        }
        if (!hasPost) {
          temp.program += 0.8 * temp.socialPost;
          temp.faculty += 0.2 * temp.socialPost;
          temp.socialPost = 0;
        }
        eff.program   += temp.program;
        eff.faculty   += temp.faculty;
        eff.socialPre += temp.socialPre;
        eff.socialPost+= temp.socialPost;
      }

      const effSum = eff.degree + eff.faculty + eff.program + eff.socialPre + eff.socialPost + eff.votes;
      if (effSum > 0) {
        eff.degree    /= effSum;
        eff.faculty   /= effSum;
        eff.program   /= effSum;
        eff.socialPre /= effSum;
        eff.socialPost/= effSum;
        eff.votes     /= effSum;
      }

      const raw =
        eff.degree    * D +
        eff.faculty   * F +
        eff.program   * P +
        eff.socialPre * Spre +
        eff.socialPost* Spost +
        eff.votes     * V;

      return {
        candidateId: x.candidateId,
        name: x.name,
        party: x.party,
        shares: { D, F, P, Spre, Spost, V },
        weightsUsed: eff,
        raw,
        votes: x.votes
      };
    });

    // PRIOR: normalize raw → prior distribution
    let totalRaw = scored.reduce((s, r) => s + r.raw, 0);
    let prior = [];
    if (totalRaw > 0) {
      prior = scored.map(r => r.raw / totalRaw);
    } else {
      prior = scored.map(_ => 1 / scored.length);
    }

    // BAYES update with live votes
    const alphas = scored.map((r, i) => BAYES_PRIOR_STRENGTH * prior[i] + r.votes);
    const alphaSum = alphas.reduce((t, a) => t + a, 0) || 1;
    const posterior = alphas.map(a => a / alphaSum);

    // Multi-seat (members): seat probability via sampling
    let seatProbabilityByIdx = null;
    if (pos === 'members') {
      const K = Math.min(12, scored.length);
      const counts = new Array(scored.length).fill(0);
      for (let t = 0; t < trials; t++) {
        const draw = dirichletSample(alphas);
        const idxs = draw.map((v, i) => ({ i, v }))
                         .sort((a, b) => b.v - a.v)
                         .slice(0, K)
                         .map(x => x.i);
        for (const i of idxs) counts[i]++;
      }
      seatProbabilityByIdx = counts.map(c => +(100 * c / trials).toFixed(2));
    }

    out.positions[pos] = scored.map((r, i) => ({
      candidateId: r.candidateId,
      name: r.name,
      party: r.party,
      probability: +(100 * posterior[i]).toFixed(2),
      seatProbability: seatProbabilityByIdx ? seatProbabilityByIdx[i] : null,
      breakdown: r.shares,
      weightsUsed: r.weightsUsed,
      votes: r.votes,
    }));
  }

  return out;
}

/* --------- Probability endpoints (current / by id) ---------- */
const getElectionProbabilityById = async (req, res) => {
  try {
    const trials = Math.max(500, Math.min(10000, parseInt(req.query.trials || '2000', 10) || 2000));
    const election = await Election.findById(req.params.id).lean();
    if (!election) return res.status(404).json({ message: 'Election not found' });
    const result = await computeElectionProbabilities(election, trials);
    res.json(result);
  } catch (err) {
    console.error('getElectionProbabilityById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCurrentElectionProbability = async (_req, res) => {
  try {
    const trials = 2000;
    const now = new Date();
    let election = await Election.findOne({ startDate: { $lte: now }, endDate: { $gte: now } }).sort({ startDate: -1 }).lean();
    if (!election) election = await Election.findOne().sort({ startDate: -1 }).lean();
    if (!election) return res.status(404).json({ message: 'No elections found' });
    const result = await computeElectionProbabilities(election, trials);
    res.json(result);
  } catch (err) {
    console.error('getCurrentElectionProbability error:', err);
    res.status(500).json({ message: 'Server error' });
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
  listAllElections,
  listVerifiedStudents,

  // NEW:
  getElectionProbabilityById,
  getCurrentElectionProbability,
};
