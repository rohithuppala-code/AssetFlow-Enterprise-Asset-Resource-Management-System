const express = require('express');
const router = express.Router();

const transferController = require('../controllers/transfer.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const transferValidator = require('../validators/transfer.validator');
const { ROLES } = require('../config/constants');

router.use(auth);

// GET /api/v1/transfers — Admin, AssetManager
router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  transferController.getAll
);

// GET /api/v1/transfers/:id
router.get('/:id', transferController.getById);

// POST /api/v1/transfers — any authenticated
router.post(
  '/',
  validate(transferValidator.createTransfer),
  transferController.create
);

// PATCH /api/v1/transfers/:id/approve — Admin, AssetManager
router.patch(
  '/:id/approve',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  transferController.approve
);

// PATCH /api/v1/transfers/:id/reject — Admin, AssetManager
router.patch(
  '/:id/reject',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  validate(transferValidator.rejectTransfer),
  transferController.reject
);

module.exports = router;
