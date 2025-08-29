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
