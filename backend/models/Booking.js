const mongoose = require('mongoose');
const { BOOKING_STATUS, BOOKING_STATUS_ARRAY } = require('../config/constants');

const bookingSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booked-by user is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    purpose: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: BOOKING_STATUS_ARRAY,
        message: '{VALUE} is not a valid booking status',
      },
      default: BOOKING_STATUS.UPCOMING,
    },
    cancelReason: {
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
bookingSchema.index({ asset: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ bookedBy: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
