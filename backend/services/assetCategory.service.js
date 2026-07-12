const AssetCategory = require('../models/AssetCategory');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/pagination');

/**
 * Create a new asset category.
 */
const createCategory = async (data) => {
  const category = await AssetCategory.create(data);
  return category;
};

/**
 * Get all categories with pagination and filtering.
 */
const getCategories = async (query) => {
  const filter = {};

  if (query.status) filter.status = query.status;

  const totalDocs = await AssetCategory.countDocuments(filter);
  const { page, limit, skip, pagination } = buildPagination(query, totalDocs);

  const categories = await AssetCategory.find(filter)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  return { categories, pagination };
};

/**
 * Get a single category by ID.
 */
const getCategoryById = async (id) => {
  const category = await AssetCategory.findById(id);
  if (!category) {
    throw new ApiError(404, 'Asset category not found');
  }
  return category;
};

/**
 * Update a category.
 */
const updateCategory = async (id, data) => {
  const category = await AssetCategory.findById(id);
  if (!category) {
    throw new ApiError(404, 'Asset category not found');
  }

  Object.assign(category, data);
  await category.save();

  return category;
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
};
