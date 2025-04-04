const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "seller", "customer", "deliveryAgent"],
      default: "customer"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // ⏱️ auto-add createdAt & updatedAt
  }
);

module.exports = mongoose.model("User", userSchema);
