const ActivityLog = require('../models/ActivityLog');
const { buildPagination } = require('../utils/pagination');

/**
 * Create an activity log entry.
 *
 * @param {object} params
 * @param {string} params.user        - User ObjectId who performed the action
 * @param {string} params.action      - Action name from constants.ACTIONS
 * @param {string} params.entityType  - e.g., 'User', 'Asset', 'Allocation'
 * @param {string} params.entityId    - ObjectId of the affected entity
 * @param {string} params.description - Human-readable description
 * @param {object} [params.metadata]  - Additional context
 * @param {string} [params.ipAddress] - Client IP
 */
const log = async ({ user, action, entityType, entityId, description, metadata, ipAddress }) => {
  try {
    await ActivityLog.create({
      user,
      action,
      entityType,
      entityId,
      description,
      metadata: metadata || {},
      ipAddress: ipAddress || '',
    });
  } catch (error) {
    // Activity log failures should NOT break the main operation
    console.error('Failed to create activity log:', error.message);
  }
};

/**
 * Get activity logs with pagination and filtering.
 */
const getLogs = async (query) => {
  const filter = {};

  if (query.user) filter.user = query.user;
  if (query.action) filter.action = query.action;
  if (query.entityType) filter.entityType = query.entityType;
  if (query.entityId) filter.entityId = query.entityId;

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  const totalDocs = await ActivityLog.countDocuments(filter);
  const { page, limit, skip, pagination } = buildPagination(query, totalDocs);

  const logs = await ActivityLog.find(filter)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { logs, pagination };
};

/**
 * Get logs for a specific entity.
 */
const getEntityLogs = async (entityType, entityId) => {
  const logs = await ActivityLog.find({ entityType, entityId })
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });

  return logs;
};

module.exports = {
  log,
  getLogs,
  getEntityLogs,
};
