const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['low_stock', 'out_of_stock', 'overdue', 'maintenance', 'system', 'issue'],
      default: 'system',
    },
    referenceId: {
      type: String,
    },
    referenceModel: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    targetRoles: [
      {
        type: String,
        enum: ['admin', 'lab_staff', 'store_incharge'],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
