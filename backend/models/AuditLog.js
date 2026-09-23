const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
      required: true,
      default: 'System User',
    },
    userRole: {
      type: String,
      required: true,
      default: 'admin',
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      enum: ['Asset', 'Inventory', 'Maintenance', 'IssueReturn', 'Auth', 'User', 'System'],
      required: true,
    },
    recordId: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
