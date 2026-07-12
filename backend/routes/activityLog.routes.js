const express = require('express');
const router = express.Router();

const activityLogController = require('../controllers/activityLog.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

router.use(auth);

// GET /api/v1/activity-logs — Admin only
router.get(
  '/',
  authorize(ROLES.ADMIN),
  activityLogController.getAll
);

// GET /api/v1/activity-logs/entity/:entityType/:entityId — Admin, AssetManager
router.get(
  '/entity/:entityType/:entityId',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  activityLogController.getByEntity
);

module.exports = router;
