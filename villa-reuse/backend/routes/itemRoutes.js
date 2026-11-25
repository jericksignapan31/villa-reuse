// Items Routes
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItem);

// Protected routes
router.post('/', auth, itemController.createItem);
router.put('/:id', auth, itemController.updateItem);
router.delete('/:id', auth, itemController.deleteItem);

// User's items
router.get('/user/:userId/items', itemController.getUserItems);
router.get('/user/my/listings', auth, itemController.getUserItems);

// Favorites
router.get('/favorites/my/list', auth, itemController.getFavorites);
router.post('/:id/favorite', auth, itemController.addToFavorites);
router.delete('/:id/favorite', auth, itemController.removeFromFavorites);

// Item completion
router.post('/:id/complete', auth, itemController.completeItem);

module.exports = router;
