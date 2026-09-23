const mongoose = require('mongoose');

const issueReturnSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    assetId: {
      type: String,
      required: true,
    },
    assetName: {
      type: String,
      required: true,
    },
    issuedTo: {
      name: {
        type: String,
        required: [true, 'Issued-to name is required'],
        trim: true,
      },
      identifier: {
        type: String,
        required: [true, 'Roll No / Faculty ID is required'],
        trim: true,
      },
      department: {
        type: String,
        default: 'General',
        trim: true,
      },
      email: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expectedReturnDate: {
      type: Date,
      required: [true, 'Expected return date is required'],
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    issuedByName: {
      type: String,
      default: 'Staff',
    },
    returnDate: {
      type: Date,
    },
    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    returnedByName: {
      type: String,
    },
    conditionAfterReturn: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'],
    },
    status: {
      type: String,
      enum: ['Issued', 'Returned', 'Overdue'],
      default: 'Issued',
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method / middleware to check overdue status dynamically
issueReturnSchema.methods.isOverdue = function () {
  return this.status === 'Issued' && new Date() > this.expectedReturnDate;
};

module.exports = mongoose.model('IssueReturn', issueReturnSchema);
