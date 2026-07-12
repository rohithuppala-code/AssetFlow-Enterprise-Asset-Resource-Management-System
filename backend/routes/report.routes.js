const express = require('express');
const router = express.Router();

const reportController = require('../controllers/report.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

router.use(auth);

// GET /api/v1/reports/asset-utilization
router.get(
  '/asset-utilization',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  reportController.getAssetUtilization
);

// GET /api/v1/reports/maintenance-frequency
router.get(
  '/maintenance-frequency',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  reportController.getMaintenanceFrequency
);

// GET /api/v1/reports/department-allocation
router.get(
  '/department-allocation',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  reportController.getDepartmentAllocation
);

// GET /api/v1/reports/booking-heatmap
router.get(
  '/booking-heatmap',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  reportController.getBookingHeatmap
);

// GET /api/v1/reports/assets-due
router.get(
  '/assets-due',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  reportController.getAssetsDue
);

// GET /api/v1/reports/export/:type
router.get(
  '/export/:type',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  reportController.exportReport
);

module.exports = router;
