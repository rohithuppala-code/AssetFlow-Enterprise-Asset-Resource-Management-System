const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const userValidator = require('../validators/user.validator');
const { ROLES } = require('../config/constants');

// All user management routes require authentication + Admin role
router.use(auth);
router.use(authorize(ROLES.ADMIN));

// GET /api/v1/users — Admin only
router.get('/', userController.getAll);

// GET /api/v1/users/:id — Admin only
router.get('/:id', userController.getById);

// PATCH /api/v1/users/:id — Admin only (role promotion, profile update)
router.patch('/:id', validate(userValidator.updateUser), userController.update);

module.exports = router;
