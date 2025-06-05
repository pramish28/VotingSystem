const User = require("../models/User")

exports.getVerifiedUsers = async (req, res) => {
  try {
    const verifiedUsers = await User.find({ isVerified: true, role:{$ne:'admin'} }).select("-password -__v");
    console.log("Verified users being sent:", verifiedUsers); // Debugging line to check the fetched users
    res.json(verifiedUsers)
  } catch (error) {
    console.error("Error fetching verified users:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      department: user.department,
      yearOfStudy: user.yearOfStudy,
      role: user.role,
      preferences: user.preferences || { emailNotifications: true, smsAlerts: false, resultNotifications: true },
      hasVoted: user.hasVoted || false,
    })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}

exports.getVotingHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("votingHistory")
    res.json(user.votingHistory || [])
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}

exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences: req.body },
      { new: true }
    ).select("preferences")
    res.json(user.preferences)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { $set: req.body }, { new: true }).select("-password")
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}