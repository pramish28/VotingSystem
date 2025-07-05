// const mongoose = require('mongoose');

// const voteSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
//   electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('Vote', voteSchema);
const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  voterId: { type: String, required: true },
  candidateId: { type: String, required: true },
  position: { type: String, required: true },
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vote', VoteSchema);