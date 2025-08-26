// const mongoose = require('mongoose');

// const candidateSchema = new mongoose.Schema({
//   name: { type: String, default: "" }, // Optional
//   photo: { type: String, default: "" }, // Optional
// });

// const partySectionSchema = new mongoose.Schema({
//   partyName: { type: String, default: "" }, // Optional
//   candidates: {
//     president: candidateSchema,
//     vicePresident: candidateSchema,
//     secretary: candidateSchema,
//     treasurer: candidateSchema,
//     members: [candidateSchema], // Array of up to 12 members, optional
//   },
// });

// const independentCandidateSchema = new mongoose.Schema({
//   post: { type: String, default: "" }, // Optional
//   name: { type: String, default: "" }, // Optional
//   photo: { type: String, default: "" }, // Optional
// });

// const electionSchema = new mongoose.Schema({
//   electionTitle: { type: String, required: true },
//   startDate: { type: Date, required: true },
//   endDate: { type: Date, required: true },
//   partySections: { type: [partySectionSchema], default: [] }, // Optional
//   independents: { type: [independentCandidateSchema], default: [] }, // Optional
//   samanupatikParties: { type: [String], default: [] }, // Optional
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('Election', electionSchema);

// models/Election.js
const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
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
