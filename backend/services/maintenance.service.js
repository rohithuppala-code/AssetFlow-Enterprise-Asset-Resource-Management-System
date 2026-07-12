const MaintenanceRequest = require('../models/MaintenanceRequest');
const Asset = require('../models/Asset');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/pagination');
const {
  MAINTENANCE_STATUS,
  ASSET_STATUS,
  NOTIFICATION_TYPES,
  ACTIONS,
} = require('../config/constants');
const notificationService = require('./notification.service');
const activityLogService = require('./activityLog.service');

/**
 * Raise a maintenance request.
 */
const createMaintenance = async (data, requestedBy) => {
  const asset = await Asset.findById(data.asset);
  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  if ([ASSET_STATUS.DISPOSED, ASSET_STATUS.RETIRED].includes(asset.status)) {
    throw new ApiError(400, `Cannot raise maintenance for a ${asset.status} asset.`);
  }

  const request = await MaintenanceRequest.create({
    asset: data.asset,
    requestedBy,
    description: data.description,
    priority: data.priority || 'Medium',
    photos: data.photos || [],
  });

  await activityLogService.log({
    user: requestedBy,
    action: ACTIONS.MAINTENANCE_REQUESTED,
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    description: `Maintenance request raised for ${asset.name} (${asset.assetTag})`,
  });

  return request;
};

/**
 * List maintenance requests with filters.
 * Employees see only their own; Admins/AssetManagers see all.
 */
const getMaintenanceRequests = async (query, user) => {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.asset) filter.asset = query.asset;
  if (query.requestedBy) filter.requestedBy = query.requestedBy;

  // Employees see only their own
  if (user.role === 'Employee') {
    filter.requestedBy = user._id;
  }

  const totalDocs = await MaintenanceRequest.countDocuments(filter);
  const { page, limit, skip, pagination } = buildPagination(query, totalDocs);

  const requests = await MaintenanceRequest.find(filter)
    .populate('asset', 'name assetTag status')
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { requests, pagination };
};

/**
 * Get a single maintenance request by ID.
 */
const getMaintenanceById = async (id) => {
  const request = await MaintenanceRequest.findById(id)
    .populate('asset', 'name assetTag status category')
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email');

  if (!request) {
    throw new ApiError(404, 'Maintenance request not found');
  }

  return request;
};

/**
 * Approve a maintenance request.
 * Side effect: asset.status → UnderMaintenance
 */
const approveMaintenance = async (id, approvedBy) => {
  const request = await MaintenanceRequest.findById(id);
  if (!request) {
    throw new ApiError(404, 'Maintenance request not found');
  }

  if (request.status !== MAINTENANCE_STATUS.PENDING) {
    throw new ApiError(400, `Cannot approve a request with status '${request.status}'`);
  }

  request.status = MAINTENANCE_STATUS.APPROVED;
  request.approvedBy = approvedBy;
  await request.save();

  // Update asset status
  const asset = await Asset.findById(request.asset);
  if (asset) {
    asset.status = ASSET_STATUS.UNDER_MAINTENANCE;
    await asset.save();
  }

  // Notification
  await notificationService.createNotification({
    recipient: request.requestedBy,
    type: NOTIFICATION_TYPES.MAINTENANCE_APPROVED,
    title: 'Maintenance Approved',
    message: `Your maintenance request for ${asset ? asset.assetTag : 'asset'} has been approved.`,
    relatedEntity: { entityType: 'MaintenanceRequest', entityId: request._id },
  });

  await activityLogService.log({
    user: approvedBy,
    action: ACTIONS.MAINTENANCE_APPROVED,
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    description: `Maintenance approved for ${asset ? asset.assetTag : 'asset'}`,
  });

  return request;
};

/**
 * Reject a maintenance request.
 */
