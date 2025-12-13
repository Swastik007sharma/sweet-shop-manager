const express = require('express');
const { createSweet, getSweets, searchSweets, updateSweet } = require('../controllers/sweet.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', protect, createSweet);
router.get('/search', protect, searchSweets);
router.get('/', protect, getSweets);
router.put('/:id', protect, updateSweet);

module.exports = router;