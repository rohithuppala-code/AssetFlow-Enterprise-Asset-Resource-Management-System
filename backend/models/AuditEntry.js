const mongoose = require('mongoose');
const { AUDIT_RESULT, AUDIT_RESULT_ARRAY } = require('../config/constants');

const auditEntrySchema = new mongoose.Schema(
  {
    auditCycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuditCycle',
      required: [true, 'Audit cycle is required'],
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    auditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Auditor is required'],
    },
    result: {
      type: String,
      enum: {
        values: AUDIT_RESULT_ARRAY,
        message: '{VALUE} is not a valid audit result',
      },
      required: [true, 'Audit result is required'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ── Unique compound index: one entry per asset per cycle ──
auditEntrySchema.index({ auditCycle: 1, asset: 1 }, { unique: true });
auditEntrySchema.index({ result: 1 });

module.exports = mongoose.model('AuditEntry', auditEntrySchema);
