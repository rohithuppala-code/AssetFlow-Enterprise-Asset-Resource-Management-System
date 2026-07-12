const asyncHandler = require('../middleware/asyncHandler');
const bookingService = require('../services/booking.service');
const ApiResponse = require('../utils/ApiResponse');

const create = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, 'Booking created successfully', { booking }));
});

const getAll = asyncHandler(async (req, res) => {
  const { bookings, pagination } = await bookingService.getBookings(req.query);
  res.status(200).json(new ApiResponse(200, 'Bookings retrieved', { bookings, pagination }));
});

const getById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Booking retrieved', { booking }));
});

const getCalendar = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getCalendar(req.params.assetId, req.query.startDate, req.query.endDate);
  res.status(200).json(new ApiResponse(200, 'Calendar retrieved', { bookings }));
});

const cancel = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.body, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Booking cancelled', { booking }));
});

const reschedule = asyncHandler(async (req, res) => {
  const booking = await bookingService.rescheduleBooking(req.params.id, req.body, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Booking rescheduled', { booking }));
});

module.exports = { create, getAll, getById, getCalendar, cancel, reschedule };
