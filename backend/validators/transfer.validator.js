const Joi = require('joi');

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Invalid ID format');

const createTransfer = Joi.object({
  asset: objectId.required().messages({
    'any.required': 'Asset ID is required',
  }),
  reason: Joi.string().trim().allow('').optional(),
});

const rejectTransfer = Joi.object({
  rejectionReason: Joi.string().trim().required().messages({
    'any.required': 'Rejection reason is required',
  }),
});

module.exports = {
  createTransfer,
  rejectTransfer,
};
