const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Protect middleware - Verify JWT token
 * Attaches user to req.user if valid
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check if Authorization header exists and starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. If no token found, deny access
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user to request object (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    // 5. Proceed to next middleware/controller
    next();
  } catch (error) {
    // Token verification failed (invalid or expired)
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

module.exports = { protect };
