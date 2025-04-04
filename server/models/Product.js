// server/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    price:       { type: Number, required: true },
    stock:       { type: Number, default: 0 },   // ← added
    category:    {
      type: String,
      enum: ['t-shirt','hoodies','sweatshirt','tank'], // must match your front‑end values
      default: 't-shirt'
    },
    imageUrl:    { type: String },
    description: { type: String },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status:   { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
