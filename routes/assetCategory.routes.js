const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/assetCategory.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const categoryValidator = require('../validators/assetCategory.validator');
const { ROLES } = require('../config/constants');

// All routes require authentication
router.use(auth);

// GET /api/v1/asset-categories — any authenticated user
router.get('/', categoryController.getAll);

// GET /api/v1/asset-categories/:id — any authenticated user
router.get('/:id', categoryController.getById);

// POST /api/v1/asset-categories — Admin only
router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(categoryValidator.createCategory),
  categoryController.create
);

// PATCH /api/v1/asset-categories/:id — Admin only
router.patch(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(categoryValidator.updateCategory),
  categoryController.update
);

module.exports = router;
