const mongoose = require('mongoose');
const { AUDIT_STATUS, AUDIT_STATUS_ARRAY, AUDIT_SCOPE_TYPE_ARRAY } = require('../config/constants');

const auditCycleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Audit cycle name is required'],
      trim: true,
    },
    scope: {
      type: {
        type: String,
        enum: {
          values: AUDIT_SCOPE_TYPE_ARRAY,
          message: '{VALUE} is not a valid scope type',
        },
        required: true,
      },
      value: {
        type: String,
        required: true,
        trim: true,
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    auditors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: {
        values: AUDIT_STATUS_ARRAY,
        message: '{VALUE} is not a valid audit status',
      },
      default: AUDIT_STATUS.OPEN,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
auditCycleSchema.index({ status: 1 });
auditCycleSchema.index({ 'scope.type': 1, 'scope.value': 1 });
auditCycleSchema.index({ auditors: 1 });

module.exports = mongoose.model('AuditCycle', auditCycleSchema);
