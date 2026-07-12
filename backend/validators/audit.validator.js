const Joi = require('joi');
const { AUDIT_SCOPE_TYPE_ARRAY, AUDIT_RESULT_ARRAY } = require('../config/constants');

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Invalid ID format');

const createAudit = Joi.object({
  name: Joi.string().trim().min(3).max(200).required().messages({
    'any.required': 'Audit cycle name is required',
  }),
  scope: Joi.object({
    type: Joi.string()
      .valid(...AUDIT_SCOPE_TYPE_ARRAY)
      .required()
      .messages({ 'any.required': 'Scope type is required' }),
    value: Joi.string().trim().required().messages({
      'any.required': 'Scope value is required',
    }),
  }).required(),
  startDate: Joi.date().iso().required().messages({
    'any.required': 'Start date is required',
  }),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
    'any.required': 'End date is required',
    'date.greater': 'End date must be after start date',
  }),
  auditors: Joi.array()
    .items(objectId)
    .min(1)
    .required()
    .messages({
      'any.required': 'At least one auditor is required',
      'array.min': 'At least one auditor is required',
    }),
});

const createAuditEntry = Joi.object({
  asset: objectId.required().messages({
    'any.required': 'Asset ID is required',
  }),
  result: Joi.string()
    .valid(...AUDIT_RESULT_ARRAY)
    .required()
    .messages({ 'any.required': 'Audit result is required' }),
  notes: Joi.string().trim().allow('').optional(),
});

module.exports = {
  createAudit,
  createAuditEntry,
};
