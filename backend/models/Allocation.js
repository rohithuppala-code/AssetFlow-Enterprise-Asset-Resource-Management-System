const mongoose = require('mongoose');
const { ALLOCATION_STATUS, ALLOCATION_STATUS_ARRAY } = require('../config/constants');

const allocationSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    allocatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Allocated-to user is required'],
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Allocated-by user is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    allocatedAt: {
      type: Date,
      default: Date.now,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
    actualReturnDate: {
      type: Date,
      default: null,
    },
    returnCondition: {
      type: String,
      trim: true,
      default: null,
    },
    returnNotes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ALLOCATION_STATUS_ARRAY,
        message: '{VALUE} is not a valid allocation status',
      },
      default: ALLOCATION_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
allocationSchema.index({ asset: 1, status: 1 });
allocationSchema.index({ allocatedTo: 1, status: 1 });
allocationSchema.index({ expectedReturnDate: 1, status: 1 });
allocationSchema.index({ department: 1 });

module.exports = mongoose.model('Allocation', allocationSchema);
