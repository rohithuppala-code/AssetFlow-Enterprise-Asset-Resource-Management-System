const mongoose = require('mongoose');
const { DEPARTMENT_STATUS, DEPARTMENT_STATUS_ARRAY } = require('../config/constants');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Department name must be at least 2 characters'],
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    parentDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: DEPARTMENT_STATUS_ARRAY,
        message: '{VALUE} is not a valid status',
      },
      default: DEPARTMENT_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
departmentSchema.index({ head: 1 });
departmentSchema.index({ status: 1 });

module.exports = mongoose.model('Department', departmentSchema);
