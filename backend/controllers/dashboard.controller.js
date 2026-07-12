const asyncHandler = require('../middleware/asyncHandler');
const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/ApiResponse');

const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user);
  res.status(200).json(new ApiResponse(200, 'Dashboard stats retrieved', stats));
});

module.exports = { getStats };
