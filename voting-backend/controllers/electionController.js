const Candidate = require("../models/Candidate")
const Election = require("../models/Election")
const Notification = require("../models/Notification")

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().select("_id name department slogan platform position color")
    res.json(candidates)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}

exports.getElectionNews = async (req, res) => {
  try {
    const news = await Notification.find().sort({ createdAt: -1 })
    res.json(
      news.map((item) => ({
        type: item.type,
        typeColor: item.typeColor || "text-blue-600 bg-blue-100",
        date: item.createdAt.toISOString().split("T")[0],
        title: item.title,
        content: item.content,
        featured: item.featured || false,
      }))
    )
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}

exports.getMoreNews = async (req, res) => {
  try {
    const news = await Notification.find().sort({ createdAt: -1 }).skip(3).limit(5)
    res.json(
      news.map((item) => ({
        type: item.type,
        typeColor: item.typeColor || "text-blue-600 bg-blue-100",
        date: item.createdAt.toISOString().split("T")[0],
        title: item.title,
        content: item.content,
        featured: item.featured || false,
      }))
    )
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}

exports.getElectionStats = async (req, res) => {
  try {
    const election = await Election.findOne({ status: "active" })
    const totalVoters = await User.countDocuments({ isVerified: true })
    const votesCast = await Vote.countDocuments({ electionId: election._id })
    const candidateCount = await Candidate.countDocuments({ electionId: election._id })
    const endDate = election.endDate.toISOString().split("T")[0]
    const countdown = `${Math.ceil((election.endDate - new Date()) / (1000 * 60 * 60 * 24))} days remaining`

    res.json({
      electionId: election._id,
      totalVoters,
      votesCast,
      turnout: ((votesCast / totalVoters) * 100).toFixed(1),
      candidateCount,
      positionCount: 4, // Assuming 4 positions: president, vp, secretary, treasurer
      status: election.status,
      endDate,
      countdown,
      timeRemainingPercent: ((election.endDate - new Date()) / (election.endDate - election.startDate)) * 100,
      timeRemainingText: countdown,
    })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}