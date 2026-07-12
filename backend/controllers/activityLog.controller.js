const asyncHandler = require('../middleware/asyncHandler');
const activityLogService = require('../services/activityLog.service');
const ApiResponse = require('../utils/ApiResponse');

const getAll = asyncHandler(async (req, res) => {
  const { logs, pagination } = await activityLogService.getLogs(req.query);
  res.status(200).json(new ApiResponse(200, 'Activity logs retrieved', { logs, pagination }));
});

const getByEntity = asyncHandler(async (req, res) => {
  const logs = await activityLogService.getEntityLogs(req.params.entityType, req.params.entityId);
  res.status(200).json(new ApiResponse(200, 'Entity activity logs retrieved', { logs }));
});

module.exports = { getAll, getByEntity };
