// // routes/admin.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Adjust path as needed

// GET all products for admin
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
