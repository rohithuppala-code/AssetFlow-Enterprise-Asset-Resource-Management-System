const Joi = require('joi');
const { ROLES } = require('../config/constants');

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Invalid ID format');

// Admin can update user profile and assign roles
const updateUser = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  department: objectId.allow(null).optional(),
  status: Joi.string().valid('Active', 'Inactive').optional(),
  role: Joi.string()
    .valid(ROLES.EMPLOYEE, ROLES.ASSET_MANAGER)
    .optional()
    .messages({
      'any.only': 'Role must be Employee or AssetManager',
    }),
});

module.exports = {
  updateUser,
};
