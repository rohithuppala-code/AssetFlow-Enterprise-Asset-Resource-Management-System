const asyncHandler = require('../middleware/asyncHandler');
const auditService = require('../services/audit.service');
const ApiResponse = require('../utils/ApiResponse');

const createCycle = asyncHandler(async (req, res) => {
  const cycle = await auditService.createAuditCycle(req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, 'Audit cycle created', { cycle }));
});

const getCycles = asyncHandler(async (req, res) => {
  const { cycles, pagination } = await auditService.getAuditCycles(req.query);
  res.status(200).json(new ApiResponse(200, 'Audit cycles retrieved', { cycles, pagination }));
});

const getCycleById = asyncHandler(async (req, res) => {
  const { cycle, summary } = await auditService.getAuditCycleById(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Audit cycle retrieved', { cycle, summary }));
});

const createEntry = asyncHandler(async (req, res) => {
  const entry = await auditService.createAuditEntry(req.params.id, req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, 'Audit entry submitted', { entry }));
});

const getEntries = asyncHandler(async (req, res) => {
  const entries = await auditService.getAuditEntries(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Audit entries retrieved', { entries }));
});

const closeCycle = asyncHandler(async (req, res) => {
  const cycle = await auditService.closeAuditCycle(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Audit cycle closed', { cycle }));
});

const getDiscrepancyReport = asyncHandler(async (req, res) => {
  const report = await auditService.getDiscrepancyReport(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Discrepancy report generated', { report }));
});

module.exports = { createCycle, getCycles, getCycleById, createEntry, getEntries, closeCycle, getDiscrepancyReport };
