require('dotenv').config();
const express = require('express');
const http = require('http');                 // 👈 for socket.io
const { Server } = require('socket.io');      // 👈 for socket.io
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const authRoutes = require('./routes/auth');
const voteRoutes = require('./routes/vote');
const postRoutes = require('./routes/post');
const electionRoutes = require('./routes/election');
const dashboardRoutes = require('./routes/dashboardRoutes');

// 👇 BOTH routers exist in your codebase
const userRoutesPlural = require('./routes/userRoutes'); // mounts at /api/users (approve/reject etc.)
const userRoutesSingular = require('./routes/User');     // mounts at /api/user  (profile etc.)

const app = express();

// Debug env
console.log('Environment Variables:', {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set',
  FRONTEND_URL: process.env.FRONTEND_URL,
});

// Ensure disk folder (capital U) exists
const uploadDir = path.join(__dirname, 'Uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploads for BOTH casings so images never 404 on Linux
app.use('/uploads', express.static(uploadDir));
app.use('/Uploads', express.static(uploadDir));

// Routes
app.use('/api/users', userRoutesPlural);
app.use('/api/user', userRoutesSingular);
app.use('/api/auth', authRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/post', postRoutes);
app.use('/api/election', electionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ---- Socket.IO setup ----
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join-election', (electionId) => {
    if (electionId) socket.join(`election:${electionId}`);
  });
  socket.on('leave-election', (electionId) => {
    if (electionId) socket.leave(`election:${electionId}`);
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'File upload error', details: err.message });
  }
  res.status(500).json({ error: 'Server error', details: err.message });
});

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');
// const multer = require('multer');

// // Routes
// const authRoutes = require('./routes/auth');
// const voteRoutes = require('./routes/vote');
// const postRoutes = require('./routes/post');
// const electionRoutes = require('./routes/election');
// const dashboardRoutes = require('./routes/dashboardRoutes'); // keep mounted; inline endpoints below guarantee the two URLs

// const userRoutesPlural = require('./routes/userRoutes');
// const userRoutesSingular = require('./routes/User');

// // Auth + Models (for inline dashboard endpoints)
// const auth = require('./middleware/auth');
// const User = require('./models/User');
// const Post = require('./models/Post');
// const Election = require('./models/Election');
// const Vote = require('./models/Vote');
// const Notification = require('./models/Notification');

// const app = express();

// // Ensure Uploads folder
// const uploadDir = path.join(__dirname, 'Uploads');
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// // CORS
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   })
// );

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));

// // Serve uploads for both casings
// app.use('/uploads', express.static(uploadDir));
// app.use('/Uploads', express.static(uploadDir));

// // Mount routers
// app.use('/api/users', userRoutesPlural);
// app.use('/api/user', userRoutesSingular);
// app.use('/api/auth', authRoutes);
// app.use('/api/vote', voteRoutes);
// app.use('/api/post', postRoutes);
// app.use('/api/election', electionRoutes);
// app.use('/api/dashboard', dashboardRoutes); // other routes (if any) still work

// // ---- Inline dashboard endpoints to guarantee these URLs exist ----
// const requireAdmin = (req, res, next) => {
//   if (!req.user || req.user.role !== 'admin') {
//     return res.status(403).json({ error: 'Forbidden: admin only' });
//   }
//   next();
// };

// async function getActiveElectionCount() {
//   const now = new Date();
//   const [byStatus, byEndDate] = await Promise.all([
//     Election.countDocuments({ status: 'active' }).catch(() => 0),
//     Election.countDocuments({ endDate: { $gte: now } }).catch(() => 0),
//   ]);
//   return byStatus || byEndDate || 0;
// }

// async function getActivePostCount() {
//   const [approved, isActive, any] = await Promise.all([
//     Post.countDocuments({ status: 'approved' }).catch(() => 0),
//     Post.countDocuments({ isActive: true }).catch(() => 0),
//     Post.countDocuments({}).catch(() => 0),
//   ]);
//   return approved || isActive || any || 0;
// }

// /** Admin: GET /api/dashboard/stats */
// app.get('/api/dashboard/stats', auth, requireAdmin, async (req, res) => {
//   try {
//     const [verifiedUsers, pendingStudents, activePosts, activeElections, totalVotes] =
//       await Promise.all([
//         User.countDocuments({ isVerified: true, role: { $ne: 'admin' } }).catch(() => 0),
//         User.countDocuments({ isVerified: false, role: { $ne: 'admin' } }).catch(() => 0),
//         getActivePostCount(),
//         getActiveElectionCount(),
//         Vote.countDocuments({}).catch(() => 0),
//       ]);

//     res.json({ verifiedUsers, pendingStudents, activePosts, activeElections, totalVotes });
//   } catch (err) {
//     console.error('Admin /api/dashboard/stats error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// /** Student: GET /api/dashboard/student-stats */
// app.get('/api/dashboard/student-stats', auth, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [totalPosts, activeElections, totalVotesByUser, unreadNews] = await Promise.all([
//       getActivePostCount(),
//       getActiveElectionCount(),
//       // adjust field if your Vote model uses a different key (e.g., voter / userId)
//       Vote.countDocuments({ user: userId }).catch(() => 0),
//       // adjust fields if your Notification model differs
//       Notification.countDocuments({
//         $or: [{ user: userId }, { recipient: userId }],
//         read: false,
//       }).catch(() => 0),
//     ]);

//     res.json({
//       totalPosts,
//       activeElections,
//       totalVotes: totalVotesByUser,
//       unreadNews,
//     });
//   } catch (err) {
//     console.error('Student /api/dashboard/student-stats error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
// // ---- End inline dashboard endpoints ----

// // Socket.IO
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
// });
// app.set('io', io);
// io.on('connection', (socket) => {
//   socket.on('join-election', (electionId) => {
//     if (electionId) socket.join(`election:${electionId}`);
//   });
//   socket.on('leave-election', (electionId) => {
//     if (electionId) socket.leave(`election:${electionId}`);
//   });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error('Server error:', err);
//   if (err instanceof multer.MulterError) {
//     return res.status(400).json({ error: 'File upload error', details: err.message });
//   }
//   res.status(500).json({ error: 'Server error', details: err.message });
// });

// // DB + server
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
