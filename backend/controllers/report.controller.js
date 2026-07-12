const asyncHandler = require('../middleware/asyncHandler');
const reportService = require('../services/report.service');
const ApiResponse = require('../utils/ApiResponse');

const getAssetUtilization = asyncHandler(async (req, res) => {
  const data = await reportService.getAssetUtilization(req.query);
  res.status(200).json(new ApiResponse(200, 'Asset utilization report', { data }));
});

const getMaintenanceFrequency = asyncHandler(async (req, res) => {
  const data = await reportService.getMaintenanceFrequency(req.query);
  res.status(200).json(new ApiResponse(200, 'Maintenance frequency report', { data }));
});

const getDepartmentAllocation = asyncHandler(async (req, res) => {
  const data = await reportService.getDepartmentAllocation();
  res.status(200).json(new ApiResponse(200, 'Department allocation report', { data }));
});

const getBookingHeatmap = asyncHandler(async (req, res) => {
  const data = await reportService.getBookingHeatmap(req.query);
  res.status(200).json(new ApiResponse(200, 'Booking heatmap report', { data }));
});

const getAssetsDue = asyncHandler(async (req, res) => {
  const data = await reportService.getAssetsDue();
  res.status(200).json(new ApiResponse(200, 'Assets due report', { data }));
});

const exportReport = asyncHandler(async (req, res) => {
  const reportType = req.params.type;
  const format = req.query.format || 'json';

  let data;
  switch (reportType) {
    case 'asset-utilization':
      data = await reportService.getAssetUtilization(req.query);
      break;
    case 'maintenance-frequency':
      data = await reportService.getMaintenanceFrequency(req.query);
      break;
    case 'department-allocation':
      data = await reportService.getDepartmentAllocation();
      break;
    case 'booking-heatmap':
      data = await reportService.getBookingHeatmap(req.query);
      break;
    case 'assets-due':
      data = await reportService.getAssetsDue();
      break;
    default:
      return res.status(400).json({ success: false, message: 'Invalid report type' });
  }

  if (format === 'csv') {
    // Simple CSV conversion
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      return res.status(200).header('Content-Type', 'text/csv').send('');
    }

    const flattenObject = (obj, prefix = '') => {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          Object.assign(result, flattenObject(value, newKey));
        } else {
          result[newKey] = value;
        }
      }
      return result;
    };

    const flatItems = items.map((item) => flattenObject(typeof item.toJSON === 'function' ? item.toJSON() : item));
    const headers = [...new Set(flatItems.flatMap((item) => Object.keys(item)))];
    const csvRows = [
      headers.join(','),
      ...flatItems.map((item) =>
        headers.map((h) => {
          const val = item[h] !== undefined ? String(item[h]) : '';
          return val.includes(',') ? `"${val}"` : val;
        }).join(',')
      ),
    ];

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename=${reportType}.csv`);
    return res.send(csvRows.join('\n'));
  }

  res.status(200).json(new ApiResponse(200, `${reportType} export`, { data }));
});

module.exports = {
  getAssetUtilization,
  getMaintenanceFrequency,
  getDepartmentAllocation,
  getBookingHeatmap,
  getAssetsDue,
  exportReport,
};
