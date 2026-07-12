const TransferRequest = require('../models/TransferRequest');
const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/pagination');
const {
  TRANSFER_STATUS,
  ALLOCATION_STATUS,
  ASSET_STATUS,
  NOTIFICATION_TYPES,
  ACTIONS,
} = require('../config/constants');
const notificationService = require('./notification.service');
const activityLogService = require('./activityLog.service');

/**
 * Create a transfer request for an already-allocated asset.
 */
const createTransfer = async (data, requestedBy) => {
  const asset = await Asset.findById(data.asset);
  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  if (asset.status !== ASSET_STATUS.ALLOCATED) {
    throw new ApiError(400, 'Asset is not currently allocated. You can request a direct allocation instead.');
  }

  if (!asset.currentHolder) {
    throw new ApiError(400, 'Asset has no current holder.');
  }

  // Requester must not be the current holder
  if (asset.currentHolder.toString() === requestedBy.toString()) {
    throw new ApiError(400, 'You already hold this asset. No transfer needed.');
  }

  // Check for existing pending transfer
  const existing = await TransferRequest.findOne({
    asset: data.asset,
    requestedBy,
    status: TRANSFER_STATUS.REQUESTED,
  });
  if (existing) {
    throw new ApiError(409, 'You already have a pending transfer request for this asset.');
  }

  const transfer = await TransferRequest.create({
    asset: data.asset,
    requestedBy,
    currentHolder: asset.currentHolder,
    reason: data.reason || '',
  });

  // Activity log
  await activityLogService.log({
    user: requestedBy,
    action: ACTIONS.TRANSFER_REQUESTED,
    entityType: 'TransferRequest',
    entityId: transfer._id,
    description: `Transfer requested for asset ${asset.name} (${asset.assetTag})`,
  });

  return transfer;
};

/**
 * List transfer requests with filters.
 */
const getTransfers = async (query) => {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.asset) filter.asset = query.asset;
  if (query.requestedBy) filter.requestedBy = query.requestedBy;

  const totalDocs = await TransferRequest.countDocuments(filter);
  const { page, limit, skip, pagination } = buildPagination(query, totalDocs);

  const transfers = await TransferRequest.find(filter)
    .populate('asset', 'name assetTag status')
    .populate('requestedBy', 'name email')
    .populate('currentHolder', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { transfers, pagination };
};

/**
 * Get a single transfer by ID.
 */
const getTransferById = async (id) => {
  const transfer = await TransferRequest.findById(id)
    .populate('asset', 'name assetTag status')
    .populate('requestedBy', 'name email')
    .populate('currentHolder', 'name email')
    .populate('approvedBy', 'name email');

  if (!transfer) {
    throw new ApiError(404, 'Transfer request not found');
  }

  return transfer;
};

/**
 * Approve a transfer request.
 * Auto-completes: closes old allocation, creates new one, updates asset.
 */
const approveTransfer = async (transferId, approvedBy) => {
  const transfer = await TransferRequest.findById(transferId);
  if (!transfer) {
    throw new ApiError(404, 'Transfer request not found');
  }

  if (transfer.status !== TRANSFER_STATUS.REQUESTED) {
    throw new ApiError(400, `Transfer is '${transfer.status}', not Requested.`);
  }

  if (transfer.requestedBy.toString() === approvedBy.toString()) {
    throw new ApiError(400, 'You cannot approve your own transfer request.');
  }

  // Approve
  transfer.status = TRANSFER_STATUS.APPROVED;
  transfer.approvedBy = approvedBy;
  await transfer.save();

  // Auto-complete the transfer
  // 1. Close old allocation
  const oldAllocation = await Allocation.findOne({
    asset: transfer.asset,
    allocatedTo: transfer.currentHolder,
    status: ALLOCATION_STATUS.ACTIVE,
  });
  if (oldAllocation) {
    oldAllocation.status = ALLOCATION_STATUS.TRANSFERRED;
    oldAllocation.actualReturnDate = new Date();
    await oldAllocation.save();
  }

  // 2. Create new allocation
  const newAllocation = await Allocation.create({
    asset: transfer.asset,
    allocatedTo: transfer.requestedBy,
    allocatedBy: approvedBy,
    department: null,
    allocatedAt: new Date(),
  });

  // 3. Update asset holder
  const asset = await Asset.findById(transfer.asset);
  if (asset) {
    asset.currentHolder = transfer.requestedBy;
    await asset.save();
  }

  // 4. Mark transfer as completed
  transfer.status = TRANSFER_STATUS.COMPLETED;
  await transfer.save();

  // 5. Notifications
  const requester = await User.findById(transfer.requestedBy);
  const holder = await User.findById(transfer.currentHolder);

  await notificationService.createNotification({
    recipient: transfer.requestedBy,
    type: NOTIFICATION_TYPES.TRANSFER_APPROVED,
    title: 'Transfer Approved',
    message: `Your transfer request for ${asset ? asset.assetTag : 'asset'} has been approved.`,
    relatedEntity: { entityType: 'TransferRequest', entityId: transfer._id },
  });

  await notificationService.createNotification({
    recipient: transfer.currentHolder,
    type: NOTIFICATION_TYPES.TRANSFER_APPROVED,
    title: 'Asset Transferred',
    message: `Asset ${asset ? asset.assetTag : ''} has been transferred to ${requester ? requester.name : 'another user'}.`,
    relatedEntity: { entityType: 'TransferRequest', entityId: transfer._id },
  });

  // Activity log
  await activityLogService.log({
    user: approvedBy,
    action: ACTIONS.TRANSFER_COMPLETED,
    entityType: 'TransferRequest',
    entityId: transfer._id,
    description: `Transfer approved and completed for ${asset ? asset.assetTag : 'asset'}`,
  });

  return transfer;
};

/**
 * Reject a transfer request.
 */
const rejectTransfer = async (transferId, rejectionReason, rejectedBy) => {
  const transfer = await TransferRequest.findById(transferId);
  if (!transfer) {
    throw new ApiError(404, 'Transfer request not found');
  }

  if (transfer.status !== TRANSFER_STATUS.REQUESTED) {
    throw new ApiError(400, `Transfer is '${transfer.status}', not Requested.`);
  }

  transfer.status = TRANSFER_STATUS.REJECTED;
  transfer.approvedBy = rejectedBy;
  transfer.rejectionReason = rejectionReason;
  await transfer.save();

  // Notification
  const asset = await Asset.findById(transfer.asset);
  await notificationService.createNotification({
    recipient: transfer.requestedBy,
    type: NOTIFICATION_TYPES.TRANSFER_REJECTED,
    title: 'Transfer Rejected',
    message: `Your transfer request for ${asset ? asset.assetTag : 'asset'} has been rejected. Reason: ${rejectionReason}`,
    relatedEntity: { entityType: 'TransferRequest', entityId: transfer._id },
  });

  await activityLogService.log({
    user: rejectedBy,
    action: ACTIONS.TRANSFER_REJECTED,
    entityType: 'TransferRequest',
    entityId: transfer._id,
    description: `Transfer rejected for ${asset ? asset.assetTag : 'asset'}. Reason: ${rejectionReason}`,
  });

  return transfer;
};

module.exports = {
  createTransfer,
  getTransfers,
  getTransferById,
  approveTransfer,
  rejectTransfer,
};
