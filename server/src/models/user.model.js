const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
});

// Pre-save hook to hash password automatically
userSchema.pre('save', async function () {
  // 1. Only hash if modified
  if (!this.isModified('password')) {
    return;
  }

  // 2. Generate Salt
  const salt = await bcrypt.genSalt(10);
  // 3. Hash Password
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to generate and return JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

module.exports = mongoose.model('User', userSchema);