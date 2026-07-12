const ActivityLog = require('../models/ActivityLog');

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

module.exports = {
  log,
};
