const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: [true, 'Item ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Item Name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    minStockLevel: {
      type: Number,
      required: [true, 'Minimum stock level is required'],
      min: [0, 'Minimum stock level cannot be negative'],
      default: 5,
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      trim: true,
      default: 'pcs',
    },
    unitCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    supplier: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: 'Central Store',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for dynamic stock status
inventoryItemSchema.virtual('stockStatus').get(function () {
  if (this.quantity <= 0) return 'Out of Stock';
  if (this.quantity <= this.minStockLevel) return 'Low Stock';
  return 'In Stock';
});

inventoryItemSchema.index({ name: 'text', itemId: 'text', category: 'text' });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
