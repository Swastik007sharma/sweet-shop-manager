// server/src/controllers/authController.js

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = (req, res) => {
  // Logic moved from app.js
  res.status(201).json({ message: 'User registered successfully' });
};

module.exports = { register };