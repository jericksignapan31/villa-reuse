// Admin & Reports Routes
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middleware/auth');

// Reports (public)
router.post('/reports', auth, adminController.createReport);

// Admin routes - with middleware to check admin role
const isAdmin = (req, res, next) => {
  auth(req, res, () => {
    if (req.userRole !== 'admin' && req.userRole !== 'moderator') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

// Reports management
router.get('/reports', isAdmin, adminController.getReports);
router.get('/reports/:id', isAdmin, adminController.getReport);
router.post('/reports/:id/resolve', isAdmin, adminController.resolveReport);

// Dashboard
router.get('/dashboard/stats', isAdmin, adminController.getDashboardStats);

// User management
router.get('/users', isAdmin, adminController.getAllUsers);
router.put('/users/:userId/role', isAdmin, adminController.updateUserRole);
router.post('/users/:userId/suspend', isAdmin, adminController.suspendUser);
router.post('/users/:userId/restrict', isAdmin, adminController.restrictUser);
router.post('/users/:userId/restore', isAdmin, adminController.restoreUser);

// Listing management
router.get('/listings', isAdmin, adminController.getAllListings);
router.post('/listings/:itemId/remove', isAdmin, adminController.removeListing);

module.exports = router;
