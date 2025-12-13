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

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a sweet name',
      });
    }

    if (price === undefined || price === null || price === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a price',
      });
    }

    // Validate price is a number and non-negative
    if (typeof price !== 'number' || isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative number',
      });
    }

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
