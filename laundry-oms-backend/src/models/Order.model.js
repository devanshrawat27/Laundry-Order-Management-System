const mongoose = require('mongoose');
const { ORDER_STATUSES, VALID_GARMENT_TYPES } = require('../constants/garments');

const garmentItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: VALID_GARMENT_TYPES,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerItem: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    from: { type: String, enum: ORDER_STATUSES },
    to: { type: String, enum: ORDER_STATUSES },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: /^\d{10}$/,
    },
    garments: {
      type: [garmentItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one garment is required.',
      },
    },
    totalBill: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'RECEIVED',
    },
    estimatedDelivery: {
      type: Date,
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true, // auto createdAt + updatedAt
  }
);

// Index for common queries
orderSchema.index({ status: 1 });
orderSchema.index({ phoneNumber: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
