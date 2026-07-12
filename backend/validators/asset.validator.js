const Joi = require('joi');
const {
  ASSET_CONDITION_ARRAY,
  ASSET_STATUS_ARRAY,
} = require('../config/constants');

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Invalid ID format');

const createAsset = Joi.object({
  name: Joi.string().trim().min(2).max(200).required().messages({
    'any.required': 'Asset name is required',
  }),
  category: objectId.required().messages({
    'any.required': 'Asset category is required',
  }),
  serialNumber: Joi.string().trim().allow(null, '').optional(),
  acquisitionDate: Joi.date().iso().allow(null).optional(),
  acquisitionCost: Joi.number().min(0).optional(),
  condition: Joi.string()
    .valid(...ASSET_CONDITION_ARRAY)
    .optional(),
  location: Joi.string().trim().allow('').optional(),
  department: objectId.allow(null).optional(),
  isBookable: Joi.boolean().optional(),
  customFieldValues: Joi.object().optional(),
  photos: Joi.array().items(Joi.string().trim()).optional(),
  documents: Joi.array().items(Joi.string().trim()).optional(),
});

const updateAsset = Joi.object({
  name: Joi.string().trim().min(2).max(200).optional(),
  category: objectId.optional(),
  serialNumber: Joi.string().trim().allow(null, '').optional(),
  acquisitionDate: Joi.date().iso().allow(null).optional(),
  acquisitionCost: Joi.number().min(0).optional(),
  condition: Joi.string()
    .valid(...ASSET_CONDITION_ARRAY)
    .optional(),
  location: Joi.string().trim().allow('').optional(),
  department: objectId.allow(null).optional(),
  isBookable: Joi.boolean().optional(),
  customFieldValues: Joi.object().optional(),
  photos: Joi.array().items(Joi.string().trim()).optional(),
  documents: Joi.array().items(Joi.string().trim()).optional(),
});

const updateAssetStatus = Joi.object({
  status: Joi.string()
    .valid(...ASSET_STATUS_ARRAY)
    .required()
    .messages({ 'any.required': 'Status is required' }),
  reason: Joi.string().trim().allow('').optional(),
});

module.exports = {
  createAsset,
  updateAsset,
  updateAssetStatus,
};
