const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const sellerRoutes = require('./routes/seller');
const paymentRoutes = require('./routes/payments');

const app = express();

// ✅ CORS should come BEFORE any route definitions
app.use(cors({
  origin: 'http://localhost:3000', // or "*" for all origins (not recommended in production)
  credentials: true
}));

// Stripe webhook (raw body must come before JSON parser)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Parse JSON for all other routes
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/payments', paymentRoutes);

// Static React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT || 5002, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5002}`)
    );
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
