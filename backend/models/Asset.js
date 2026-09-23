const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: [true, 'Asset ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Asset Name is required'],
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
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    laboratory: {
      type: String,
      required: [true, 'Laboratory is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location / Room is required'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    purchaseCost: {
      type: Number,
      default: 0,
    },
    supplier: {
      type: String,
      trim: true,
    },
    warrantyExpiry: {
      type: Date,
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'],
      default: 'Good',
    },
    status: {
      type: String,
      enum: ['Available', 'Issued', 'Under Maintenance', 'Damaged', 'Retired'],
      default: 'Available',
    },
    assignedTo: {
      type: String,
      default: '',
      trim: true,
    },
    qrCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexing
assetSchema.index({ name: 'text', assetId: 'text', serialNumber: 'text', brand: 'text', model: 'text' });

module.exports = mongoose.model('Asset', assetSchema);
