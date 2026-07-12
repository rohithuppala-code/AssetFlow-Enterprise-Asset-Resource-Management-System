const Asset = require('../models/Asset');
const AssetCategory = require('../models/AssetCategory');
const Allocation = require('../models/Allocation');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/pagination');
const { ASSET_STATUS } = require('../config/constants');
const generateAssetTag = require('../utils/generateAssetTag');

/**
 * Valid status transitions — enforced on all status changes.
 * Keys are current statuses, values are arrays of allowed next statuses.
 */
const VALID_TRANSITIONS = {
  [ASSET_STATUS.AVAILABLE]: [
    ASSET_STATUS.ALLOCATED,
    ASSET_STATUS.RESERVED,
    ASSET_STATUS.UNDER_MAINTENANCE,
    ASSET_STATUS.LOST,
    ASSET_STATUS.RETIRED,
    ASSET_STATUS.DISPOSED,
  ],
  [ASSET_STATUS.ALLOCATED]: [
    ASSET_STATUS.AVAILABLE,
    ASSET_STATUS.UNDER_MAINTENANCE,
    ASSET_STATUS.LOST,
    ASSET_STATUS.RETIRED,
    ASSET_STATUS.DISPOSED,
  ],
  [ASSET_STATUS.RESERVED]: [
    ASSET_STATUS.AVAILABLE,
    ASSET_STATUS.ALLOCATED,
    ASSET_STATUS.LOST,
    ASSET_STATUS.RETIRED,
    ASSET_STATUS.DISPOSED,
  ],
  [ASSET_STATUS.UNDER_MAINTENANCE]: [
    ASSET_STATUS.AVAILABLE,
    ASSET_STATUS.LOST,
    ASSET_STATUS.RETIRED,
    ASSET_STATUS.DISPOSED,
  ],
  [ASSET_STATUS.LOST]: [ASSET_STATUS.AVAILABLE, ASSET_STATUS.DISPOSED],
  [ASSET_STATUS.RETIRED]: [ASSET_STATUS.DISPOSED, ASSET_STATUS.AVAILABLE],
  [ASSET_STATUS.DISPOSED]: [],
};

/**
 * Register a new asset. Auto-generates the asset tag.
 */
const createAsset = async (data, userId) => {
  // Validate category exists
  const category = await AssetCategory.findById(data.category);
  if (!category) {
    throw new ApiError(404, 'Asset category not found');
  }

  // Check serial number uniqueness (if provided)
  if (data.serialNumber) {
    const existing = await Asset.findOne({ serialNumber: data.serialNumber });
    if (existing) {
      throw new ApiError(409, `Serial number '${data.serialNumber}' is already in use`);
    }
  }

  // Auto-generate asset tag
  const assetTag = await generateAssetTag();

  const asset = await Asset.create({
    ...data,
    assetTag,
    createdBy: userId,
  });

  return asset;
};

/**
 * Search and filter assets with pagination.
 */
const getAssets = async (query) => {
  const filter = {};

  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.department) filter.department = query.department;
  if (query.location) filter.location = { $regex: query.location, $options: 'i' };
  if (query.condition) filter.condition = query.condition;
  if (typeof query.isBookable !== 'undefined') {
    filter.isBookable = query.isBookable === 'true';
  }

  // Search by name, assetTag, or serialNumber
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { assetTag: { $regex: query.search, $options: 'i' } },
      { serialNumber: { $regex: query.search, $options: 'i' } },
    ];
  }

  const totalDocs = await Asset.countDocuments(filter);
  const { page, limit, skip, pagination } = buildPagination(query, totalDocs);

  // Sort handling
  const sortField = query.sortBy || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const assets = await Asset.find(filter)
    .populate('category', 'name')
    .populate('department', 'name')
    .populate('currentHolder', 'name email')
    .populate('createdBy', 'name')
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limit);

  return { assets, pagination };
};

/**
 * Get a single asset by ID with full population.
 */
const getAssetById = async (id) => {
  const asset = await Asset.findById(id)
    .populate('category', 'name customFields')
    .populate('department', 'name')
    .populate('currentHolder', 'name email department')
    .populate('createdBy', 'name email');

  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  return asset;
};

/**
 * Update an asset (not status — use updateAssetStatus for that).
 */
const updateAsset = async (id, data) => {
  const asset = await Asset.findById(id);
  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  // Check serial number uniqueness if being changed
  if (data.serialNumber && data.serialNumber !== asset.serialNumber) {
    const existing = await Asset.findOne({ serialNumber: data.serialNumber });
    if (existing) {
      throw new ApiError(409, `Serial number '${data.serialNumber}' is already in use`);
    }
  }

  // Validate category if being changed
  if (data.category) {
    const category = await AssetCategory.findById(data.category);
    if (!category) {
      throw new ApiError(404, 'Asset category not found');
    }
  }

  // Don't allow status changes through regular update
  delete data.status;
  delete data.assetTag;
  delete data.currentHolder;
  delete data.createdBy;

  Object.assign(asset, data);
  await asset.save();

  return asset;
};

/**
 * Change asset status with transition validation.
 */
const updateAssetStatus = async (id, newStatus) => {
  const asset = await Asset.findById(id);
  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  const currentStatus = asset.status;
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    throw new ApiError(
      400,
      `Cannot transition from '${currentStatus}' to '${newStatus}'. Allowed: ${allowedTransitions.join(', ') || 'none'}`
    );
  }

  asset.status = newStatus;

  // If moving away from Allocated, clear the current holder
  if (currentStatus === ASSET_STATUS.ALLOCATED && newStatus !== ASSET_STATUS.ALLOCATED) {
    asset.currentHolder = null;
  }

  await asset.save();
  return asset;
};

/**
 * Get allocation + maintenance history for an asset.
 */
const getAssetHistory = async (id) => {
  const asset = await Asset.findById(id);
  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  const [allocations, maintenanceRequests] = await Promise.all([
    Allocation.find({ asset: id })
      .populate('allocatedTo', 'name email')
      .populate('allocatedBy', 'name email')
      .sort({ createdAt: -1 }),
    MaintenanceRequest.find({ asset: id })
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 }),
  ]);

  return { allocations, maintenanceRequests };
};

module.exports = {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  updateAssetStatus,
  getAssetHistory,
  VALID_TRANSITIONS,
};
