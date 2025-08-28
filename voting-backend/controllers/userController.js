const User = require("../models/User");

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


