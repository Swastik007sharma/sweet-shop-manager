const mongoose = require('mongoose');

const sweetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
  },
  stock: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Sweet', sweetSchema);