const Department = require('../models/Department');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/pagination');
const { ROLES, DEPARTMENT_STATUS } = require('../config/constants');

/**
 * Create a new department.
 */
const createDepartment = async (data) => {

  // Validate parent department exists
  if (data.parentDepartment) {
    const parentDept = await Department.findById(data.parentDepartment);
    if (!parentDept) {
      throw new ApiError(404, 'Parent department not found');
    }
  }

  const department = await Department.create(data);
  return department;
};

/**
 * Get all departments with pagination and filtering.
 */
const getDepartments = async (query) => {
  const filter = {};

  if (query.status) filter.status = query.status;

  const totalDocs = await Department.countDocuments(filter);
  const { page, limit, skip, pagination } = buildPagination(query, totalDocs);

  const departments = await Department.find(filter)
    .populate('parentDepartment', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { departments, pagination };
};

/**
 * Get a single department by ID.
 */
const getDepartmentById = async (id) => {
  const department = await Department.findById(id)
    .populate('parentDepartment', 'name');

  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  return department;
};

/**
 * Update a department.
 */
const updateDepartment = async (id, data) => {
  const department = await Department.findById(id);
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  // Validate parent department if being changed
  if (data.parentDepartment) {
    if (data.parentDepartment === id) {
      throw new ApiError(400, 'Department cannot be its own parent');
    }
    const parentDept = await Department.findById(data.parentDepartment);
    if (!parentDept) {
      throw new ApiError(404, 'Parent department not found');
    }
  }

  Object.assign(department, data);
  await department.save();

  return department;
};

/**
 * Deactivate a department.
 */
const deactivateDepartment = async (id) => {
  const department = await Department.findById(id);
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  department.status = DEPARTMENT_STATUS.INACTIVE;
  await department.save();

  return department;
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deactivateDepartment,
};
