const mongoose = require('mongoose');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const User = require('../models/User');

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Post = require('../models/Post');

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

    const existingExact = await Vote.findOne({ electionId: new mongoose.Types.ObjectId(electionId), voterId, position, candidateId });
    if (existingExact) {
      return res.status(200).json({ message: 'Vote already recorded (pending or confirmed).', voteId: existingExact._id });
    }

    const existingForPosition = await Vote.countDocuments({ electionId: new mongoose.Types.ObjectId(electionId), voterId, position });
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
      return res.status(200).json({ message: 'Vote already recorded (duplicate index).' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

const confirmVote = async (req, res) => {
  try {
    const { electionId, voterId, position, candidateId } = req.body;
    if (!electionId || !voterId || !position || !candidateId) {
      return res.status(400).json({ message: 'electionId, voterId, position, candidateId are required.' });
    }

    const vote = await Vote.findOne({
      electionId: new mongoose.Types.ObjectId(electionId),
      voterId,
      position,
      candidateId,
    });
    if (!vote) return res.status(404).json({ message: 'Vote not found.' });

    if (vote.status !== 'confirmed') {
      vote.status = 'confirmed';
      await vote.save();
    }

    // live update
    const io = req.app.get('io');
    if (io) {
      io.to(`election:${electionId}`).emit('results:update', { electionId });
      io.to(`election:${electionId}`).emit('probability:update', { electionId });
    }

    return res.json({ message: 'Vote confirmed.' });
  } catch (err) {
    console.error('Confirm vote error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const confirmAllVotes = async (req, res) => {
  try {
    const { electionId, voterId } = req.body;
    if (!electionId || !voterId) {
      return res.status(400).json({ message: 'electionId and voterId are required.' });
    }

    const result = await Vote.updateMany(
      { electionId: new mongoose.Types.ObjectId(electionId), voterId, status: 'pending' },
      { $set: { status: 'confirmed' } }
    );

    // live update
    const io = req.app.get('io');
    if (io) {
      io.to(`election:${electionId}`).emit('results:update', { electionId });
      io.to(`election:${electionId}`).emit('probability:update', { electionId });
    }

    return res.json({ message: 'All votes confirmed.', modified: result.modifiedCount || 0 });
  } catch (err) {
    console.error('Confirm all votes error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
/** GET /api/vote/results?electionId=... -> tallies by position (confirmed only), includes 0-vote candidates */
const getResults = async (req, res) => {
  try {
    let { electionId } = req.query;

    // default to current or latest election if not provided
    if (!electionId) {
      const now = new Date();
      let el = await Election.findOne({ startDate: { $lte: now }, endDate: { $gte: now } })
        .sort({ startDate: -1 })
        .lean();
      if (!el) el = await Election.findOne().sort({ startDate: -1 }).lean();
      if (!el) return res.json({ electionId: '', results: [] });
      electionId = String(el._id);
    }

    const election = await Election.findById(electionId).lean();
    if (!election) return res.status(404).json({ message: 'Election not found.' });

    // 1) Build full candidate list (do NOT require name/photo)
    const all = []; // {candidateId, position, name, party}
    for (const section of election.partySections || []) {
      const party = section.partyName || '';
      const c = section.candidates || {};
      for (const k of ['president','vicePresident','secretary','treasurer']) {
        const slot = c[k];
        if (slot?._id) {
          all.push({
            candidateId: String(slot._id),
            position: k,
            name: slot.name || '',
            party,
          });
        }
      }
      for (const m of c.members || []) {
        if (m?._id) {
          all.push({
            candidateId: String(m._id),
            position: 'members',
            name: m.name || '',
            party,
          });
        }
      }
    }
    for (const ind of election.independents || []) {
      if (ind?._id && ind?.post) {
        all.push({
          candidateId: String(ind._id),
          position: ind.post,
          name: ind.name || '',
          party: 'Independent',
        });
      }
    }

    // 2) Sum confirmed votes
    const agg = await Vote.aggregate([
      { $match: { electionId: election._id, status: 'confirmed' } },
      { $group: { _id: { candidateId: '$candidateId', position: '$position' }, votes: { $sum: 1 } } },
    ]);
    const votesMap = new Map(); // `${pos}|${cid}` -> votes
    for (const row of agg) {
      const key = `${row._id.position}|${String(row._id.candidateId)}`;
      votesMap.set(key, row.votes || 0);
    }

    // 3) Totals per position
    const totalsByPosition = {};
    for (const item of all) {
      const v = votesMap.get(`${item.position}|${item.candidateId}`) || 0;
      totalsByPosition[item.position] = (totalsByPosition[item.position] || 0) + v;
    }

    // 4) Return every candidate, even if votes=0
    const results = all.map((item) => {
      const v = votesMap.get(`${item.position}|${item.candidateId}`) || 0;
      const total = totalsByPosition[item.position] || 0;
      const pct = total ? (v / total) * 100 : 0;
      return {
        candidateId: item.candidateId,
        position: item.position,
        name: item.name,
        party: item.party,
        votes: v,
        percentage: +pct.toFixed(2),
      };
    });

    return res.json({ electionId, results });
  } catch (err) {
    console.error('Get results error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};



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

// Collect results (shared by PDF endpoints)
async function computeResultsForCsv(electionIdFromQuery) {
  let electionId = electionIdFromQuery;
  if (!electionId) {
    const now = new Date();
    let el = await Election.findOne({ startDate: { $lte: now }, endDate: { $gte: now } })
      .sort({ startDate: -1 }).lean();
    if (!el) el = await Election.findOne().sort({ startDate: -1 }).lean();
    if (!el) return { election: null, electionId: '', rows: [] };
    electionId = String(el._id);
  }
  const election = await Election.findById(electionId).lean();
  if (!election) return { election: null, electionId: electionId, rows: [] };

  const all = [];
  for (const section of election.partySections || []) {
    const party = section.partyName || '';
    const c = section.candidates || {};
    for (const k of ['president','vicePresident','secretary','treasurer']) {
      const slot = c[k];
      if (slot && slot._id) {
        all.push({ candidateId: String(slot._id), position: k, name: slot.name || '', party: party });
      }
    }
    for (const m of (c.members || [])) {
      if (m && m._id) {
        all.push({ candidateId: String(m._id), position: 'members', name: m.name || '', party: party });
      }
    }
  }
  for (const ind of (election.independents || [])) {
    if (ind && ind._id && ind.post) {
      all.push({ candidateId: String(ind._id), position: ind.post, name: ind.name || '', party: 'Independent' });
    }
  }

  const agg = await Vote.aggregate([
    { $match: { electionId: election._id, status: 'confirmed' } },
    { $group: { _id: { candidateId: '$candidateId', position: '$position' }, votes: { $sum: 1 } } },
  ]);

  const votesMap = new Map();
  for (const row of agg) {
    const key = row._id.position + '|' + String(row._id.candidateId);
    votesMap.set(key, row.votes || 0);
  }

  const totalsByPosition = {};
  for (const item of all) {
    const key = item.position + '|' + item.candidateId;
    const v = votesMap.get(key) || 0;
    totalsByPosition[item.position] = (totalsByPosition[item.position] || 0) + v;
  }

  const rows = all.map(function(item) {
    const key = item.position + '|' + item.candidateId;
    const v = votesMap.get(key) || 0;
    const total = totalsByPosition[item.position] || 0;
    const pct = total ? (v / total) * 100 : 0;
    return {
      position: item.position,
      name: item.name,
      party: item.party,
      votes: v,
      percentage: +pct.toFixed(2),
      candidateId: item.candidateId
    };
  });

  return { election: election, electionId: electionId, rows: rows };
}

function posLabel(key) {
  if (key === 'vicePresident') return 'Vice President';
  if (key === 'president') return 'President';
  if (key === 'secretary') return 'Secretary';
  if (key === 'treasurer') return 'Treasurer';
  if (key === 'members') return 'Members';
  return key;
}

function drawPositionTable(doc, pos, rows, marginLeft, colWidths, startY) {
  const headerY = startY;
  const lineGap = 18;
  const pageBottom = doc.page.height - 64;
  const x = marginLeft;

  // Section title
  doc.font('Helvetica-Bold').fontSize(14).text(posLabel(pos), x, headerY);
  let y = headerY + 8;
  y += 8;

  // Table headers
  doc.font('Helvetica-Bold').fontSize(11);
  doc.text('Candidate', x, y, { width: colWidths.name });
  doc.text('Party', x + colWidths.name, y, { width: colWidths.party });
  doc.text('Votes', x + colWidths.name + colWidths.party, y, { width: colWidths.votes, align: 'right' });
  doc.text('%', x + colWidths.name + colWidths.party + colWidths.votes, y, { width: colWidths.pct, align: 'right' });
  y += 14;
  doc.moveTo(x, y).lineTo(x + colWidths.name + colWidths.party + colWidths.votes + colWidths.pct, y).strokeColor('#cccccc').lineWidth(0.5).stroke();
  y += 6;

  doc.font('Helvetica').fontSize(11);

  if (!rows.length) {
    if (y > pageBottom) { doc.addPage(); y = 64; }
    doc.text('No candidates', x, y);
    return y + lineGap;
  }

  for (const r of rows) {
    if (y > pageBottom) {
      doc.addPage();
      y = 64;
      doc.font('Helvetica-Bold').fontSize(11);
      doc.text('Candidate', x, y, { width: colWidths.name });
      doc.text('Party', x + colWidths.name, y, { width: colWidths.party });
      doc.text('Votes', x + colWidths.name + colWidths.party, y, { width: colWidths.votes, align: 'right' });
      doc.text('%', x + colWidths.name + colWidths.party + colWidths.votes, y, { width: colWidths.pct, align: 'right' });
      y += 14;
      doc.moveTo(x, y).lineTo(x + colWidths.name + colWidths.party + colWidths.votes + colWidths.pct, y).strokeColor('#cccccc').lineWidth(0.5).stroke();
      y += 6;
      doc.font('Helvetica').fontSize(11);
    }

    doc.text(r.name || '-', x, y, { width: colWidths.name });
    doc.text(r.party || '-', x + colWidths.name, y, { width: colWidths.party });
    doc.text(String(r.votes || 0), x + colWidths.name + colWidths.party, y, { width: colWidths.votes, align: 'right' });
    doc.text(String(r.percentage != null ? r.percentage : 0), x + colWidths.name + colWidths.party + colWidths.votes, y, { width: colWidths.pct, align: 'right' });
    y += lineGap;
  }
  return y + 8;
}

function buildResultsPdf(doc, election, rows) {
  const margin = 48;
  const x = margin;
  let y = margin;

  doc.font('Helvetica-Bold').fontSize(18).text('Election Results Summary', x, y);
  y += 20;
  doc.font('Helvetica').fontSize(12).text('Election: ' + String(election.electionTitle || 'Untitled'), x, y);
  y += 16;

  const nowStr = new Date().toLocaleString();
  doc.text('Generated: ' + nowStr, x, y);
  y += 18;

  doc.moveTo(x, y).lineTo(doc.page.width - margin, y).strokeColor('#999999').lineWidth(0.8).stroke();
  y += 12;

  const groups = { president: [], vicePresident: [], secretary: [], treasurer: [], members: [] };
  for (const r of rows) {
    if (groups[r.position]) groups[r.position].push(r);
  }

  const col = { name: 240, party: 140, votes: 70, pct: 50 };
  const order = ['president','vicePresident','secretary','treasurer','members'];

  for (const pos of order) {
    if (y > doc.page.height - 140) { doc.addPage(); y = margin; }
    y = drawPositionTable(doc, pos, groups[pos] || [], x, col, y);
    y += 8;
  }

  const footer = 'Powered by TU College Election Management System';
  doc.fontSize(10).fillColor('#666666');
  const w = doc.widthOfString(footer);
  doc.text(footer, (doc.page.width - w) / 2, doc.page.height - margin + 8);
  doc.fillColor('#000000');
}

// GET /api/vote/results/export.pdf?electionId=... [&save=true]
const exportResultsPdf = async (req, res) => {
  try {
    const electionId = req.query.electionId;
    const out = await computeResultsForCsv(electionId);
    if (!out.election) return res.status(404).json({ message: 'Election not found.' });

    const safeTitle = String(out.election.electionTitle || 'Election').replace(/[^\w\-]+/g, '_');
    const baseName = 'TU_Results_' + safeTitle + '_' + out.electionId;

    const shouldSave = String(req.query.save || '').toLowerCase() === 'true';
    if (shouldSave) {
      const resultsDir = path.join(__dirname, '..', 'Uploads', 'results');
      fs.mkdirSync(resultsDir, { recursive: true });
      const filename = baseName + '_' + Date.now() + '.pdf';
      const full = path.join(resultsDir, filename);
      const doc = new PDFDocument({ autoFirstPage: true, margin: 48 });
      const stream = fs.createWriteStream(full);
      doc.pipe(stream);
      buildResultsPdf(doc, out.election, out.rows);
      doc.end();
      stream.on('finish', function() {
        return res.json({ url: '/Uploads/results/' + filename });
      });
      stream.on('error', function(err) {
        console.error('PDF save error:', err);
        return res.status(500).json({ message: 'Failed to export PDF' });
      });
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + baseName + '.pdf"');
    const doc = new PDFDocument({ autoFirstPage: true, margin: 48 });
    doc.pipe(res);
    buildResultsPdf(doc, out.election, out.rows);
    doc.end();
  } catch (err) {
    console.error('exportResultsPdf error:', err);
    return res.status(500).json({ message: 'Failed to export PDF' });
  }
};

// GET /api/vote/results/export-all.pdf -> returns [{electionId,title,url,filename}]
const exportAllElectionsPdf = async (_req, res) => {
  try {
    const elections = await Election.find({})
      .select('_id electionTitle startDate')
      .sort({ startDate: -1 })
      .lean();
    if (!elections.length) return res.json({ files: [] });

    const resultsDir = path.join(__dirname, '..', 'Uploads', 'results');
    fs.mkdirSync(resultsDir, { recursive: true });

    const files = [];
    for (const el of elections) {
      const out = await computeResultsForCsv(String(el._id));
      const safeTitle = String(el.electionTitle || 'Election').replace(/[^\w\-]+/g, '_');
      const filename = 'TU_Results_' + safeTitle + '_' + String(el._id) + '.pdf';
      const full = path.join(resultsDir, filename);

      await new Promise(function(resolve, reject) {
        const doc = new PDFDocument({ autoFirstPage: true, margin: 48 });
        const stream = fs.createWriteStream(full);
        stream.on('finish', resolve);
        stream.on('error', reject);
        doc.pipe(stream);
        buildResultsPdf(doc, out.election, out.rows);
        doc.end();
      });

      files.push({
        electionId: String(el._id),
        title: el.electionTitle,
        filename: filename,
        url: '/Uploads/results/' + filename
      });
    }
    return res.json({ files: files });
  } catch (err) {
    console.error('exportAllElectionsPdf error:', err);
    return res.status(500).json({ message: 'Failed to export all PDFs' });
  }
};

// POST /api/vote/results/share-summary-pdf { electionId?, note? } -> auto-approved post with PDF link
const shareResultsSummaryPdf = async (req, res) => {
  try {
    const body = req.body || {};
    const electionId = body.electionId;
    const note = body.note;

    const out = await computeResultsForCsv(electionId);
    if (!out.election) return res.status(404).json({ message: 'Election not found.' });

    const resultsDir = path.join(__dirname, '..', 'Uploads', 'results');
    fs.mkdirSync(resultsDir, { recursive: true });

    const safeTitle = String(out.election.electionTitle || 'Election').replace(/[^\w\-]+/g, '_');
    const filename = 'TU_Results_' + safeTitle + '_' + out.electionId + '_' + Date.now() + '.pdf';
    const full = path.join(resultsDir, filename);

    await new Promise(function(resolve, reject) {
      const doc = new PDFDocument({ autoFirstPage: true, margin: 48 });
      const stream = fs.createWriteStream(full);
      stream.on('finish', resolve);
      stream.on('error', reject);
      doc.pipe(stream);
      buildResultsPdf(doc, out.election, out.rows);
      doc.end();
    });

    const publicUrl = '/Uploads/results/' + filename;
    const absolute = req.protocol + '://' + req.get('host') + publicUrl;

    const base = note && note.trim() ? note.trim() : 'Results Summary for "' + out.election.electionTitle + '".';
    const content = base + '\n\nDownload PDF: ' + absolute;

    const post = new Post({
      userId: req.user.id,
      content: content,
      category: 'results',
      image: null,
      isApproved: true
    });
    await post.save();

    const io = req.app.get('io');
    if (io) io.emit('post:new', { postId: String(post._id) });

    return res.json({ message: 'Published Results Summary (PDF) post', postId: post._id, url: publicUrl });
  } catch (err) {
    console.error('shareResultsSummaryPdf error:', err);
    return res.status(500).json({ message: 'Failed to publish PDF summary' });
  }
};

module.exports = {
  submitVote,
  confirmVote,
  confirmAllVotes,
  getResults,
  deleteMyVotesForElection,
  exportResultsPdf,
  exportAllElectionsPdf,
  shareResultsSummaryPdf,
};