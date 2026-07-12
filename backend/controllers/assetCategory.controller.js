const asyncHandler = require('../middleware/asyncHandler');
const categoryService = require('../services/assetCategory.service');
const activityLogService = require('../services/activityLog.service');
const ApiResponse = require('../utils/ApiResponse');
const { ACTIONS } = require('../config/constants');

const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  await activityLogService.log({
    user: req.user._id,
    action: ACTIONS.CATEGORY_CREATED,
    entityType: 'AssetCategory',
    entityId: category._id,
    description: `Created asset category: ${category.name}`,
    ipAddress: req.ip,
  });

  res.status(201).json(new ApiResponse(201, 'Asset category created', { category }));
});

const getAll = asyncHandler(async (req, res) => {
  const { categories, pagination } = await categoryService.getCategories(req.query);
  res.status(200).json(new ApiResponse(200, 'Categories retrieved', { categories, pagination }));
});

const getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Category retrieved', { category }));
});

const update = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);

  await activityLogService.log({
    user: req.user._id,
    action: ACTIONS.CATEGORY_UPDATED,
    entityType: 'AssetCategory',
    entityId: category._id,
    description: `Updated asset category: ${category.name}`,
    ipAddress: req.ip,
  });

  res.status(200).json(new ApiResponse(200, 'Category updated', { category }));
});

module.exports = { create, getAll, getById, update };
