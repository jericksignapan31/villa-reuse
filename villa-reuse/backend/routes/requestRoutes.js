// Request Routes
const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { auth } = require('../middleware/auth');

// Protected routes
router.post('/', auth, requestController.createRequest);
router.get('/', auth, requestController.getUserRequests);
router.get('/:id', auth, requestController.getRequest);

// Accept/Reject
router.post('/:id/accept', auth, requestController.acceptRequest);
router.post('/:id/reject', auth, requestController.rejectRequest);

// Cancel (by requester)
router.post('/:id/cancel', auth, requestController.cancelRequest);

// Complete (by requester)
router.post('/:id/complete', auth, requestController.completeRequest);

// Notes
router.post('/:id/notes', auth, requestController.addNote);

module.exports = router;
