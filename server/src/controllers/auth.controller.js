const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if user exists
    if(await User.findOne({email})){
      return res.status(400).json({ message: 'User already exists'})
    }
    // Create and save the user to MongoDB
    const user = await User.create({ email, password, role });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Login a user
 * @route POST /api/auth/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Compare provided password with stored hash
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT token using model method
    const token = user.getSignedJwtToken();

    // 4. Return 200 with token
    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, loginUser };
