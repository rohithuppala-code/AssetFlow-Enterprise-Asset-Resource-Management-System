const express = require('express');
const router = express.Router();

// Mount all sub-routers
router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/departments', require('./department.routes'));
router.use('/asset-categories', require('./assetCategory.routes'));
router.use('/assets', require('./asset.routes'));
router.use('/allocations', require('./allocation.routes'));
router.use('/transfers', require('./transfer.routes'));
router.use('/bookings', require('./booking.routes'));
router.use('/maintenance', require('./maintenance.routes'));
router.use('/audits', require('./audit.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/reports', require('./report.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/activity-logs', require('./activityLog.routes'));

module.exports = router;
