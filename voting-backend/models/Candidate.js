const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  slogan: { type: String },
  platform: [{ type: String }],
  position: { type: String, enum: ["president", "vicePresident", "secretary", "treasurer"], required: true },
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
  color: { type: String, default: "bg-blue-600" },
})

module.exports = mongoose.model("Candidate", candidateSchema);