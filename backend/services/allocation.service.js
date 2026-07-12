const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/pagination');
const {
  ALLOCATION_STATUS,
  ASSET_STATUS,
  NOTIFICATION_TYPES,
  ACTIONS,
} = require('../config/constants');
const notificationService = require('./notification.service');
const activityLogService = require('./activityLog.service');

/**
 * Create a new allocation — assign an asset to a user.
 * Enforces: asset must be Available, not bookable, no double-allocation.
 */
const createAllocation = async (data, allocatedBy) => {
  const asset = await Asset.findById(data.asset);
  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  if (asset.isBookable) {
    throw new ApiError(400, 'Bookable assets cannot be allocated to individuals. Use Resource Booking instead.');
  }

  // Double-allocation prevention
  if (asset.status === ASSET_STATUS.ALLOCATED) {
    const currentHolder = await User.findById(asset.currentHolder).select('name email');
    throw new ApiError(409, `Asset is currently allocated to ${currentHolder ? currentHolder.name : 'another user'}. Use a Transfer Request instead.`, [
      { currentHolder },
    ]);
  }

  if (asset.status !== ASSET_STATUS.AVAILABLE) {
    throw new ApiError(400, `Asset status is '${asset.status}'. Only Available assets can be allocated.`);
  }

  // Validate allocatedTo user exists and is active
  const targetUser = await User.findById(data.allocatedTo);
  if (!targetUser) {
    throw new ApiError(404, 'Target user not found');
  }
  if (targetUser.status !== 'Active') {
    throw new ApiError(400, 'Cannot allocate to an inactive user');
  }

  // Create allocation record
  const allocation = await Allocation.create({
    asset: data.asset,
    allocatedTo: data.allocatedTo,
    allocatedBy,
    department: data.department || targetUser.department || null,
    expectedReturnDate: data.expectedReturnDate || null,
  });

  // Update asset status and holder
  asset.status = ASSET_STATUS.ALLOCATED;
  asset.currentHolder = data.allocatedTo;
  await asset.save();

  // Send notification to the user receiving the asset
  await notificationService.createNotification({
    recipient: data.allocatedTo,
    type: NOTIFICATION_TYPES.ASSET_ASSIGNED,
    title: 'Asset Assigned',
    message: `Asset ${asset.name} (${asset.assetTag}) has been allocated to you.`,
    relatedEntity: { entityType: 'Allocation', entityId: allocation._id },
  });

  // Activity log
  await activityLogService.log({
    user: allocatedBy,
    action: ACTIONS.ALLOCATION_MADE,
    entityType: 'Allocation',
    entityId: allocation._id,
    description: `Allocated ${asset.name} (${asset.assetTag}) to ${targetUser.name}`,
  });

  return allocation;
};

/**
 * Get allocations with pagination and filtering.
 */
const getAllocations = async (query) => {
  const filter = {};

  if (query.asset) filter.asset = query.asset;
  if (query.allocatedTo) filter.allocatedTo = query.allocatedTo;
  if (query.department) filter.department = query.department;
  if (query.status) filter.status = query.status;

  // Overdue filter
  if (query.overdue === 'true') {
    filter.expectedReturnDate = { $lt: new Date() };
    filter.status = ALLOCATION_STATUS.ACTIVE;
  }

  const totalDocs = await Allocation.countDocuments(filter);
  const { page, limit, skip, pagination } = buildPagination(query, totalDocs);

  const allocations = await Allocation.find(filter)
    .populate('asset', 'name assetTag status')
    .populate('allocatedTo', 'name email')
    .populate('allocatedBy', 'name email')
    .populate('department', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { allocations, pagination };
};

/**
 * Get a single allocation by ID.
 */
const getAllocationById = async (id) => {
  const allocation = await Allocation.findById(id)
    .populate('asset', 'name assetTag status category')
    .populate('allocatedTo', 'name email department')
    .populate('allocatedBy', 'name email')
    .populate('department', 'name');

  if (!allocation) {
    throw new ApiError(404, 'Allocation not found');
  }

  return allocation;
};

/**
 * Process an asset return.
 */
const returnAsset = async (allocationId, data, userId) => {
  const allocation = await Allocation.findById(allocationId);
  if (!allocation) {
    throw new ApiError(404, 'Allocation not found');
  }

  if (![ALLOCATION_STATUS.ACTIVE, ALLOCATION_STATUS.OVERDUE].includes(allocation.status)) {
    throw new ApiError(400, `Cannot return an allocation with status '${allocation.status}'`);
  }

  // Update allocation
  allocation.status = ALLOCATION_STATUS.RETURNED;
  allocation.actualReturnDate = new Date();
  allocation.returnCondition = data.returnCondition;
  allocation.returnNotes = data.returnNotes || '';
  await allocation.save();

  // Update asset
  const asset = await Asset.findById(allocation.asset);
  if (asset) {
    asset.status = ASSET_STATUS.AVAILABLE;
    asset.currentHolder = null;
    asset.condition = data.returnCondition;
    await asset.save();
  }

  // Activity log
  await activityLogService.log({
    user: userId,
    action: ACTIONS.ASSET_RETURNED,
    entityType: 'Allocation',
    entityId: allocation._id,
    description: `Asset returned. Condition: ${data.returnCondition}`,
  });

  return allocation;
};

/**
 * Get all overdue allocations.
 */
const getOverdueAllocations = async () => {
  const allocations = await Allocation.find({
    expectedReturnDate: { $lt: new Date() },
    status: ALLOCATION_STATUS.ACTIVE,
  })
    .populate('asset', 'name assetTag')
    .populate('allocatedTo', 'name email')
    .populate('allocatedBy', 'name email')
    .sort({ expectedReturnDate: 1 });

  return allocations;
};

module.exports = {
  createAllocation,
  getAllocations,
  getAllocationById,
  returnAsset,
  getOverdueAllocations,
};
