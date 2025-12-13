const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Protect middleware - Verify JWT token
 * Attaches user to req.user if valid
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check if Authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract token from "Bearer <token>"
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. If no token found, deny access immediately
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user to request object (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    // 5. Check if user still exists in database
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User no longer exists.',
      });
    }

    // 6. Proceed to next middleware/controller
    next();
  } catch (error) {
    // Handle specific JWT errors for better client feedback
    let message = 'Access denied. Invalid token.';

    if (error.name === 'TokenExpiredError') {
      message = 'Access denied. Token has expired.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Access denied. Token is malformed or invalid.';
    }

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

module.exports = { protect };
