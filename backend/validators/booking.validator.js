const Joi = require('joi');

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Invalid ID format');

const createBooking = Joi.object({
  asset: objectId.required().messages({
    'any.required': 'Asset ID is required',
  }),
  startTime: Joi.date().iso().required().messages({
    'any.required': 'Start time is required',
  }),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required().messages({
    'any.required': 'End time is required',
    'date.greater': 'End time must be after start time',
  }),
  purpose: Joi.string().trim().allow('').optional(),
});

const cancelBooking = Joi.object({
  cancelReason: Joi.string().trim().allow('').optional(),
});

const rescheduleBooking = Joi.object({
  startTime: Joi.date().iso().required().messages({
    'any.required': 'Start time is required',
  }),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required().messages({
    'any.required': 'End time is required',
    'date.greater': 'End time must be after start time',
  }),
});

module.exports = {
  createBooking,
  cancelBooking,
  rescheduleBooking,
};
