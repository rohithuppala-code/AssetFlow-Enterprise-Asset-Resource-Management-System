const Notification = require('../models/Notification');

/**
 * Create a notification for a user.
 *
 * @param {object} params
 * @param {string} params.recipient     - User ObjectId
 * @param {string} params.type          - Notification type from constants
 * @param {string} params.title         - Short title
 * @param {string} params.message       - Detailed message
 * @param {object} [params.relatedEntity] - { entityType, entityId }
 */
const createNotification = async ({ recipient, type, title, message, relatedEntity }) => {
  try {
    await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedEntity: relatedEntity || {},
    });
  } catch (error) {
    // Notification failures should NOT break the main operation
    console.error('Failed to create notification:', error.message);
  }
};

module.exports = {
  createNotification,
};
