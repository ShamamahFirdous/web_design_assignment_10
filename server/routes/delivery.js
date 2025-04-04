const router = require('express').Router();
const Order = require('../models/Order');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Only allow delivery agents
router.use(verifyToken, verifyRole('delivery'));

// GET /api/delivery/orders → Get orders assigned to this delivery agent
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({ deliveryAgent: req.user.userId });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/delivery/orders/:id → Update delivery status
router.put('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        deliveryAgent: req.user.userId
      },
      { status: req.body.status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to you' });
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
