const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    itemCode: {
      type: String,
    },
    transactionType: {
      type: String,
      enum: ['Stock In', 'Stock Out', 'Issue', 'Return', 'Adjustment'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
      default: 'System',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      trim: true,
      default: 'General stock update',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
