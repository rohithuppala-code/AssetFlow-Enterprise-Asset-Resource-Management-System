const Joi = require('joi');
const { MAINTENANCE_PRIORITY_ARRAY } = require('../config/constants');

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Invalid ID format');

const createMaintenance = Joi.object({
  asset: objectId.required().messages({
    'any.required': 'Asset ID is required',
  }),
  description: Joi.string().trim().min(10).required().messages({
    'any.required': 'Description is required',
    'string.min': 'Description must be at least 10 characters',
  }),
  priority: Joi.string()
    .valid(...MAINTENANCE_PRIORITY_ARRAY)
    .optional(),
  photos: Joi.array().items(Joi.string().trim()).optional(),
});

const rejectMaintenance = Joi.object({
  rejectionReason: Joi.string().trim().required().messages({
    'any.required': 'Rejection reason is required',
  }),
});

const assignTechnician = Joi.object({
  assignedTechnician: Joi.string().trim().required().messages({
    'any.required': 'Technician name/ID is required',
  }),
});

const resolveMaintenance = Joi.object({
  resolutionNotes: Joi.string().trim().required().messages({
    'any.required': 'Resolution notes are required',
  }),
});

module.exports = {
  createMaintenance,
  rejectMaintenance,
  assignTechnician,
  resolveMaintenance,
};
