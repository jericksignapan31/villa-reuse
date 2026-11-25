// Notifications Routes
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// Get notifications
router.get('/', auth, notificationController.getNotifications);
router.get('/unread/count', auth, notificationController.getUnreadCount);
router.get('/:id', auth, notificationController.getNotification);

// Mark as read
router.post('/:id/read', auth, notificationController.markAsRead);
router.post('/mark-all/read', auth, notificationController.markAllAsRead);
router.post('/mark-multiple/read', auth, notificationController.markMultipleAsRead);

// Delete
router.delete('/:id', auth, notificationController.deleteNotification);
router.post('/delete-multiple', auth, notificationController.deleteMultiple);
router.delete('/delete-all', auth, notificationController.deleteAll);

module.exports = router;
