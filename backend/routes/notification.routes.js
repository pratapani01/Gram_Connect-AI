const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', notifController.getNotifications);
router.get('/unread-count', notifController.getUnreadCount);
router.patch('/:id/read', notifController.markAsRead);
router.patch('/mark-all-read', notifController.markAllAsRead);

module.exports = router;
