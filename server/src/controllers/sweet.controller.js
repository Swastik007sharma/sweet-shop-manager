const Sweet = require('../models/sweet.model');

/**
 * Create a new sweet
 * @route POST /api/sweets
 * @access Protected
 */
const createSweet = async (req, res) => {
  try {
    // Extract sweet data from request body
    const { name, price, description, imageUrl, stock } = req.body;

    // Create and save the sweet to MongoDB
    const sweet = await Sweet.create({
      name,
      price,
      description,
      imageUrl,
      stock,
    });

    // Return the saved sweet object
    res.status(201).json({
      success: true,
      message: 'Sweet created successfully',
      data: sweet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = { createSweet };
