// const express = require("express");
// const router = express.Router();
// const auth = require("../middleware/auth");

// const {
//   getVerifiedUsers,
//   getProfile,
//   getVotingHistory,
//   updatePreferences,
//   updateProfile,
// } = require("../controllers/userController");

// router.get("/verified", auth, getVerifiedUsers);
// router.get("/profile", auth, getProfile);          // <-- This is what VotingPage calls
// router.get("/voting-history", auth, getVotingHistory);
// router.put("/preferences", auth, updatePreferences);
// router.put("/profile", auth, updateProfile);

// module.exports = router;

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  getVerifiedUsers,
  getProfile,
  getVotingHistory,
  updatePreferences,
  updateProfile,
} = require("../controllers/userController");

// ✅ call auth()
router.get("/verified", auth(), getVerifiedUsers);
router.get("/profile", auth(), getProfile);
router.get("/voting-history", auth(), getVotingHistory);
router.put("/preferences", auth(), updatePreferences);
router.put("/profile", auth(), updateProfile);

module.exports = router;
