const express = require('express');
const router = express.Router();

const departmentController = require('../controllers/department.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const departmentValidator = require('../validators/department.validator');
const { ROLES } = require('../config/constants');

// All department routes require authentication
router.use(auth);

// GET /api/v1/departments — any authenticated user
router.get('/', departmentController.getAll);

// GET /api/v1/departments/:id — any authenticated user
router.get('/:id', departmentController.getById);

// POST /api/v1/departments — Admin only
router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(departmentValidator.createDepartment),
  departmentController.create
);

// PATCH /api/v1/departments/:id — Admin only
router.patch(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(departmentValidator.updateDepartment),
  departmentController.update
);

// PATCH /api/v1/departments/:id/deactivate — Admin only
router.patch(
  '/:id/deactivate',
  authorize(ROLES.ADMIN),
  departmentController.deactivate
);

module.exports = router;
