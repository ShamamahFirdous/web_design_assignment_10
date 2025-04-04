const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

/*************************************************
 * USERS (Admin only)
 *************************************************/
router.get('/users', verifyToken, verifyRole('admin'), async (_req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.post('/users', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const { fullName, email, password, role = 'customer' } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ message: 'Missing required fields' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hash, role });
    res.status(201).json(user.toObject({ versionKey: false, transform: (_, u) => { delete u.password; return u; } }));
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

router.delete('/users/:id', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted', deletedUser });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

router.patch('/users/:id/role', verifyToken, verifyRole('admin'), async (req, res) => {
  const { role } = req.body;
  const allowed = ['admin', 'customer', 'seller', 'deliveryAgent'];
  if (!allowed.includes(role)) return res.status(400).json({ message: 'Invalid role' });
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated', user });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({ message: 'Server error while updating role' });
  }
});

/*************************************************
 * PRODUCTS (Admin only)
 *************************************************/
// ✅ FIXED: Wrap in { products: [...] }
router.get('/products', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const products = await Product.find(filter);
    res.json({ products }); // ✅ FIXED!
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.put('/products/:id/approve', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product approved', product });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ message: 'Server error while approving product' });
  }
});

router.put('/products/:id/reject', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product rejected', product });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ message: 'Server error while rejecting product' });
  }
});

/*************************************************
 * ORDERS (Admin only)
 *************************************************/
router.get('/orders', verifyToken, verifyRole('admin'), async (_req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

router.get('/orders/:id', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

module.exports = router;
