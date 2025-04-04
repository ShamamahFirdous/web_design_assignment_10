// server/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  size: String,
  color: String,
  imageUrl: String
});

const orderSchema = new mongoose.Schema(
  {
    // Stripe payment fields
    paymentIntentId: {
      type: String,
      unique: true,
      sparse: true // Allows the field to be null for non-Stripe orders
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Cash on Delivery', 'PayPal'],
      default: 'Credit Card'
    },
    
    // Your existing fields
    customer: { 
      type: String, 
      required: true 
    }, // Could be ObjectId ref
    
    items: [orderItemSchema], // Enhanced with more details
    
    total: { 
      type: Number, 
      required: true 
    },
    
    // Shipping and address information
    shipping: {
      type: Number,
      default: 5.99
    },
    
    address: {
      fullName: String,
      street: String,
      city: String,
      state: String,
      zip: String,
      country: {
        type: String,
        default: 'United States'
      }
    },
    
    // Delivery workflow status options preserved from your schema
    status: {
      type: String,
      enum: ['Pending Pickup', 'Out for Delivery', 'Delivered'],
      default: 'Pending Pickup'
    },
    
    // Delivery agent assignment preserved from your schema
    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Order date preserved from your schema
    date: { 
      type: Date, 
      default: Date.now 
    },
    
    // Tracking information
    trackingNumber: String,
    
    // Additional metadata
    notes: String
  },
  { 
    timestamps: true 
  }
);

// Add a virtual property for calculating the final total with shipping
orderSchema.virtual('finalTotal').get(function() {
  return this.total + this.shipping;
});

module.exports = mongoose.model('Order', orderSchema);