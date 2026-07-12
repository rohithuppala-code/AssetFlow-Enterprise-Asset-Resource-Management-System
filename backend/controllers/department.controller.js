const asyncHandler = require('../middleware/asyncHandler');
const departmentService = require('../services/department.service');
const activityLogService = require('../services/activityLog.service');
const ApiResponse = require('../utils/ApiResponse');
const { ACTIONS } = require('../config/constants');

const create = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment(req.body);

  await activityLogService.log({
    user: req.user._id,
    action: ACTIONS.DEPARTMENT_CREATED,
    entityType: 'Department',
    entityId: department._id,
    description: `Created department: ${department.name}`,
    ipAddress: req.ip,
  });

  res.status(201).json(new ApiResponse(201, 'Department created successfully', { department }));
});

const getAll = asyncHandler(async (req, res) => {
  const { departments, pagination } = await departmentService.getDepartments(req.query);
  res.status(200).json(new ApiResponse(200, 'Departments retrieved', { departments, pagination }));
});

const getById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Department retrieved', { department }));
});

const update = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(req.params.id, req.body);

  await activityLogService.log({
    user: req.user._id,
    action: ACTIONS.DEPARTMENT_UPDATED,
    entityType: 'Department',
    entityId: department._id,
    description: `Updated department: ${department.name}`,
    ipAddress: req.ip,
  });

  res.status(200).json(new ApiResponse(200, 'Department updated', { department }));
});

const deactivate = asyncHandler(async (req, res) => {
  const department = await departmentService.deactivateDepartment(req.params.id);

  await activityLogService.log({
    user: req.user._id,
    action: ACTIONS.DEPARTMENT_DEACTIVATED,
    entityType: 'Department',
    entityId: department._id,
    description: `Deactivated department: ${department.name}`,
    ipAddress: req.ip,
  });

  res.status(200).json(new ApiResponse(200, 'Department deactivated', { department }));
});

module.exports = { create, getAll, getById, update, deactivate };
