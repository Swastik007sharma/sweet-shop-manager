const express = require('express');
const { createSweet, getSweets, searchSweets, updateSweet, deleteSweet } = require('../controllers/sweet.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', protect, createSweet);
router.get('/search', protect, searchSweets);
router.get('/', protect, getSweets);
router.put('/:id', protect, updateSweet);

// Admin only route
router.delete('/:id', protect, authorize('admin'), deleteSweet);

module.exports = router;