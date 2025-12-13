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

/**
 * Search sweets
 * @route GET api/sweets/search
 * @access Protected
 */
const searchSweets = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    // Build the query object
    let query = {};

    // 1. Search by Name (Partial match, case-insensitive)
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    // 2. Search by Category (Case-insensitive)
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // 3. Filter by Price Range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sweets = await Sweet.find(query);

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

/**
 * Update a sweet
 * @route PUT /api/sweets/:id
 * @access Protected
 */
const updateSweet = async (req, res, next) => {
  try {
    const { id } = req.params;

    // findByIdAndUpdate(id, data, options)
    // new: true -> returns the updated document instead of the old one
    // runValidators: true -> ensures updates follow the schema rules (e.g. min price)
    const sweet = await Sweet.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found',
      });
    }

    res.status(200).json({
      success: true,
      data: sweet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a sweet
 * @route DELETE /api/sweets/:id
 * @access Private (Admin only)
 */
const deleteSweet = async (req, res, next) => {
  try {
    const sweet = await Sweet.findByIdAndDelete(req.params.id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: 'Sweet deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Purchase a sweet
 * @route POST /api/sweets/:id/purchase
 * @access Protected
 */
const purchaseSweet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    // Default to purchasing 1 if quantity not provided
    const qtyToBuy = quantity || 1;

    const sweet = await Sweet.findById(id);

    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found',
      });
    }

    // Check availability
    if (sweet.stock < qtyToBuy) {
      return res.status(400).json({
        success: false,
        message: 'Out of stock or insufficient quantity',
      });
    }

    // Decrease stock and save
    sweet.stock -= qtyToBuy;
    await sweet.save();

    res.status(200).json({
      success: true,
      message: 'Purchase successful',
      data: sweet,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  createSweet, 
  getSweets, 
  searchSweets, 
  updateSweet, 
  deleteSweet,
  purchaseSweet
};
