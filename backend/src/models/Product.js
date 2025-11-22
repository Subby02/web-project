const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    saleStart: {
      type: Date,
    },
    saleEnd: {
      type: Date,
    },
    discountRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    categories: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    materials: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    salesVolume: {
      type: Number,
      default: 0,
      min: 0,
    },
    recommendationScore: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);

