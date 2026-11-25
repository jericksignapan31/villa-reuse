// Notifications Controller
const Notification = require('../models/Notification');

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const { type, unreadOnly = false, limit = 20, page = 1 } = req.query;
    
    let filter = { recipient: req.userId };
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (unreadOnly === 'true' || unreadOnly === true) {
      filter.isRead = false;
    }
    
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find(filter)
      .populate('sender', 'name profilePicture')
      .populate('relatedItem', 'name photos')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments(filter);
    
    res.json({
      success: true,
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single notification
exports.getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('sender', 'name email profilePicture')
      .populate('relatedItem', 'name description photos')
      .populate('relatedRequest');
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check ownership
    if (notification.recipient.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Mark as read
    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = Date.now();
      await notification.save();
    }
    
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check ownership
    if (notification.recipient.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    notification.isRead = true;
    notification.readAt = Date.now();
    await notification.save();
    
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark multiple notifications as read
exports.markMultipleAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ error: 'Notification IDs array required' });
    }
    
    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipient: req.userId,
      },
      {
        isRead: true,
        readAt: Date.now(),
      }
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: Date.now(),
      }
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check ownership
    if (notification.recipient.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await Notification.deleteOne({ _id: req.params.id });
    
    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete multiple notifications
exports.deleteMultiple = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ error: 'Notification IDs array required' });
    }
    
    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
      recipient: req.userId,
    });
    
    res.json({
      success: true,
      message: `${result.deletedCount} notifications deleted`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete all notifications
exports.deleteAll = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      recipient: req.userId,
    });
    
    res.json({
      success: true,
      message: `${result.deletedCount} notifications deleted`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get notification counts
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.userId,
      isRead: false,
    });
    
    const countByType = await Notification.aggregate([
      {
        $match: {
          recipient: require('mongoose').Types.ObjectId(req.userId),
          isRead: false,
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);
    
    const typeCounts = {};
    countByType.forEach((item) => {
      typeCounts[item._id] = item.count;
    });
    
    res.json({
      success: true,
      unreadCount,
      byType: typeCounts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
