const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);

// GET /api/v1/notifications/unread-count
router.get('/unread-count', notificationController.getUnreadCount);

// PATCH /api/v1/notifications/read-all
router.patch('/read-all', notificationController.markAllRead);

// GET /api/v1/notifications
router.get('/', notificationController.getAll);

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', notificationController.markRead);

module.exports = router;
