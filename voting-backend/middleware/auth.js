// backend/middleware/auth.js
// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');
//   if (!token) {
//     return res.status(401).json({ error: 'No token provided' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ error: 'Invalid token' });
//   }
// };


// middlewares/auth.js
// const jwt = require('jsonwebtoken');

// module.exports = (requiredRole = null) => (req, res, next) => {
//   try {
//     const header = req.headers.authorization || '';
//     const m = header.match(/^Bearer (.+)$/i);
//     if (!m) return res.status(401).json({ message: 'No token provided' });

//     const token = m[1];
//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = { id: payload.id, role: payload.role };

//     if (requiredRole && req.user.role !== requiredRole) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// };

// middleware/auth.js
const jwt = require('jsonwebtoken');
module.exports = (requiredRole = null) => (req, res, next) => {
  const header = req.headers.authorization || '';
  const m = header.match(/^Bearer (.+)$/i);
  if (!m) return res.status(401).json({ message: 'No token provided' });
  try {
    const payload = jwt.verify(m[1], process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    if (requiredRole && req.user.role !== requiredRole) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
