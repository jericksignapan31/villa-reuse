// Items Controller
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all items (with filters, search, sort)
exports.getItems = async (req, res) => {
  try {
    const { category, type, search, sort, skip = 0, limit = 20 } = req.query;
    
    // Build filter
    let filter = { status: { $ne: 'flagged' } };
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Build sort
    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'a-z') sortObj = { name: 1 };
    if (sort === 'z-a') sortObj = { name: -1 };
    
    // Execute query
    const items = await Item.find(filter)
      .populate('owner', 'name email phone profilePicture reputation')
      .sort(sortObj)
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    
    const total = await Item.countDocuments(filter);
    
    res.json({
      success: true,
      items,
      total,
      hasMore: parseInt(skip) + parseInt(limit) < total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get item by ID
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name email phone address profilePicture reputation')
      .populate('requestedBy', 'name email phone');
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create item
exports.createItem = async (req, res) => {
  try {
    const { name, description, category, condition, type, location, photos } = req.body;
    
    // Validation
    if (!name || !description || !category || !type || !location) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    
    const item = new Item({
      name: name.trim(),
      description: description.trim(),
      category,
      condition: condition || 'Good',
      type,
      location: location.trim(),
      photos: photos || [],
      owner: req.userId,
    });
    
    await item.save();
    await item.populate('owner', 'name email profilePicture reputation');
    
    res.status(201).json({
      success: true,
      item,
      message: 'Item created successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check ownership
    if (item.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }
    
    const { name, description, category, condition, type, location, photos } = req.body;
    
    if (name) item.name = name.trim();
    if (description) item.description = description.trim();
    if (category) item.category = category;
    if (condition) item.condition = condition;
    if (type) item.type = type;
    if (location) item.location = location.trim();
    if (photos) item.photos = photos;
    
    item.updatedAt = Date.now();
    await item.save();
    
    res.json({
      success: true,
      item,
      message: 'Item updated successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check ownership
    if (item.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }
    
    await Item.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add to favorites
exports.addToFavorites = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check if already favorited
    if (item.favoritedBy.includes(req.userId)) {
      return res.status(400).json({ error: 'Already in favorites' });
    }
    
    item.favoritedBy.push(req.userId);
    item.favoriteCount = item.favoritedBy.length;
    await item.save();
    
    res.json({
      success: true,
      item,
      message: 'Added to favorites',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove from favorites
exports.removeFromFavorites = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    item.favoritedBy = item.favoritedBy.filter(id => id.toString() !== req.userId.toString());
    item.favoriteCount = item.favoritedBy.length;
    await item.save();
    
    res.json({
      success: true,
      item,
      message: 'Removed from favorites',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's items
exports.getUserItems = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;
    
    const items = await Item.find({ owner: userId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark item as completed
exports.completeItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check ownership
    if (item.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    item.status = 'completed';
    item.completedDate = Date.now();
    await item.save();
    
    // Create notification for requester
    if (item.requestedBy) {
      await Notification.create({
        recipient: item.requestedBy,
        type: 'transaction_completed',
        relatedItem: item._id,
        title: 'Transaction Completed',
        message: `Your request for "${item.name}" has been completed!`,
        actionUrl: `/my-requests`,
      });
    }
    
    res.json({
      success: true,
      item,
      message: 'Item marked as completed',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's favorite items
exports.getFavorites = async (req, res) => {
  try {
    const items = await Item.find({ favoritedBy: req.userId })
      .populate('owner', 'name email phone profilePicture reputation')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
