const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const fs = require('fs');

// 🔧 Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/images';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// ✅ Protect all /api/seller routes
router.use(verifyToken, verifyRole('seller'));

// ✅ GET all products for the seller
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.userId });
    res.json({ products });
  } catch (err) {
    console.error('❌ GET products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.userId,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('❌ GET single product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ POST: Create a new product with image upload
router.post('/products', upload.single('image'), async (req, res) => {
  console.log('\n📦 Incoming product creation request');
  console.log('🔐 User:', req.user);
  console.log('📝 Body:', req.body);
  console.log('🖼️ File:', req.file);

  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized: Missing user info' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const { name, price, category, description } = req.body;

    if (!name || !price || !category || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newProduct = new Product({
      name,
      price: parseFloat(price),
      category,
      description,
      imageUrl: `/uploads/images/${req.file.filename}`,
      seller: req.user.userId,
    });

    const saved = await newProduct.save();
    console.log('✅ Product saved:', saved._id);
    res.status(201).json(saved);
  } catch (err) {
    console.error('🔥 Error in POST /products:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// ✅ PUT: Update a product (optional image upload)
router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const updateFields = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      category: req.body.category,
      description: req.body.description,
    };

    if (req.file) {
      updateFields.imageUrl = `/uploads/images/${req.file.filename}`;
    }

    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.userId },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    console.error('❌ PUT error:', err);
    res.status(400).json({ message: err.message });
  }
});

// ✅ DELETE a product
router.delete('/products/:id', async (req, res) => {
  try {
    const result = await Product.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.userId,
    });
    if (!result) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('❌ DELETE error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET seller dashboard stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.userId });
    const totalProducts = products.length;

    const totalOrders = 42; // placeholder
    const totalRevenue = 1234.56; // placeholder

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
    });
  } catch (err) {
    console.error('❌ Dashboard stats error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
