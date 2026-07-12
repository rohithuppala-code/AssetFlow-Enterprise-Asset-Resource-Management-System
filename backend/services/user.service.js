const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/pagination');
const { ROLES, NOTIFICATION_TYPES, ACTIONS } = require('../config/constants');
const notificationService = require('./notification.service');
const activityLogService = require('./activityLog.service');

/**
 * Get all users (Employee Directory) with pagination, filtering, search.
 */
const getUsers = async (query) => {
  const filter = {};

  if (query.role) filter.role = query.role;
  if (query.department) filter.department = query.department;
  if (query.status) filter.status = query.status;

  // Search by name or email
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  const totalDocs = await User.countDocuments(filter);
  const { page, limit, skip, pagination } = buildPagination(query, totalDocs);

  const users = await User.find(filter)
    .populate('department', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { users, pagination };
};

/**
 * Get a single user by ID.
 */
const getUserById = async (id) => {
  const user = await User.findById(id).populate('department', 'name');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

/**
 * Update a user (Admin action). Handles role assignment.
 */
const updateUser = async (id, data, adminUser) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent Admin from demoting themselves
  if (id === adminUser._id.toString() && data.role && data.role !== ROLES.ADMIN) {
    throw new ApiError(400, 'You cannot change your own role');
  }

  // Prevent assigning Admin role via API
  if (data.role === ROLES.ADMIN) {
    throw new ApiError(400, 'Admin role cannot be assigned via API');
  }

  const oldRole = user.role;

  Object.assign(user, data);
  await user.save({ validateBeforeSave: false });

  // If role changed, send notification
  if (data.role && data.role !== oldRole) {
    await notificationService.createNotification({
      recipient: user._id,
      type: NOTIFICATION_TYPES.ROLE_CHANGED,
      title: 'Role Updated',
      message: `Your role has been changed from ${oldRole} to ${data.role}`,
      relatedEntity: { entityType: 'User', entityId: user._id },
    });

    await activityLogService.log({
      user: adminUser._id,
      action: ACTIONS.ROLE_CHANGED,
      entityType: 'User',
      entityId: user._id,
      description: `Changed role of ${user.name} from ${oldRole} to ${data.role}`,
      metadata: { oldRole, newRole: data.role },
    });
  }

  return user;
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
};
