const Booking = require('../models/Booking');
const Asset = require('../models/Asset');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/pagination');
const {
  BOOKING_STATUS,
  NOTIFICATION_TYPES,
  ACTIONS,
} = require('../config/constants');
const notificationService = require('./notification.service');
const activityLogService = require('./activityLog.service');

/**
 * Create a booking for a shared resource.
 * Enforces: asset must be bookable, no overlapping active bookings.
 */
const createBooking = async (data, bookedBy) => {
  const asset = await Asset.findById(data.asset);
  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  if (!asset.isBookable) {
    throw new ApiError(400, 'This asset is not bookable. Only shared resources can be booked.');
  }

  // Overlap validation
  const conflict = await Booking.findOne({
    asset: data.asset,
    status: { $nin: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED] },
    startTime: { $lt: new Date(data.endTime) },
    endTime: { $gt: new Date(data.startTime) },
  });

  if (conflict) {
    throw new ApiError(
      409,
      `Time slot overlaps with an existing booking (${conflict.startTime.toISOString()} – ${conflict.endTime.toISOString()}).`,
      [{ conflictingBooking: conflict }]
    );
  }

  const booking = await Booking.create({
    asset: data.asset,
    bookedBy,
    startTime: data.startTime,
    endTime: data.endTime,
    purpose: data.purpose || '',
  });

  // Notification
  await notificationService.createNotification({
    recipient: bookedBy,
    type: NOTIFICATION_TYPES.BOOKING_CONFIRMED,
    title: 'Booking Confirmed',
    message: `Your booking for ${asset.name} (${asset.assetTag}) has been confirmed.`,
    relatedEntity: { entityType: 'Booking', entityId: booking._id },
  });

  // Activity log
  await activityLogService.log({
    user: bookedBy,
    action: ACTIONS.BOOKING_CREATED,
    entityType: 'Booking',
    entityId: booking._id,
    description: `Booked ${asset.name} (${asset.assetTag}) from ${data.startTime} to ${data.endTime}`,
  });

  return booking;
};

/**
 * List bookings with filters.
 */
const getBookings = async (query) => {
  const filter = {};

  if (query.asset) filter.asset = query.asset;
  if (query.bookedBy) filter.bookedBy = query.bookedBy;
  if (query.status) filter.status = query.status;

  if (query.startDate || query.endDate) {
    filter.startTime = {};
    if (query.startDate) filter.startTime.$gte = new Date(query.startDate);
    if (query.endDate) filter.startTime.$lte = new Date(query.endDate);
  }

  const totalDocs = await Booking.countDocuments(filter);
  const { page, limit, skip, pagination } = buildPagination(query, totalDocs);

  const bookings = await Booking.find(filter)
    .populate('asset', 'name assetTag location')
    .populate('bookedBy', 'name email')
    .sort({ startTime: -1 })
    .skip(skip)
    .limit(limit);

  return { bookings, pagination };
};

/**
 * Get a single booking by ID.
 */
const getBookingById = async (id) => {
  const booking = await Booking.findById(id)
    .populate('asset', 'name assetTag location')
    .populate('bookedBy', 'name email');

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  return booking;
};

/**
 * Get calendar view for a specific asset.
 */
const getCalendar = async (assetId, startDate, endDate) => {
  const filter = {
    asset: assetId,
    status: { $ne: BOOKING_STATUS.CANCELLED },
  };

  if (startDate || endDate) {
    filter.startTime = {};
    if (startDate) filter.startTime.$gte = new Date(startDate);
    if (endDate) filter.endTime = { $lte: new Date(endDate) };
  }

  const bookings = await Booking.find(filter)
    .populate('bookedBy', 'name email')
    .sort({ startTime: 1 });

  return bookings;
};

/**
 * Cancel an upcoming booking.
 */
const cancelBooking = async (bookingId, data, userId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.status !== BOOKING_STATUS.UPCOMING) {
    throw new ApiError(400, `Cannot cancel a booking with status '${booking.status}'`);
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancelReason = data.cancelReason || '';
  await booking.save();

  // Notification
  await notificationService.createNotification({
    recipient: booking.bookedBy,
    type: NOTIFICATION_TYPES.BOOKING_CANCELLED,
    title: 'Booking Cancelled',
    message: `Your booking has been cancelled.`,
    relatedEntity: { entityType: 'Booking', entityId: booking._id },
  });

  await activityLogService.log({
    user: userId,
    action: ACTIONS.BOOKING_CANCELLED,
    entityType: 'Booking',
    entityId: booking._id,
    description: `Booking cancelled. Reason: ${data.cancelReason || 'N/A'}`,
  });

  return booking;
};

/**
 * Reschedule an upcoming booking.
 */
const rescheduleBooking = async (bookingId, data, userId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.status !== BOOKING_STATUS.UPCOMING) {
    throw new ApiError(400, `Cannot reschedule a booking with status '${booking.status}'`);
  }

  // Check overlap with new times (exclude current booking)
  const conflict = await Booking.findOne({
    _id: { $ne: bookingId },
    asset: booking.asset,
    status: { $nin: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED] },
    startTime: { $lt: new Date(data.endTime) },
    endTime: { $gt: new Date(data.startTime) },
  });

  if (conflict) {
    throw new ApiError(
      409,
      `New time slot overlaps with an existing booking.`,
      [{ conflictingBooking: conflict }]
    );
  }

  booking.startTime = data.startTime;
  booking.endTime = data.endTime;
  await booking.save();

  await activityLogService.log({
    user: userId,
    action: ACTIONS.BOOKING_RESCHEDULED,
    entityType: 'Booking',
    entityId: booking._id,
    description: `Booking rescheduled to ${data.startTime} – ${data.endTime}`,
  });

  return booking;
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  getCalendar,
  cancelBooking,
  rescheduleBooking,
};
