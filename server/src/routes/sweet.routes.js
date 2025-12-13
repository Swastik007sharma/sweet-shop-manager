const express = require('express');
const { createSweet, getSweets, searchSweets, updateSweet, deleteSweet, purchaseSweet, restockSweet } = require('../controllers/sweet.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', protect, createSweet);
router.get('/search', protect, searchSweets);
router.get('/', protect, getSweets);
router.put('/:id', protect, updateSweet);

// Admin only routes
router.delete('/:id', protect, authorize('admin'), deleteSweet);
router.post('/:id/restock', protect, authorize('admin'), restockSweet);

// Inventory routes
router.post('/:id/purchase', protect, purchaseSweet);

module.exports = router;