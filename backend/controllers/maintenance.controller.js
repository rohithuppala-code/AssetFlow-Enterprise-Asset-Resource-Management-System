const asyncHandler = require('../middleware/asyncHandler');
const maintenanceService = require('../services/maintenance.service');
const ApiResponse = require('../utils/ApiResponse');

const create = asyncHandler(async (req, res) => {
  const request = await maintenanceService.createMaintenance(req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, 'Maintenance request created', { request }));
});

const getAll = asyncHandler(async (req, res) => {
  const { requests, pagination } = await maintenanceService.getMaintenanceRequests(req.query, req.user);
  res.status(200).json(new ApiResponse(200, 'Maintenance requests retrieved', { requests, pagination }));
});

const getById = asyncHandler(async (req, res) => {
  const request = await maintenanceService.getMaintenanceById(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Maintenance request retrieved', { request }));
});

const approve = asyncHandler(async (req, res) => {
  const request = await maintenanceService.approveMaintenance(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Maintenance request approved', { request }));
});

const reject = asyncHandler(async (req, res) => {
  const request = await maintenanceService.rejectMaintenance(req.params.id, req.body.rejectionReason, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Maintenance request rejected', { request }));
});

const assignTech = asyncHandler(async (req, res) => {
  const request = await maintenanceService.assignTechnician(req.params.id, req.body.assignedTechnician, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Technician assigned', { request }));
});

const start = asyncHandler(async (req, res) => {
  const request = await maintenanceService.startMaintenance(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Maintenance started', { request }));
});

const resolve = asyncHandler(async (req, res) => {
  const request = await maintenanceService.resolveMaintenance(req.params.id, req.body.resolutionNotes, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Maintenance resolved', { request }));
});

module.exports = { create, getAll, getById, approve, reject, assignTech, start, resolve };
