const Joi = require('joi');

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Invalid ID format');

const createDepartment = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Department name is required',
  }),
  description: Joi.string().trim().allow('').optional(),
  parentDepartment: objectId.allow(null).optional(),
});

const updateDepartment = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().allow('').optional(),
  parentDepartment: objectId.allow(null).optional(),
  status: Joi.string().valid('Active', 'Inactive').optional(),
});

module.exports = {
  createDepartment,
  updateDepartment,
};
