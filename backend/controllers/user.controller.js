const asyncHandler = require('../middleware/asyncHandler');
const userService = require('../services/user.service');
const activityLogService = require('../services/activityLog.service');
const ApiResponse = require('../utils/ApiResponse');
const { ACTIONS } = require('../config/constants');

const getAll = asyncHandler(async (req, res) => {
  const { users, pagination } = await userService.getUsers(req.query);
  res.status(200).json(new ApiResponse(200, 'Users retrieved', { users, pagination }));
});

const getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, 'User retrieved', { user }));
});

const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user);

  await activityLogService.log({
    user: req.user._id,
    action: ACTIONS.USER_UPDATED,
    entityType: 'User',
    entityId: user._id,
    description: `Updated user: ${user.name}`,
    ipAddress: req.ip,
  });

  res.status(200).json(new ApiResponse(200, 'User updated', { user }));
});

module.exports = { getAll, getById, update };
