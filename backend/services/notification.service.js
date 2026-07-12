const Notification = require('../models/Notification');
const { buildPagination } = require('../utils/pagination');

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

/**
 * Get notifications for a user with pagination and filtering.
 */
const getNotifications = async (userId, query) => {
  const filter = { recipient: userId };

  if (typeof query.isRead !== 'undefined') {
    filter.isRead = query.isRead === 'true';
  }

  const totalDocs = await Notification.countDocuments(filter);
  const { page, limit, skip, pagination } = buildPagination(query, totalDocs);

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { notifications, pagination };
};

/**
 * Mark a single notification as read.
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );

  return notification;
};

/**
 * Mark all notifications as read for a user.
 */
const markAllRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};

/**
 * Get count of unread notifications.
 */
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });
  return count;
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllRead,
  getUnreadCount,
};
