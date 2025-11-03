const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  voterId: { type: String, required: true }, // e.g., TU-2081-001
  candidateId: { type: String, required: true }, // embedded subdoc _id as string
  position: { type: String, enum: ['president','vicePresident','secretary','treasurer','members'], required: true },
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

// prevent duplicate same-candidate in same position by same voter
VoteSchema.index({ electionId: 1, voterId: 1, position: 1, candidateId: 1 }, { unique: true });
VoteSchema.index({ electionId: 1, voterId: 1, position: 1 });

module.exports = mongoose.model('Vote', VoteSchema);
