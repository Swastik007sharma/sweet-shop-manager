const mongoose = require('mongoose');

const sweetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a sweet name'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Sweet', sweetSchema);