const rejectMaintenance = async (id, rejectionReason, rejectedBy) => {
  const request = await MaintenanceRequest.findById(id);
  if (!request) {
    throw new ApiError(404, 'Maintenance request not found');
  }

  if (request.status !== MAINTENANCE_STATUS.PENDING) {
    throw new ApiError(400, `Cannot reject a request with status '${request.status}'`);
  }

  request.status = MAINTENANCE_STATUS.REJECTED;
  request.rejectionReason = rejectionReason;
  request.approvedBy = rejectedBy;
  await request.save();

  // Notification
  const asset = await Asset.findById(request.asset);
  await notificationService.createNotification({
    recipient: request.requestedBy,
    type: NOTIFICATION_TYPES.MAINTENANCE_REJECTED,
    title: 'Maintenance Rejected',
    message: `Your maintenance request for ${asset ? asset.assetTag : 'asset'} has been rejected. Reason: ${rejectionReason}`,
    relatedEntity: { entityType: 'MaintenanceRequest', entityId: request._id },
  });

  await activityLogService.log({
    user: rejectedBy,
    action: ACTIONS.MAINTENANCE_REJECTED,
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    description: `Maintenance rejected. Reason: ${rejectionReason}`,
  });

  return request;
};

/**
 * Assign a technician.
 */
const assignTechnician = async (id, technician, userId) => {
  const request = await MaintenanceRequest.findById(id);
  if (!request) {
    throw new ApiError(404, 'Maintenance request not found');
  }

  if (request.status !== MAINTENANCE_STATUS.APPROVED) {
    throw new ApiError(400, `Cannot assign technician when status is '${request.status}'`);
  }

  request.status = MAINTENANCE_STATUS.TECHNICIAN_ASSIGNED;
  request.assignedTechnician = technician;
  await request.save();

  await activityLogService.log({
    user: userId,
    action: ACTIONS.MAINTENANCE_TECHNICIAN_ASSIGNED,
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    description: `Technician '${technician}' assigned`,
  });

  return request;
};

/**
 * Start maintenance work.
 */
const startMaintenance = async (id, userId) => {
  const request = await MaintenanceRequest.findById(id);
  if (!request) {
    throw new ApiError(404, 'Maintenance request not found');
  }

  if (request.status !== MAINTENANCE_STATUS.TECHNICIAN_ASSIGNED) {
    throw new ApiError(400, `Cannot start when status is '${request.status}'`);
  }

  request.status = MAINTENANCE_STATUS.IN_PROGRESS;
  await request.save();

  await activityLogService.log({
    user: userId,
    action: ACTIONS.MAINTENANCE_STARTED,
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    description: 'Maintenance work started',
  });

  return request;
};

/**
 * Resolve maintenance.
 * Side effect: asset.status → Available
 */
const resolveMaintenance = async (id, resolutionNotes, userId) => {
  const request = await MaintenanceRequest.findById(id);
  if (!request) {
    throw new ApiError(404, 'Maintenance request not found');
  }

  if (![MAINTENANCE_STATUS.IN_PROGRESS, MAINTENANCE_STATUS.TECHNICIAN_ASSIGNED, MAINTENANCE_STATUS.APPROVED].includes(request.status)) {
    throw new ApiError(400, `Cannot resolve when status is '${request.status}'`);
  }

  request.status = MAINTENANCE_STATUS.RESOLVED;
  request.resolutionNotes = resolutionNotes;
  request.resolvedAt = new Date();
  await request.save();

  // Update asset status back to Available
  const asset = await Asset.findById(request.asset);
  if (asset && asset.status === ASSET_STATUS.UNDER_MAINTENANCE) {
    asset.status = ASSET_STATUS.AVAILABLE;
    await asset.save();
  }

  // Notification
  await notificationService.createNotification({
    recipient: request.requestedBy,
    type: NOTIFICATION_TYPES.MAINTENANCE_APPROVED,
    title: 'Maintenance Resolved',
    message: `Maintenance for ${asset ? asset.assetTag : 'asset'} has been resolved.`,
    relatedEntity: { entityType: 'MaintenanceRequest', entityId: request._id },
  });

  await activityLogService.log({
    user: userId,
    action: ACTIONS.MAINTENANCE_RESOLVED,
    entityType: 'MaintenanceRequest',
    entityId: request._id,
    description: `Maintenance resolved. Notes: ${resolutionNotes}`,
  });

  return request;
};

module.exports = {
  createMaintenance,
  getMaintenanceRequests,
  getMaintenanceById,
  approveMaintenance,
  rejectMaintenance,
  assignTechnician,
  startMaintenance,
  resolveMaintenance,
};
