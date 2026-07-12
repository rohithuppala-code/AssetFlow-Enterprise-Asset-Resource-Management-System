const Joi = require('joi');
const { CUSTOM_FIELD_TYPES } = require('../config/constants');

const createCategory = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Category name is required',
  }),
  description: Joi.string().trim().allow('').optional(),
  customFields: Joi.array()
    .items(
      Joi.object({
        fieldName: Joi.string().trim().required(),
        fieldType: Joi.string()
          .valid(...CUSTOM_FIELD_TYPES)
          .required(),
      })
    )
    .optional(),
});

const updateCategory = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().allow('').optional(),
  customFields: Joi.array()
    .items(
      Joi.object({
        fieldName: Joi.string().trim().required(),
        fieldType: Joi.string()
          .valid(...CUSTOM_FIELD_TYPES)
          .required(),
      })
    )
    .optional(),
  status: Joi.string().valid('Active', 'Inactive').optional(),
});

module.exports = {
  createCategory,
  updateCategory,
};
