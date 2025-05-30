require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const authRoutes = require('./routes/auth');
const voteRoutes = require('./routes/vote');
const postRoutes = require('./routes/post');
const electionRoutes = require('./routes/election');

const app = express();

// Debug environment variables
console.log('Environment Variables:', {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set',
  FRONTEND_URL: process.env.FRONTEND_URL,
});

// Ensure uploads directory exists
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
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/post', postRoutes);
app.use('/api/election', electionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'File upload error', details: err.message });
  }
  res.status(500).json({ error: 'Server error', details: err.message });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));