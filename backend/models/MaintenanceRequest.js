const mongoose = require('mongoose');
const {
  MAINTENANCE_STATUS,
  MAINTENANCE_STATUS_ARRAY,
  MAINTENANCE_PRIORITY,
  MAINTENANCE_PRIORITY_ARRAY,
} = require('../config/constants');

const maintenanceRequestSchema = new mongoose.Schema(
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
    description: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    priority: {
      type: String,
      enum: {
        values: MAINTENANCE_PRIORITY_ARRAY,
        message: '{VALUE} is not a valid priority',
      },
      default: MAINTENANCE_PRIORITY.MEDIUM,
    },
    photos: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: MAINTENANCE_STATUS_ARRAY,
        message: '{VALUE} is not a valid maintenance status',
      },
      default: MAINTENANCE_STATUS.PENDING,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedTechnician: {
      type: String,
      trim: true,
      default: '',
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    resolutionNotes: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
maintenanceRequestSchema.index({ asset: 1 });
maintenanceRequestSchema.index({ status: 1 });
maintenanceRequestSchema.index({ requestedBy: 1 });
maintenanceRequestSchema.index({ priority: 1 });

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
