const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const { ALLOCATION_STATUS, BOOKING_STATUS, ASSET_STATUS } = require('../config/constants');

/**
 * Asset utilization — most-used vs. idle based on allocation/booking frequency.
 */
const getAssetUtilization = async (query) => {
  const matchStage = {};
  if (query.category) matchStage.category = require('mongoose').Types.ObjectId.createFromHexString(query.category);
  if (query.department) matchStage.department = require('mongoose').Types.ObjectId.createFromHexString(query.department);

  const assets = await Asset.find(matchStage).select('name assetTag status category department').lean();

  const results = [];
  for (const asset of assets) {
    const allocationCount = await Allocation.countDocuments({ asset: asset._id });
    const bookingCount = await Booking.countDocuments({ asset: asset._id });

    results.push({
      asset: { _id: asset._id, name: asset.name, assetTag: asset.assetTag, status: asset.status },
      allocationCount,
      bookingCount,
      totalUsage: allocationCount + bookingCount,
    });
  }

  // Sort by total usage descending
  results.sort((a, b) => b.totalUsage - a.totalUsage);

  return results;
};

/**
 * Maintenance frequency by asset/category.
 */
const getMaintenanceFrequency = async (query) => {
  const matchStage = {};
  if (query.category) {
    const assets = await Asset.find({ category: query.category }).select('_id');
    matchStage.asset = { $in: assets.map((a) => a._id) };
  }

  const frequency = await MaintenanceRequest.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$asset',
        count: { $sum: 1 },
        lastRequest: { $max: '$createdAt' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 50 },
    {
      $lookup: {
        from: 'assets',
        localField: '_id',
        foreignField: '_id',
        as: 'assetInfo',
      },
    },
    { $unwind: { path: '$assetInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        asset: {
          _id: '$assetInfo._id',
          name: '$assetInfo.name',
          assetTag: '$assetInfo.assetTag',
        },
        count: 1,
        lastRequest: 1,
      },
    },
  ]);

  return frequency;
};

/**
 * Department-wise allocation summary.
 */
const getDepartmentAllocation = async () => {
  const summary = await Allocation.aggregate([
    { $match: { status: ALLOCATION_STATUS.ACTIVE } },
    {
      $group: {
        _id: '$department',
        activeAllocations: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'departmentInfo',
      },
    },
    { $unwind: { path: '$departmentInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        department: {
          _id: '$departmentInfo._id',
          name: '$departmentInfo.name',
        },
        activeAllocations: 1,
      },
    },
    { $sort: { activeAllocations: -1 } },
  ]);

  return summary;
};

/**
 * Booking heatmap — peak usage windows by hour/day.
 */
const getBookingHeatmap = async (query) => {
  const matchStage = {
    status: { $ne: BOOKING_STATUS.CANCELLED },
  };

  if (query.startDate) matchStage.startTime = { $gte: new Date(query.startDate) };
  if (query.endDate) {
    matchStage.startTime = matchStage.startTime || {};
    matchStage.startTime.$lte = new Date(query.endDate);
  }

  const heatmap = await Booking.aggregate([
    { $match: matchStage },
    {
      $project: {
        dayOfWeek: { $dayOfWeek: '$startTime' },
        hour: { $hour: '$startTime' },
      },
    },
    {
      $group: {
        _id: { dayOfWeek: '$dayOfWeek', hour: '$hour' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } },
  ]);

  return heatmap;
};

/**
 * Assets due for maintenance or nearing retirement.
 */
const getAssetsDue = async () => {
  // Assets with condition Fair/Poor/Damaged that haven't had recent maintenance
  const assetsDue = await Asset.find({
    status: { $nin: [ASSET_STATUS.DISPOSED, ASSET_STATUS.RETIRED] },
    condition: { $in: ['Fair', 'Poor', 'Damaged'] },
  })
    .select('name assetTag status condition category department acquisitionDate')
    .populate('category', 'name')
    .populate('department', 'name')
    .sort({ condition: 1 })
    .limit(50);

  return assetsDue;
};

module.exports = {
  getAssetUtilization,
  getMaintenanceFrequency,
  getDepartmentAllocation,
  getBookingHeatmap,
  getAssetsDue,
};
