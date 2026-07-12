const mongoose = require('mongoose');
const {
  ASSET_STATUS,
  ASSET_STATUS_ARRAY,
  ASSET_CONDITION,
  ASSET_CONDITION_ARRAY,
} = require('../config/constants');

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
      minlength: [2, 'Asset name must be at least 2 characters'],
      maxlength: [200, 'Asset name cannot exceed 200 characters'],
    },
    assetTag: {
      type: String,
      required: true,
      unique: true,
    },
    serialNumber: {
      type: String,
      trim: true,
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetCategory',
      required: [true, 'Asset category is required'],
    },
    acquisitionDate: {
      type: Date,
      default: null,
    },
    acquisitionCost: {
      type: Number,
      default: 0,
      min: [0, 'Acquisition cost cannot be negative'],
    },
    condition: {
      type: String,
      enum: {
        values: ASSET_CONDITION_ARRAY,
        message: '{VALUE} is not a valid condition',
      },
      default: ASSET_CONDITION.GOOD,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ASSET_STATUS_ARRAY,
        message: '{VALUE} is not a valid status',
      },
      default: ASSET_STATUS.AVAILABLE,
    },
    isBookable: {
      type: Boolean,
      default: false,
    },
    customFieldValues: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    photos: {
      type: [String],
      default: [],
    },
    documents: {
      type: [String],
      default: [],
    },
    currentHolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
assetSchema.index({ serialNumber: 1 }, { unique: true, sparse: true });
assetSchema.index({ status: 1 });
assetSchema.index({ category: 1 });
assetSchema.index({ department: 1 });
assetSchema.index({ isBookable: 1 });
assetSchema.index({ currentHolder: 1 });
assetSchema.index({ name: 'text', assetTag: 'text' });

module.exports = mongoose.model('Asset', assetSchema);
