const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/booking.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const bookingValidator = require('../validators/booking.validator');

router.use(auth);

// GET /api/v1/bookings/calendar/:assetId — calendar view
router.get('/calendar/:assetId', bookingController.getCalendar);

// GET /api/v1/bookings — list all
router.get('/', bookingController.getAll);

// GET /api/v1/bookings/:id
router.get('/:id', bookingController.getById);

// POST /api/v1/bookings — any authenticated
router.post(
  '/',
  validate(bookingValidator.createBooking),
  bookingController.create
);

// PATCH /api/v1/bookings/:id/cancel
router.patch(
  '/:id/cancel',
  validate(bookingValidator.cancelBooking),
  bookingController.cancel
);

// PATCH /api/v1/bookings/:id/reschedule
router.patch(
  '/:id/reschedule',
  validate(bookingValidator.rescheduleBooking),
  bookingController.reschedule
);

module.exports = router;
