const express = require('express');
const router = express.Router();

const allocationController = require('../controllers/allocation.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const allocationValidator = require('../validators/allocation.validator');
const { ROLES } = require('../config/constants');

router.use(auth);

// GET /api/v1/allocations/overdue — Admin, AssetManager
router.get(
  '/overdue',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  allocationController.getOverdue
);

// GET /api/v1/allocations — any authenticated
router.get('/', allocationController.getAll);

// GET /api/v1/allocations/:id — any authenticated
router.get('/:id', allocationController.getById);

// POST /api/v1/allocations — Admin, AssetManager, DepartmentHead
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD),
  validate(allocationValidator.createAllocation),
  allocationController.create
);

// POST /api/v1/allocations/:id/return — Admin, AssetManager
router.post(
  '/:id/return',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  validate(allocationValidator.returnAllocation),
  allocationController.returnAsset
);

module.exports = router;
