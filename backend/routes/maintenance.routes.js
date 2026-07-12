const express = require('express');
const router = express.Router();

const maintenanceController = require('../controllers/maintenance.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const maintenanceValidator = require('../validators/maintenance.validator');
const { ROLES } = require('../config/constants');

router.use(auth);

// GET /api/v1/maintenance — any authenticated (filtered by role in service)
router.get('/', maintenanceController.getAll);

// GET /api/v1/maintenance/:id
router.get('/:id', maintenanceController.getById);

// POST /api/v1/maintenance — any authenticated
router.post(
  '/',
  validate(maintenanceValidator.createMaintenance),
  maintenanceController.create
);

// PATCH /api/v1/maintenance/:id/approve — Admin, AssetManager
router.patch(
  '/:id/approve',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  maintenanceController.approve
);

// PATCH /api/v1/maintenance/:id/reject — Admin, AssetManager
router.patch(
  '/:id/reject',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  validate(maintenanceValidator.rejectMaintenance),
  maintenanceController.reject
);

// PATCH /api/v1/maintenance/:id/assign-technician — Admin, AssetManager
router.patch(
  '/:id/assign-technician',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  validate(maintenanceValidator.assignTechnician),
  maintenanceController.assignTech
);

// PATCH /api/v1/maintenance/:id/start — Admin, AssetManager
router.patch(
  '/:id/start',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  maintenanceController.start
);

// PATCH /api/v1/maintenance/:id/resolve — Admin, AssetManager
router.patch(
  '/:id/resolve',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  validate(maintenanceValidator.resolveMaintenance),
  maintenanceController.resolve
);

module.exports = router;
