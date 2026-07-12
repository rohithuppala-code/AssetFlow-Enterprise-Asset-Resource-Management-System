const express = require('express');
const router = express.Router();

const assetController = require('../controllers/asset.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const assetValidator = require('../validators/asset.validator');
const { ROLES } = require('../config/constants');

// All asset routes require authentication
router.use(auth);

// GET /api/v1/assets — any authenticated user (search/filter)
router.get('/', assetController.getAll);

// GET /api/v1/assets/:id — any authenticated user
router.get('/:id', assetController.getById);

// GET /api/v1/assets/:id/history — any authenticated user
router.get('/:id/history', assetController.getHistory);

// POST /api/v1/assets — Admin or AssetManager only
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  validate(assetValidator.createAsset),
  assetController.create
);

// PATCH /api/v1/assets/:id — Admin or AssetManager only
router.patch(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  validate(assetValidator.updateAsset),
  assetController.update
);

// PATCH /api/v1/assets/:id/status — Admin or AssetManager only
router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  validate(assetValidator.updateAssetStatus),
  assetController.updateStatus
);

module.exports = router;
