const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);

// GET /api/v1/dashboard/stats — any authenticated
router.get('/stats', dashboardController.getStats);

module.exports = router;
