const asyncHandler = require('../middleware/asyncHandler');
const transferService = require('../services/transfer.service');
const ApiResponse = require('../utils/ApiResponse');

const create = asyncHandler(async (req, res) => {
  const transfer = await transferService.createTransfer(req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, 'Transfer request created', { transfer }));
});

const getAll = asyncHandler(async (req, res) => {
  const { transfers, pagination } = await transferService.getTransfers(req.query);
  res.status(200).json(new ApiResponse(200, 'Transfer requests retrieved', { transfers, pagination }));
});

const getById = asyncHandler(async (req, res) => {
  const transfer = await transferService.getTransferById(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Transfer request retrieved', { transfer }));
});

const approve = asyncHandler(async (req, res) => {
  const transfer = await transferService.approveTransfer(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Transfer approved and completed', { transfer }));
});

const reject = asyncHandler(async (req, res) => {
  const transfer = await transferService.rejectTransfer(req.params.id, req.body.rejectionReason, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Transfer rejected', { transfer }));
});

module.exports = { create, getAll, getById, approve, reject };
