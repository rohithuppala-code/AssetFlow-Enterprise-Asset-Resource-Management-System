const Joi = require('joi');

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Invalid ID format');

const createAllocation = Joi.object({
  asset: objectId.required().messages({
    'any.required': 'Asset ID is required',
  }),
  allocatedTo: objectId.required().messages({
    'any.required': 'Allocated-to user ID is required',
  }),
  department: objectId.allow(null).optional(),
  expectedReturnDate: Joi.date().iso().allow(null, '').empty('').optional(),
});

const returnAllocation = Joi.object({
  returnCondition: Joi.string().trim().required().messages({
    'any.required': 'Return condition is required',
  }),
  returnNotes: Joi.string().trim().allow('').optional(),
});

module.exports = {
  createAllocation,
  returnAllocation,
};
