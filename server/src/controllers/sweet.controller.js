const Sweet = require('../models/sweet.model');

/**
 * Create a new sweet
 * @route POST /api/sweets
 * @access Protected
 */
const createSweet = async (req, res) => {
  try {
    const { name, price, description, imageUrl, stock } = req.body;

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

    if (typeof price !== 'number' || isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative number',
      });
    }

    const sweet = await Sweet.create({
      name,
      price,
      description,
      imageUrl,
      stock,
    });

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

/**
 * Get all sweets
 * @route GET /api/sweets
 * @access Protected
 */
const getSweets = async (req, res) => {
  try {
    // Fetch all sweets from the database
    const sweets = await Sweet.find();

    res.status(200).json({
      success: true,
      count: sweets.length,
      data: sweets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = { createSweet, getSweets };