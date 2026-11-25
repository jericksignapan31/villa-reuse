// Auth Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/public/:userId', authController.getUserPublic);

// Protected routes
router.get('/me', auth, authController.getCurrentUser);
router.post('/profile', auth, authController.updateProfile);
router.post('/change-password', auth, authController.changePassword);
router.post('/notification-preferences', auth, authController.updateNotificationPreferences);

module.exports = router;
