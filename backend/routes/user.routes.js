const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const userValidator = require('../validators/user.validator');
const { ROLES } = require('../config/constants');

const authValidator = require('../validators/auth.validator');

// All user management routes require authentication
router.use(auth);

// POST /api/v1/users — Admin only
router.post('/', authorize(ROLES.ADMIN), validate(authValidator.register), userController.create);

// GET /api/v1/users — Admin, AssetManager
router.get('/', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), userController.getAll);

// GET /api/v1/users/:id — Admin, AssetManager
router.get('/:id', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), userController.getById);

// PATCH /api/v1/users/:id — Admin only (role promotion, profile update)
router.patch('/:id', authorize(ROLES.ADMIN), validate(userValidator.updateUser), userController.update);

module.exports = router;
