const asyncHandler = require('../middleware/asyncHandler');
const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/ApiResponse');

const getAll = asyncHandler(async (req, res) => {
  const { notifications, pagination } = await notificationService.getNotifications(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, 'Notifications retrieved', { notifications, pagination }));
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Notification marked as read', { notification }));
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  res.status(200).json(new ApiResponse(200, 'All notifications marked as read'));
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  res.status(200).json(new ApiResponse(200, 'Unread count retrieved', { count }));
});

module.exports = { getAll, markRead, markAllRead, getUnreadCount };
