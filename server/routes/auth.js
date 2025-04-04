const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { JWT_SECRET, JWT_EXPIRES = '7d' } = process.env;
const allowedRoles = ['admin', 'seller', 'customer', 'deliveryAgent'];

/* -------- REGISTER -------- */
router.post('/register', async (req, res) => {
  try {
    let { fullName, email, password, role } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Normalize and validate
    email = email.toLowerCase().trim();
    fullName = fullName.trim();

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashedPassword, role });

    // Sign token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    return res.status(201).json({ token, role: user.role });
  } catch (err) {
    console.error('❌ Registration Error:', err);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

/* -------- LOGIN -------- */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    return res.json({ token, role: user.role });
  } catch (err) {
    console.error('❌ Login Error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
