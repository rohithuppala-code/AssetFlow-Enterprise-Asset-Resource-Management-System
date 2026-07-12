const asyncHandler = require('../middleware/asyncHandler');
const allocationService = require('../services/allocation.service');
const ApiResponse = require('../utils/ApiResponse');

const create = asyncHandler(async (req, res) => {
  const allocation = await allocationService.createAllocation(req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, 'Asset allocated successfully', { allocation }));
});

const getAll = asyncHandler(async (req, res) => {
  const { allocations, pagination } = await allocationService.getAllocations(req.query);
  res.status(200).json(new ApiResponse(200, 'Allocations retrieved', { allocations, pagination }));
});

const getById = asyncHandler(async (req, res) => {
  const allocation = await allocationService.getAllocationById(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Allocation retrieved', { allocation }));
});

const returnAsset = asyncHandler(async (req, res) => {
  const allocation = await allocationService.returnAsset(req.params.id, req.body, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Asset returned successfully', { allocation }));
});

const getOverdue = asyncHandler(async (req, res) => {
  const allocations = await allocationService.getOverdueAllocations();
  res.status(200).json(new ApiResponse(200, 'Overdue allocations retrieved', { allocations }));
});

module.exports = { create, getAll, getById, returnAsset, getOverdue };
