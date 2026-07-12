const asyncHandler = require('../middleware/asyncHandler');
const assetService = require('../services/asset.service');
const activityLogService = require('../services/activityLog.service');
const ApiResponse = require('../utils/ApiResponse');
const { ACTIONS } = require('../config/constants');

const create = asyncHandler(async (req, res) => {
  const asset = await assetService.createAsset(req.body, req.user._id);

  await activityLogService.log({
    user: req.user._id,
    action: ACTIONS.ASSET_CREATED,
    entityType: 'Asset',
    entityId: asset._id,
    description: `Registered asset: ${asset.name} (${asset.assetTag})`,
    ipAddress: req.ip,
  });

  res.status(201).json(new ApiResponse(201, 'Asset registered successfully', { asset }));
});

const getAll = asyncHandler(async (req, res) => {
  const { assets, pagination } = await assetService.getAssets(req.query);
  res.status(200).json(new ApiResponse(200, 'Assets retrieved', { assets, pagination }));
});

const getById = asyncHandler(async (req, res) => {
  const asset = await assetService.getAssetById(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Asset retrieved', { asset }));
});

const update = asyncHandler(async (req, res) => {
  const asset = await assetService.updateAsset(req.params.id, req.body);

  await activityLogService.log({
    user: req.user._id,
    action: ACTIONS.ASSET_UPDATED,
    entityType: 'Asset',
    entityId: asset._id,
    description: `Updated asset: ${asset.name} (${asset.assetTag})`,
    ipAddress: req.ip,
  });

  res.status(200).json(new ApiResponse(200, 'Asset updated', { asset }));
});

const updateStatus = asyncHandler(async (req, res) => {
  const asset = await assetService.updateAssetStatus(req.params.id, req.body.status);

  await activityLogService.log({
    user: req.user._id,
    action: ACTIONS.ASSET_STATUS_CHANGED,
    entityType: 'Asset',
    entityId: asset._id,
    description: `Changed asset ${asset.assetTag} status to ${asset.status}`,
    metadata: { newStatus: asset.status, reason: req.body.reason || '' },
    ipAddress: req.ip,
  });

  res.status(200).json(new ApiResponse(200, 'Asset status updated', { asset }));
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await assetService.getAssetHistory(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Asset history retrieved', { ...history }));
});

module.exports = { create, getAll, getById, update, updateStatus, getHistory };
