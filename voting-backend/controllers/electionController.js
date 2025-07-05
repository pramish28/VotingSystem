// const Candidate = require("../models/Candidate")
// const Election = require("../models/Election")
// const Notification = require("../models/Notification")

// exports.getCandidates = async (req, res) => {
//   try {
//     const candidates = await Candidate.find().select("_id name department slogan platform position color")
//     res.json(candidates)
//   } catch (err) {
//     res.status(500).json({ message: "Server error" })
//   }
// }

// exports.getElectionNews = async (req, res) => {
//   try {
//     const news = await Notification.find().sort({ createdAt: -1 })
//     res.json(
//       news.map((item) => ({
//         type: item.type,
//         typeColor: item.typeColor || "text-blue-600 bg-blue-100",
//         date: item.createdAt.toISOString().split("T")[0],
//         title: item.title,
//         content: item.content,
//         featured: item.featured || false,
//       }))
//     )
//   } catch (err) {
//     res.status(500).json({ message: "Server error" })
//   }
// }

// exports.getMoreNews = async (req, res) => {
//   try {
//     const news = await Notification.find().sort({ createdAt: -1 }).skip(3).limit(5)
//     res.json(
//       news.map((item) => ({
//         type: item.type,
//         typeColor: item.typeColor || "text-blue-600 bg-blue-100",
//         date: item.createdAt.toISOString().split("T")[0],
//         title: item.title,
//         content: item.content,
//         featured: item.featured || false,
//       }))
//     )
//   } catch (err) {
//     res.status(500).json({ message: "Server error" })
//   }
// }

// exports.getElectionStats = async (req, res) => {
//   try {
//     const election = await Election.findOne({ status: "active" })
//     const totalVoters = await User.countDocuments({ isVerified: true,role:{$ne:'admin'} }) //exclude admin
//     const votesCast = await Vote.countDocuments({ electionId: election._id })
//     const candidateCount = await Candidate.countDocuments({ electionId: election._id })
//     const endDate = election.endDate.toISOString().split("T")[0]
//     const countdown = `${Math.ceil((election.endDate - new Date()) / (1000 * 60 * 60 * 24))} days remaining`

//     res.json({
//       electionId: election._id,
//       totalVoters,
//       votesCast,
//       turnout: ((votesCast / totalVoters) * 100).toFixed(1),
//       candidateCount,
//       positionCount: 4, // Assuming 4 positions: president, vp, secretary, treasurer
//       status: election.status,
//       endDate,
//       countdown,
//       timeRemainingPercent: ((election.endDate - new Date()) / (election.endDate - election.startDate)) * 100,
//       timeRemainingText: countdown,
//     })
//   } catch (err) {
//     res.status(500).json({ message: "Server error" })
//   }
// }

