const express = require('express');
const router = express.Router();

// Mount all sub-routers
router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/departments', require('./department.routes'));
router.use('/asset-categories', require('./assetCategory.routes'));
router.use('/assets', require('./asset.routes'));

module.exports = router;
