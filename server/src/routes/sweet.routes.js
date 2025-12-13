const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { createSweet, getSweets } = require('../controllers/sweet.controller');

const router = express.Router();

// POST /api/sweets - Create a new sweet (Protected route)
router.post('/', protect, createSweet);
router.get('/', protect, getSweets)

module.exports = router;