const Candidate = require("../models/Candidate");
     const Election = require("../models/Election");
     const Notification = require("../models/Notification");
     const User = require("../models/User");
     const Vote = require("../models/Vote");

     const getCandidates = async (req, res) => {
       try {
         const candidates = await Candidate.find().select("_id name department slogan platform position color");
         res.json(candidates);
       } catch (err) {
         console.error('Get candidates error:', err);
         res.status(500).json({ message: "Server error", error: err.message });
       }
     };

     const getElectionNews = async (req, res) => {
       try {
         const news = await Notification.find().sort({ createdAt: -1 });
         res.json(news.map(item => ({
           type: item.type,
           typeColor: item.typeColor || "text-blue-600 bg-blue-100",
           date: item.createdAt.toISOString().split("T")[0],
           title: item.title,
           content: item.content,
           featured: item.featured || false,
         })));
       } catch (err) {
         console.error('Get election news error:', err);
         res.status(500).json({ message: "Server error", error: err.message });
       }
     };

     const getMoreNews = async (req, res) => {
       try {
         const news = await Notification.find().sort({ createdAt: -1 }).skip(3).limit(5);
         res.json(news.map(item => ({
           type: item.type,
           typeColor: item.typeColor || "text-blue-600 bg-blue-100",
           date: item.createdAt.toISOString().split("T")[0],
           title: item.title,
           content: item.content,
           featured: item.featured || false,
         })));
       } catch (err) {
         console.error('Get more news error:', err);
         res.status(500).json({ message: "Server error", error: err.message });
       }
     };

     const getElectionStats = async (req, res) => {
       try {
         const election = await Election.findOne({ status: "active" });
         if (!election) {
           return res.status(404).json({ message: "No active election found" });
         }

         const totalVoters = await User.countDocuments({ isVerified: true, role: { $ne: 'admin' } });
         const votesCast = await Vote.countDocuments({ electionId: election._id });
         const candidateCount = await Candidate.countDocuments({ electionId: election._id });
         const endDate = election.endDate.toISOString().split("T")[0];
         const countdown = `${Math.ceil((election.endDate - new Date()) / (1000 * 60 * 60 * 24))} days remaining`;

         res.json({
           electionId: election._id,
           totalVoters,
           votesCast,
           turnout: ((votesCast / totalVoters) * 100).toFixed(1),
           candidateCount,
           positionCount: 4,
           status: election.status,
           endDate,
           countdown,
           timeRemainingPercent: ((election.endDate - new Date()) / (election.endDate - election.startDate)) * 100,
           timeRemainingText: countdown,
         });
       } catch (err) {
         console.error('Get election stats error:', err);
         res.status(500).json({ message: "Server error", error: err.message });
       }
     };

     const createElection = async (req, res) => {
       console.log('Request body:', req.body);
       console.log('Uploaded files:', req.files);
       try {
         const { electionTitle, startDate, endDate, partySections, independents, samanupatikParties } = req.body;
         const files = req.files || [];

         if (!electionTitle || !startDate || !endDate) {
           return res.status(400).json({ message: 'electionTitle, startDate, and endDate are required' });
         }

         let parsedPartySections = [];
         let parsedIndependents = [];
         let parsedSamanupatikParties = [];
         try {
           parsedPartySections = partySections ? JSON.parse(partySections) : [];
           parsedIndependents = independents ? JSON.parse(independents) : [];
           parsedSamanupatikParties = samanupatikParties ? JSON.parse(samanupatikParties) : [];
         } catch (err) {
           console.error('JSON parsing error:', err);
           return res.status(400).json({ message: 'Invalid JSON format in request body', error: err.message });
         }

         const updatedPartySections = parsedPartySections.map((section, index) => {
           const candidates = { ...section.candidates };
           Object.keys(candidates).forEach((key) => {
             if (key !== 'members') {
               const fileKey = `partySections[${index}][candidates][${key}][photo]`;
               const file = files.find(f => f.fieldname === fileKey);
               candidates[key] = {
                 name: candidates[key].name || "",
                 photo: file ? `/Uploads/${file.filename}` : "",
               };
             } else {
               candidates.members = candidates.members.map((member, memberIndex) => {
                 const memberFileKey = `partySections[${index}][candidates][members][${memberIndex}][photo]`;
                 const file = files.find(f => f.fieldname === memberFileKey);
                 return {
                   name: member.name || "",
                   photo: file ? `/Uploads/${file.filename}` : "",
                 };
               });
             }
           });
           return { ...section, candidates, partyName: section.partyName || "" };
         });

         const updatedIndependents = parsedIndependents.map((cand, index) => {
           const fileKey = `independents[${index}][photo]`;
           const file = files.find(f => f.fieldname === fileKey);
           return {
             post: cand.post || "",
             name: cand.name || "",
             photo: file ? `/Uploads/${file.filename}` : "",
           };
         });

         const election = new Election({
           electionTitle,
           startDate: new Date(startDate),
           endDate: new Date(endDate),
           partySections: updatedPartySections,
           independents: updatedIndependents,
           samanupatikParties: parsedSamanupatikParties,
         });

         console.log('Election to save:', election);
         await election.save();
         res.status(201).json({ message: 'Election created successfully', election });
       } catch (error) {
         console.error('Create election error:', error);
         res.status(500).json({ message: 'Error creating election', error: error.message });
       }
     };

     module.exports = {
       getCandidates,
       getElectionNews,
       getMoreNews,
       getElectionStats,
       createElection,
     };