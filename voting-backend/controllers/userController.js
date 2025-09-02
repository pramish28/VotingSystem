const mongoose = require('mongoose');
const Vote = require('../models/Vote');
const User = require("../models/User");
const Election = require('../models/Election');

const Candidate = require('../models/Candidate'); // if you have top-level candidates

const Activity= require('../models/Activity');

// --- add this near the top of userController.js (after imports) ---
const SINGLE_SEAT = ['president','vicePresident','secretary','treasurer'];
const ALL_POS = [...SINGLE_SEAT, 'members'];

function slotFilled(slot) {
  return !!(slot && (slot._id || slot.name || slot.photo));
}
function escapeRegExp(s=''){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Locate an embedded candidate by id in one election doc
function findCandidateInElection(election, idStr) {
  const id = String(idStr);

  // party sections
  for (let pIndex = 0; pIndex < (election.partySections || []).length; pIndex++) {
    const sec = election.partySections[pIndex];
    const c = sec?.candidates || {};

    // single-seat slots
    for (const k of SINGLE_SEAT) {
      if (c?.[k] && String(c[k]._id) === id) {
        return { type: 'party', partyIndex: pIndex, slot: k, candidate: c[k] };
      }
    }
    // members array
    const members = Array.isArray(c?.members) ? c.members : [];
    const mIndex = members.findIndex(m => m && String(m._id) === id);
    if (mIndex >= 0) {
      return { type: 'member', partyIndex: pIndex, memberIndex: mIndex, candidate: members[mIndex] };
    }
  }

  // independents array
  const ind = Array.isArray(election.independents) ? election.independents : [];
  const indIndex = ind.findIndex(x => x && String(x._id) === id);
  if (indIndex >= 0) {
    return { type: 'independent', indIndex, candidate: ind[indIndex] };
  }

  return null;
}

// Normalize the incoming request body into a destination plan
function parseTarget(body, current) {
  const t = body?.target && typeof body.target === 'object' ? body.target : null;

  const inName  = (body?.name ?? '').trim();
  const inPos   = body?.position ? String(body.position).trim() : undefined;
  const inParty = body?.partyName ? String(body.partyName).trim() : undefined;
  const inPost  = body?.post ? String(body.post).trim() : undefined;

  let destType = null;          // 'party' | 'independent' | null
  let destPartyName = null;     // when type='party'
  let destSlot = null;          // one of ALL_POS

  if (t) {
    destType = t.type === 'independent' ? 'independent' : 'party';
    destPartyName = destType === 'party' ? (t.partyName || '').trim() : null;
    destSlot = (t.position || '').trim();
  } else if (inParty || inPos || inPost) {
    if (inParty) {
      destType = 'party';
      destPartyName = inParty;
      destSlot = (inPos || current.slot || 'members');
    } else if (inPos && current.type === 'independent') {
      destType = 'independent';
      destSlot = inPos;
    } else if (inPost) {
      destType = 'independent';
      destSlot = inPost;
    } else if (inPos) {
      destType = 'party';
      destPartyName = current.partyName || null;
      destSlot = inPos;
    }
  }

  // minor normalization (vicepresident → vicePresident)
  if (destSlot && !ALL_POS.includes(destSlot)) {
    const map = { vicepresident: 'vicePresident', 'vice president': 'vicePresident' };
    const m = map[String(destSlot).toLowerCase()];
    if (m) destSlot = m;
  }

  return { name: inName || null, destType, destPartyName, destSlot };
}



// const Vote = require('../models/Vote');
// const User = require("../models/User");

// exports.getVerifiedUsers = async (req, res) => {
//   try {
//     const verifiedUsers = await User.find(
//       { isVerified: true, role: { $ne: 'admin' } }
//     ).select('name faculty program symbolNumber photo'); // _id is included by default
//     res.json(verifiedUsers);
//   } catch (error) {
//     console.error("Error fetching verified users:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.getVerifiedUsers = async (req, res) => {
  try {
    const verifiedUsers = await User.find(
      { isVerified: true, role: { $ne: 'admin' } }
    )
      .select(
        // deliberately include only safe, needed fields
        'name email degree faculty program major yearOrSemester symbolNumber phoneNumber address photo verifiedAt createdAt isVerified'
      )
      .sort({ verifiedAt: -1, createdAt: -1 });

    res.json(verifiedUsers);
  } catch (error) {
    console.error("Error fetching verified users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // keep other fields
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      department: user.department,
      yearOfStudy: user.yearOfStudy,
      degree: user.degree,
      faculty: user.faculty,
      program: user.program,
      major: user.major,
      yearOrSemester: user.yearOrSemester,
      symbolNumber: user.symbolNumber,
      phoneNumber: user.phoneNumber,
      address: user.address,
      photo: user.photo,

      role: user.role,
      voterId: user.voterId, // ✅ needed by VotingPage identity check
      preferences: user.preferences || { emailNotifications: true, smsAlerts: false, resultNotifications: true },
      hasVoted: user.hasVoted || false,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getVotingHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("votingHistory");
    res.json(user.votingHistory || []);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences: req.body },
      { new: true }
    ).select("preferences");
    res.json(user.preferences);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all candidates (flattened) — null-safe & no blind toObject()
exports.getAllCandidates = async (req, res) => {
  try {
    // You can also do .lean() for perf; both work:
    // const elections = await Election.find({}).lean();
    const elections = await Election.find({}); 

    const toPlain = (doc) =>
      doc && typeof doc.toObject === 'function' ? doc.toObject() : doc;

    const candidatesList = [];

    elections.forEach((election) => {
      const eid = election?._id;

      // Loop through party sections
      (election?.partySections || []).forEach((party) => {
        const partyName = party?.partyName || '';
        const candidates = party?.candidates || {};

        for (const [position, cand] of Object.entries(candidates)) {
          if (position !== 'members') {
            if (!cand) continue; // slot can be null/undefined after delete
            const plain = toPlain(cand);
            if (!plain) continue;
            const hasSomething = plain._id || plain.name || plain.photo;
            if (!hasSomething) continue;

            candidatesList.push({
              ...plain,
              _id: plain._id ? String(plain._id) : undefined,
              position,                 // president, vicePresident, etc.
              partyName,
              electionId: eid ? String(eid) : '',
            });
          } else {
            // members array
            if (!Array.isArray(cand)) continue;
            cand.forEach((member, idx) => {
              if (!member) return;
              const m = toPlain(member);
              if (!m) return;
              const hasSomething = m._id || m.name || m.photo;
              if (!hasSomething) return;

              candidatesList.push({
                ...m,
                _id: m._id ? String(m._id) : undefined,
                position: `Member ${idx + 1}`,
                partyName,
                electionId: eid ? String(eid) : '',
              });
            });
          }
        }
      });

      // Loop through independent candidates
      (election?.independents || []).forEach((ind) => {
        if (!ind) return;
        const plain = toPlain(ind);
        if (!plain) return;
        const hasSomething = plain._id || plain.name || plain.photo || plain.post;
        if (!hasSomething) return;

        candidatesList.push({
          ...plain,
          _id: plain._id ? String(plain._id) : undefined,
          position: plain.post || '',
          partyName: 'Independent',
          electionId: eid ? String(eid) : '',
        });
      });
    });

    // Optionally drop entries that somehow still lack _id
    const clean = candidatesList.filter((c) => !!c._id);

    res.status(200).json(clean);
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Delete candidate by ID

exports.deleteCandidate = async (req, res) => {
  try {
    const id = req.params.id || req.params.candidateId;
    if (!id) return res.status(400).json({ message: 'Candidate ID required' });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid candidate id' });
    }
    const objId = new mongoose.Types.ObjectId(id);

    // (Optional) If you also keep a top-level Candidate collection:
    let removedCandidateDoc = false;
    try {
      const r = await Candidate.findByIdAndDelete(id);
      removedCandidateDoc = !!r;
    } catch {}

    // Walk all elections and remove this candidate from any slot/members/independents
    const elections = await Election.find({}); // get docs (not lean) so we can modify & save
    let modifiedElections = 0;

    for (const e of elections) {
      let changed = false;

      // party sections (4 single-seat slots + members array)
      for (const section of (e.partySections || [])) {
        const c = section.candidates || {};

        const clearSlotIfMatch = (key) => {
          const slot = c[key];
          if (slot && slot._id && String(slot._id) === String(objId)) {
            // remove slot (set undefined so Mongoose deletes it)
            c[key] = undefined;
            changed = true;
          }
        };

        clearSlotIfMatch('president');
        clearSlotIfMatch('vicePresident');
        clearSlotIfMatch('secretary');
        clearSlotIfMatch('treasurer');

        const beforeMembersLen = Array.isArray(c.members) ? c.members.length : 0;
        c.members = (c.members || []).filter(
          (m) => !(m && m._id && String(m._id) === String(objId))
        );
        if (c.members.length !== beforeMembersLen) changed = true;

        // ensure Mongoose notices nested changes
        section.candidates = c;
      }

      // independents array
      const beforeInd = Array.isArray(e.independents) ? e.independents.length : 0;
      e.independents = (e.independents || []).filter(
        (ind) => !(ind && ind._id && String(ind._id) === String(objId))
      );
      if (e.independents.length !== beforeInd) changed = true;

      if (changed) {
        e.markModified('partySections');
        e.markModified('independents');
        await e.save();
        modifiedElections++;
      }
    }

    // Remove votes that referenced this candidate (candidateId is stored as string in your schema)
    let removedVotes = 0;
    try {
      const vres = await Vote.deleteMany({ candidateId: String(id) });
      removedVotes = vres?.deletedCount || 0;
    } catch {}

    if (!removedCandidateDoc && modifiedElections === 0) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    return res.json({
      message: 'Candidate deleted',
      id: String(id),
      removedCandidateDoc,
      affectedElections: modifiedElections,
      removedVotes,
    });
  } catch (err) {
    console.error('deleteCandidate error:', err);
    return res.status(500).json({ message: 'Failed to delete candidate', error: err.message });
  }
};

exports.getAvailableCandidateSlots = async (req, res) => {
  try {
    const { electionId, partyName, candidateId } = req.query;

    // pick election (id → active → latest)
    let election = null;
    if (electionId && mongoose.Types.ObjectId.isValid(electionId)) {
      election = await Election.findById(electionId);
    }
    if (!election) {
      const now = new Date();
      election = await Election.findOne({ startDate: { $lte: now }, endDate: { $gte: now } }).sort({ startDate: -1 });
      if (!election) election = await Election.findOne().sort({ startDate: -1 });
    }
    if (!election) return res.status(404).json({ message: 'No election found' });

    const idStr = candidateId && mongoose.Types.ObjectId.isValid(candidateId) ? String(candidateId) : null;

    // Parties (optionally filtered by partyName for compatibility)
    const parties = (election.partySections || [])
      .filter(sec => !partyName || (sec?.partyName || '') === partyName)
      .map(sec => {
        const c = sec?.candidates || {};
        const emptySingleSeats = SINGLE_SEAT.filter(k => !slotFilled(c[k]));
        const members = Array.isArray(c.members) ? c.members : [];
        const used = members.filter(m => slotFilled(m)).length;
        const capacity = 12;
        const available = Math.max(0, capacity - used);

        let allowedSingleSeatsForCandidate = emptySingleSeats.slice();
        if (idStr) {
          for (const k of SINGLE_SEAT) {
            if (c[k] && String(c[k]._id) === idStr && !allowedSingleSeatsForCandidate.includes(k)) {
              allowedSingleSeatsForCandidate.push(k);
            }
          }
        }
        let allowedMembersSlotsAvailableForCandidate = available;
        if (idStr && members.some(m => m && String(m._id) === idStr)) {
          allowedMembersSlotsAvailableForCandidate = available + 1;
        }

        return {
          partyName: sec?.partyName || '',
          emptySingleSeats,
          members: { used, capacity, available },
          ...(idStr ? {
            allowedSingleSeatsForCandidate,
            allowedMembersSlotsAvailableForCandidate
          } : {})
        };
      });

    // Independents
    const independents = election.independents || [];
    const emptyIndSingleSeats = SINGLE_SEAT.filter(
      k => !independents.some(ind => ind && ind.post === k && slotFilled(ind))
    );
    let allowedIndependentSingleSeatsForCandidate = emptyIndSingleSeats.slice();
    if (idStr) {
      for (const ind of independents) {
        if (ind && String(ind._id) === idStr && SINGLE_SEAT.includes(ind.post) && !allowedIndependentSingleSeatsForCandidate.includes(ind.post)) {
          allowedIndependentSingleSeatsForCandidate.push(ind.post);
        }
      }
    }

    // ---- NEW: FLAT LIST across the whole election (for one dropdown) ----
    const flat = [];

    // Parties single seats
    for (const p of (election.partySections || [])) {
      const c = p?.candidates || {};
      for (const k of SINGLE_SEAT) {
        if (!slotFilled(c[k])) {
          flat.push({
            key: `party:${p.partyName}:${k}`,
            label: `${p.partyName || 'Party'} — ${k}`,
            type: 'party',
            partyName: p.partyName || '',
            slot: k,
            seats: 1,
          });
        }
      }
      // Members (push one entry with "seats" = available count)
      const members = Array.isArray(c.members) ? c.members : [];
      const used = members.filter(m => slotFilled(m)).length;
      const capacity = 12;
      const available = Math.max(0, capacity - used);
      if (available > 0) {
        flat.push({
          key: `party:${p.partyName}:members`,
          label: `${p.partyName || 'Party'} — Members (${available})`,
          type: 'party',
          partyName: p.partyName || '',
          slot: 'members',
          seats: available,
        });
      }
    }

    // Independents single seats
    for (const k of SINGLE_SEAT) {
      const taken = independents.some(ind => ind && ind.post === k && slotFilled(ind));
      if (!taken) {
        flat.push({
          key: `independent:${k}`,
          label: `Independent — ${k}`,
          type: 'independent',
          partyName: null,
          slot: k,
          seats: 1,
        });
      }
    }
    // (Optional) Independent Members — treat as "unlimited"
    flat.push({
      key: `independent:members`,
      label: `Independent — Members (∞)`,
      type: 'independent',
      partyName: null,
      slot: 'members',
      seats: null,
    });

    return res.json({
      electionId: String(election._id),
      parties,
      independents: {
        emptySingleSeats: emptyIndSingleSeats,
        ...(idStr ? { allowedSingleSeatsForCandidate: allowedIndependentSingleSeatsForCandidate } : {})
      },
      flat, // ← use this in the UI for a single combined dropdown
    });
  } catch (err) {
    console.error('getAvailableCandidateSlots error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const id = req.params.id || req.params.candidateId;
    if (!id) return res.status(400).json({ message: 'Candidate ID required' });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid candidate id' });
    }
    const idStr = String(id);
    const { replacementCandidateId } = req.body;

    // find host election + current location of the main candidate
    const elections = await Election.find({});
    let host = null, election = null, partyName = null, currentSlot = null;
    for (const e of elections) {
      const loc = findCandidateInElection(e, idStr);
      if (loc) {
        host = loc;
        election = e;
        if (loc.type === 'party' || loc.type === 'member') {
          partyName = e.partySections[loc.partyIndex]?.partyName || null;
          currentSlot = loc.type === 'party' ? loc.slot : 'members';
        } else {
          currentSlot = (e.independents?.[loc.indIndex]?.post) || null;
        }
        break;
      }
    }
    if (!host || !election) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const current = { type: host.type, partyName, slot: currentSlot };
    const { name, destType, destPartyName, destSlot } = parseTarget(req.body, current);

    const wantsNameChange = !!name && name !== (host.candidate?.name || '');
    const wantsMove = !!destType && (
      destType !== current.type ||
      (destType === 'party' && (destPartyName || '') !== (current.partyName || '')) ||
      (destSlot && destSlot !== (current.slot || ''))
    );

    if (!wantsNameChange && !wantsMove) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    // lock moves if confirmed votes exist
    if (wantsMove) {
      const hasConfirmed = await Vote.exists({ candidateId: idStr, status: 'confirmed' });
      if (hasConfirmed) {
        return res.status(403).json({ message: 'Candidate has confirmed votes; only name can be edited.' });
      }
    }

    // Validate destination first (no mutation yet)
    if (wantsMove) {
      if (destType === 'party') {
        if (!destPartyName || !destSlot) {
          return res.status(400).json({ message: 'partyName and position are required to move into a party' });
        }
        if (!ALL_POS.includes(destSlot)) {
          return res.status(400).json({ message: `Invalid position "${destSlot}"` });
        }
        // occupancy check
        const sections = election.partySections || [];
        let sec = sections.find(s => (s?.partyName || '') === (destPartyName || ''));
        if (!sec) sec = { partyName: destPartyName, candidates: { members: [] } };
        const c = sec.candidates || {};
        if (SINGLE_SEAT.includes(destSlot) && c[destSlot] && String(c[destSlot]._id) !== idStr) {
          return res.status(400).json({ message: `The ${destSlot} slot for party "${destPartyName}" is already filled.` });
        }
        if (destSlot === 'members') {
          const members = Array.isArray(c.members) ? c.members : [];
          const used = members.filter(m => slotFilled(m)).length;
          const capacity = 12;
          if (used >= capacity) return res.status(400).json({ message: 'Members list is full for this party (max 12).' });
        }
      } else if (destType === 'independent') {
        if (!destSlot) return res.status(400).json({ message: 'post (position) is required to move to independent' });
        if (!ALL_POS.includes(destSlot)) {
          return res.status(400).json({ message: `Invalid independent post "${destSlot}"` });
        }
        if (SINGLE_SEAT.includes(destSlot)) {
          const clash = (election.independents || []).some(ind => ind && ind.post === destSlot && slotFilled(ind) && String(ind._id) !== idStr);
          if (clash) return res.status(400).json({ message: `Independent ${destSlot} is already occupied.` });
        }
      } else {
        return res.status(400).json({ message: 'Invalid destination type' });
      }
    }

    // Optional replacement validation (only applies if source is party single-seat)
    let replacement = null;
    if (replacementCandidateId && host.type === 'party' && SINGLE_SEAT.includes(current.slot)) {
      if (!mongoose.Types.ObjectId.isValid(replacementCandidateId)) {
        return res.status(400).json({ message: 'Invalid replacement candidate id' });
      }
      if (String(replacementCandidateId) === idStr) {
        return res.status(400).json({ message: 'Replacement cannot be the same candidate' });
      }

      const repLoc = findCandidateInElection(election, String(replacementCandidateId));
      if (!repLoc) {
        return res.status(404).json({ message: 'Replacement candidate not found in this election' });
      }

      // must be a member of the same party (simple rule)
      if (!(repLoc.type === 'member' && repLoc.partyIndex === host.partyIndex)) {
        return res.status(400).json({ message: 'Replacement must be a member of the same party' });
      }

      // cannot move replacement if they already have confirmed votes
      const repHasVotes = await Vote.exists({ candidateId: String(replacementCandidateId), status: 'confirmed' });
      if (repHasVotes) {
        return res.status(403).json({ message: 'Replacement candidate has confirmed votes; cannot change their position.' });
      }

      replacement = { loc: repLoc, id: String(replacementCandidateId) };
    }

    // --- perform mutation ---
    const candidateObj = host.candidate;
    if (wantsNameChange) candidateObj.name = name;

    const sections = election.partySections || [];

    // Remove main from source
    if (host.type === 'party') {
      const sec = sections[host.partyIndex];
      if (sec?.candidates && SINGLE_SEAT.includes(host.slot)) {
        sec.candidates[host.slot] = undefined;
      }
    } else if (host.type === 'member') {
      const sec = sections[host.partyIndex];
      if (Array.isArray(sec?.candidates?.members)) {
        sec.candidates.members = sec.candidates.members.filter(m => !(m && String(m._id) === idStr));
      }
    } else if (host.type === 'independent') {
      election.independents = (election.independents || []).filter(ind => !(ind && String(ind._id) === idStr));
    }

    // Place main into destination
    if (wantsMove) {
      if (destType === 'party') {
        let idx = sections.findIndex(s => (s?.partyName || '') === (destPartyName || ''));
        if (idx === -1) {
          sections.push({ partyName: destPartyName || '', candidates: { members: [] } });
          idx = sections.length - 1;
        }
        const sec = sections[idx];
        const c = sec.candidates || (sec.candidates = { members: [] });

        if (SINGLE_SEAT.includes(destSlot)) {
          c[destSlot] = candidateObj;
        } else {
          const arr = Array.isArray(c.members) ? c.members : (c.members = []);
          const exists = arr.some(m => m && String(m._id) === idStr);
          if (!exists) {
            if (arr.length >= 12) return res.status(400).json({ message: 'Members list is full for this party (max 12).' });
            arr.push(candidateObj);
          }
        }
        election.partySections[idx] = sec;
      } else {
        // independent
        if (SINGLE_SEAT.includes(destSlot)) {
          // ensure not occupied (already checked)
        }
        candidateObj.post = destSlot;
        election.independents = (election.independents || []);
        const already = election.independents.some(ind => ind && String(ind._id) === idStr);
        if (!already) election.independents.push(candidateObj);
      }
    } else {
      // name-only
    }

    // Fill source with replacement (if any)
    if (replacement && host.type === 'party' && SINGLE_SEAT.includes(current.slot)) {
      const sec = sections[host.partyIndex];
      const c = sec?.candidates || (sec.candidates = { members: [] });

      // remove replacement from members
      if (Array.isArray(c.members)) {
        c.members = c.members.filter(m => !(m && String(m._id) === replacement.id));
      }
      // place into freed single-seat
      c[current.slot] = replacement.loc.candidate;
    }

    election.markModified('partySections');
    election.markModified('independents');
    await election.save();

    return res.json({
      message: 'Candidate updated',
      id: idStr,
      nameChanged: !!wantsNameChange,
      moved: !!wantsMove,
      from: current,
      to: wantsMove ? { type: destType, partyName: destPartyName || null, slot: destSlot } : null,
      replacementUsed: !!replacement,
      replacementId: replacement ? replacement.id : null
    });
  } catch (err) {
    console.error('updateCandidate error:', err);
    return res.status(500).json({ message: 'Failed to update candidate', error: err.message });
  }
};

// Assign a NEW candidate into an EMPTY slot (party or independent)
exports.assignCandidate = async (req, res) => {
  try {
    // Expected body:
    // { electionId?, type: 'party'|'independent', partyName?, slot: 'president'|'vicePresident'|'secretary'|'treasurer'|'members',
    //   candidateUserId? (preferred), name? (fallback) }
    const { electionId, type, partyName, slot, name, candidateUserId } = req.body || {};

    if (!type || !ALL_POS.includes(slot || '')) {
      return res.status(400).json({ message: 'Provide type ("party" or "independent") and a valid slot.' });
    }
    if (type === 'party' && !partyName) {
      return res.status(400).json({ message: 'partyName is required for party assignment.' });
    }

    // Allow either candidateUserId (verified student) OR a free-text name
    if (!candidateUserId && !(name && String(name).trim())) {
      return res.status(400).json({ message: 'Provide either candidateUserId (verified student) or a name.' });
    }

    // locate election (id → active → latest)
    let election = null;
    if (electionId && mongoose.Types.ObjectId.isValid(electionId)) {
      election = await Election.findById(electionId);
    }
    if (!election) {
      const now = new Date();
      election = await Election.findOne({ startDate: { $lte: now }, endDate: { $gte: now } }).sort({ startDate: -1 });
      if (!election) election = await Election.findOne().sort({ startDate: -1 });
    }
    if (!election) return res.status(404).json({ message: 'No election found' });

    // If candidateUserId is provided, validate it's a verified (non-admin) student and fetch their name
    let userDoc = null;
    if (candidateUserId) {
      if (!mongoose.Types.ObjectId.isValid(candidateUserId)) {
        return res.status(400).json({ message: 'Invalid candidateUserId' });
      }
      userDoc = await User.findOne({
        _id: candidateUserId,
        isVerified: true,
        role: { $ne: 'admin' }
      }).select('_id name').lean();
      if (!userDoc) {
        return res.status(400).json({ message: 'candidateUserId is not a verified student or does not exist.' });
      }
    }

    // Ensure the same student isn't already nominated elsewhere in this election (only when candidateUserId is provided)
    if (userDoc) {
      const uid = String(userDoc._id);
      const dupe = (() => {
        for (const sec of (election.partySections || [])) {
          const c = sec?.candidates || {};
          for (const k of SINGLE_SEAT) if (c[k]?.candidateUserId && String(c[k].candidateUserId) === uid) return true;
          for (const m of (c.members || [])) if (m?.candidateUserId && String(m.candidateUserId) === uid) return true;
        }
        for (const ind of (election.independents || [])) {
          if (ind?.candidateUserId && String(ind.candidateUserId) === uid) return true;
        }
        return false;
      })();
      if (dupe) return res.status(400).json({ message: 'This student is already nominated in this election.' });
    }

    // Build embedded candidate: prefer verified user's name; else use provided free-text name
    const embeddedName = userDoc?.name || String(name || '').trim();
    if (!embeddedName) {
      return res.status(400).json({ message: 'Candidate name could not be resolved.' });
    }

    const newCand = {
      _id: new mongoose.Types.ObjectId(),
      name: embeddedName,
      photo: '',
      candidateUserId: userDoc ? userDoc._id : null,
    };

    if (type === 'party') {
      // find or create the party section
      const sections = election.partySections || (election.partySections = []);
      let idx = sections.findIndex(s => (s?.partyName || '') === (partyName || ''));
      if (idx === -1) {
        sections.push({ partyName: partyName || '', candidates: { members: [] } });
        idx = sections.length - 1;
      }
      const sec = sections[idx];
      const c = sec.candidates || (sec.candidates = { members: [] });

      if (SINGLE_SEAT.includes(slot)) {
        if (slotFilled(c[slot])) {
          return res.status(400).json({ message: `The ${slot} slot for party "${partyName}" is already filled.` });
        }
        c[slot] = newCand;
      } else {
        // members
        const arr = Array.isArray(c.members) ? c.members : (c.members = []);
        if (arr.length >= 12) {
          return res.status(400).json({ message: 'Members list is full for this party (max 12).' });
        }
        arr.push(newCand);
      }

      election.partySections[idx] = sec;
    } else if (type === 'independent') {
      election.independents = (election.independents || []);
      if (SINGLE_SEAT.includes(slot)) {
        const clash = election.independents.some(ind => ind && ind.post === slot && slotFilled(ind));
        if (clash) return res.status(400).json({ message: `Independent ${slot} is already occupied.` });
      }
      election.independents.push({ ...newCand, post: slot });
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }

    election.markModified('partySections');
    election.markModified('independents');
    await election.save();

    return res.status(201).json({
      message: 'Candidate assigned',
      electionId: String(election._id),
      candidateId: String(newCand._id),
      type,
      partyName: type === 'party' ? partyName : null,
      slot
    });
  } catch (err) {
    console.error('assignCandidate error:', err);
    return res.status(500).json({ message: 'Failed to assign candidate', error: err.message });
  }
};


// List verified students who are NOT already nominated in the target election
// GET /api/candidates/eligible-students?electionId=<id>&q=<search>&limit=50
exports.listEligibleVerifiedStudents = async (req, res) => {
  try {
    const { electionId, q = '', limit = 50 } = req.query;

    // choose election: explicit -> active -> latest
    let election = null;
    if (electionId && mongoose.Types.ObjectId.isValid(electionId)) {
      election = await Election.findById(electionId);
    }
    if (!election) {
      const now = new Date();
      election = await Election.findOne({ startDate: { $lte: now }, endDate: { $gte: now } }).sort({ startDate: -1 });
      if (!election) election = await Election.findOne().sort({ startDate: -1 });
    }
    if (!election) return res.status(404).json({ message: 'No election found' });

    // collect candidateUserIds already used in this election
    const used = new Set();
    for (const sec of (election.partySections || [])) {
      const c = sec?.candidates || {};
      for (const k of SINGLE_SEAT) {
        if (c[k]?.candidateUserId) used.add(String(c[k].candidateUserId));
      }
      for (const m of (c.members || [])) {
        if (m?.candidateUserId) used.add(String(m.candidateUserId));
      }
    }
    for (const ind of (election.independents || [])) {
      if (ind?.candidateUserId) used.add(String(ind.candidateUserId));
    }

    const filter = {
      isVerified: true,
      role: { $ne: 'admin' },
      ...(used.size ? { _id: { $nin: Array.from(used) } } : {}),
    };
    if (q && q.trim()) {
      filter.name = new RegExp(escapeRegExp(q.trim()), 'i');
    }

    const students = await User.find(filter)
      .select('_id name faculty program degree symbolNumber photo')
      .limit(Math.max(1, Math.min(200, parseInt(limit, 10) || 50)))
      .lean();

    return res.json({
      electionId: String(election._id),
      count: students.length,
      students
    });
  } catch (err) {
    console.error('listEligibleVerifiedStudents error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};




// --- STATS: distribution of students for manual probability checks ---
exports.getUserStats = async (req, res) => {
  try {
    // Query flags:
    // ?verified=1 (default) → only verified students
    // ?verified=0 → include unverified too
    // ?role=student|admin|all (default: student+non-admin only)
    const verifiedParam = (req.query.verified ?? '1').toString().toLowerCase();
    const includeUnverified = verifiedParam === '0' || verifiedParam === 'false';

    const roleParam = (req.query.role ?? 'student').toString().toLowerCase();
    const roleMatch =
      roleParam === 'all'
        ? {} // include admins too
        : { role: { $ne: 'admin' } }; // default: exclude admins

    const match = {
      ...(includeUnverified ? {} : { isVerified: true }),
      ...roleMatch,
    };

    // Basic totals
    const [totalAll, totalVerified] = await Promise.all([
      // All non-admin users in DB (helps sanity check)
      (async () => {
        const m = { ...roleMatch };
        return await (await import('mongoose')).default.model('User').countDocuments(m);
      })(),
      // Verified, non-admin
      (async () => {
        const m = { isVerified: true, ...roleMatch };
        return await (await import('mongoose')).default.model('User').countDocuments(m);
      })(),
    ]);

    // Helper builders
    const groupCount = (expr) => [
      { $match: match },
      { $group: { _id: expr, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ];

    const mapId = (arr, fields) =>
      arr.map((x) => {
        const obj = { count: x.count };
        if (typeof x._id === 'object' && x._id !== null) {
          fields.forEach((f) => (obj[f] = x._id[f] ?? null));
        } else {
          obj._id = x._id ?? null;
        }
        return obj;
      });

    // Run aggregations
    const [
      byDegree,
      byFaculty,
      byProgram,
      byMajor,
      byDegreeFaculty,
      byFacultyProgram,
      byProgramLevel,
    ] = await Promise.all([
      User.aggregate(groupCount('$degree')),
      User.aggregate(groupCount('$faculty')),
      User.aggregate(groupCount('$program')),
      User.aggregate([
        { $match: match },
        { $group: { _id: { $ifNull: ['$major', 'None'] }, count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
      User.aggregate(groupCount({ degree: '$degree', faculty: '$faculty' })),
      User.aggregate(groupCount({ faculty: '$faculty', program: '$program' })),
      User.aggregate(groupCount({ program: '$program', yearOrSemester: '$yearOrSemester' })),
    ]);

    // Compact maps for quick manual checks
    const toMap = (arr) => Object.fromEntries(arr.map((x) => [x._id, x.count]));
    const toComboMap = (arr, keys) => {
      const out = {};
      arr.forEach((row) => {
        const k = keys.map((f) => row[f]).join(' | ');
        out[k] = (out[k] || 0) + row.count;
      });
      return out;
    };

    res.json({
      scope: {
        onlyVerified: !includeUnverified,
        excludeAdmins: roleParam !== 'all',
      },
      totals: {
        allNonAdmin: totalAll,
        verifiedNonAdmin: totalVerified,
        inThisQuery: await User.countDocuments(match),
      },

      // Flat lists (easy to eyeball)
      degree: byDegree.map((x) => ({ degree: x._id, count: x.count })),
      faculty: byFaculty.map((x) => ({ faculty: x._id, count: x.count })),
      program: byProgram.map((x) => ({ program: x._id, count: x.count })),
      major: byMajor.map((x) => ({ major: x._id, count: x.count })),

      // Combos useful for probability checks
      degree_faculty: mapId(byDegreeFaculty, ['degree', 'faculty']),
      faculty_program: mapId(byFacultyProgram, ['faculty', 'program']),
      program_level: mapId(byProgramLevel, ['program', 'yearOrSemester']),

      // Quick lookup maps
      quickMaps: {
        byDegree: toMap(byDegree),
        byFaculty: toMap(byFaculty),
        byProgram: toMap(byProgram),
        byMajor: Object.fromEntries(byMajor.map((x) => [x._id, x.count])),
        degreeFaculty: toComboMap(mapId(byDegreeFaculty, ['degree', 'faculty']), [
          'degree',
          'faculty',
        ]),
        facultyProgram: toComboMap(mapId(byFacultyProgram, ['faculty', 'program']), [
          'faculty',
          'program',
        ]),
      },
    });
  } catch (err) {
    console.error('getUserStats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = Object.assign({}, module.exports, {
  getAllCandidates:
    (module.exports && module.exports.getAllCandidates) ||
    (typeof getAllCandidates === 'function' ? getAllCandidates : (exports && exports.getAllCandidates)),

  deleteCandidate:
    (module.exports && module.exports.deleteCandidate) ||
    (typeof deleteCandidate === 'function' ? deleteCandidate : (exports && exports.deleteCandidate)),
});

// ---- FINAL EXPORT MERGE (keep as last lines) ----
module.exports = Object.assign({}, module.exports, {
  getAllCandidates:
    (module.exports && module.exports.getAllCandidates) ||
    (typeof getAllCandidates === 'function' ? getAllCandidates : (exports && exports.getAllCandidates)),

  deleteCandidate:
    (module.exports && module.exports.deleteCandidate) ||
    (typeof deleteCandidate === 'function' ? deleteCandidate : (exports && exports.deleteCandidate)),

  updateCandidate:
    (module.exports && module.exports.updateCandidate) ||
    (typeof updateCandidate === 'function' ? updateCandidate : (exports && exports.updateCandidate)),

  getAvailableCandidateSlots:
    (module.exports && module.exports.getAvailableCandidateSlots) ||
    (typeof getAvailableCandidateSlots === 'function' ? getAvailableCandidateSlots : (exports && exports.getAvailableCandidateSlots)),
assignCandidate:
    (module.exports && module.exports.assignCandidate) ||
    (typeof assignCandidate === 'function' ? assignCandidate : (exports && exports.assignCandidate)),

    listEligibleVerifiedStudents:
    (module.exports && module.exports.listEligibleVerifiedStudents) ||
    (typeof listEligibleVerifiedStudents === 'function' ? listEligibleVerifiedStudents : (exports && exports.listEligibleVerifiedStudents)),

});
