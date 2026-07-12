const mongoose = require('mongoose');
const { TRANSFER_STATUS, TRANSFER_STATUS_ARRAY } = require('../config/constants');

const transferRequestSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
    },
    currentHolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Current holder is required'],
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: TRANSFER_STATUS_ARRAY,
        message: '{VALUE} is not a valid transfer status',
      },
      default: TRANSFER_STATUS.REQUESTED,
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
transferRequestSchema.index({ asset: 1, status: 1 });
transferRequestSchema.index({ requestedBy: 1 });
transferRequestSchema.index({ currentHolder: 1 });

module.exports = mongoose.model('TransferRequest', transferRequestSchema);
