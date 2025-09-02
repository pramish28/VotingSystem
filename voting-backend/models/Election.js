const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, default: '' },
  photo: { type: String, default: '' },
  // 👇 NEW: link to verified student account (optional for legacy elections)
  candidateUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

const partySectionSchema = new mongoose.Schema({
  partyName: { type: String, default: '' },
  candidates: {
    president: candidateSchema,
    vicePresident: candidateSchema,
    secretary: candidateSchema,
    treasurer: candidateSchema,
    members: [candidateSchema], // up to 12
  },
});

const independentCandidateSchema = new mongoose.Schema({
  _id: {type: mongoose.Schema.Types.ObjectId, auto:true},
  post: { type: String, default: '' },
  name: { type: String, default: '' },
  photo: { type: String, default: '' },
  // 👇 NEW: link to verified student account (optional for legacy elections)
  candidateUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

const electionSchema = new mongoose.Schema({
  electionTitle: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  partySections: { type: [partySectionSchema], default: [] },
  independents: { type: [independentCandidateSchema], default: [] },
  samanupatikParties: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Election', electionSchema);
