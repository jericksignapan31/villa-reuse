// Reports & Admin Controller
const Report = require('../models/Report');
const User = require('../models/User');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

// Create report
exports.createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;
    
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ error: 'Target type, ID, and reason required' });
    }
    
    // Validate target exists
    if (targetType === 'listing') {
      const item = await Item.findById(targetId);
      if (!item) return res.status(404).json({ error: 'Listing not found' });
    } else if (targetType === 'user') {
      const user = await User.findById(targetId);
      if (!user) return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if report already exists
    const existing = await Report.findOne({
      targetType,
      targetId,
      reporter: req.userId,
      status: 'pending',
    });
    
    if (existing) {
      return res.status(400).json({ error: 'You already have a pending report for this' });
    }
    
    const report = new Report({
      targetType,
      targetId,
      reason,
      description: description || '',
      reporter: req.userId,
      status: 'pending',
    });
    
    await report.save();
    await report.populate('reporter', 'name email');
    
    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        sender: req.userId,
        type: 'report_filed',
        title: 'New Report',
        message: `A new report has been filed: ${reason}`,
        actionUrl: '/admin/reports',
      });
    }
    
    res.status(201).json({
      success: true,
      report,
      message: 'Report submitted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all reports (admin only)
exports.getReports = async (req, res) => {
  try {
    const { status, targetType, limit = 20, page = 1 } = req.query;
    
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (targetType && targetType !== 'all') {
      filter.targetType = targetType;
    }
    
    const skip = (page - 1) * limit;
    
    const reports = await Report.find(filter)
      .populate('reporter', 'name email')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Report.countDocuments(filter);
    
    res.json({
      success: true,
      reports,
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

// Get single report
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'name email')
      .populate('resolvedBy', 'name');
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Resolve report (admin only)
exports.resolveReport = async (req, res) => {
  try {
    const { action, resolution } = req.body;
    
    if (!action || !resolution) {
      return res.status(400).json({ error: 'Action and resolution required' });
    }
    
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    report.status = 'resolved';
    report.action = action;
    report.resolution = resolution;
    report.resolvedBy = req.userId;
    report.resolvedDate = Date.now();
    
    // Execute action
    if (action === 'remove_content' && report.targetType === 'listing') {
      const item = await Item.findById(report.targetId);
      if (item) {
        item.status = 'flagged';
        item.flagReason = resolution;
        await item.save();
      }
    } else if (action === 'warn_user') {
      const user = await User.findById(report.targetId);
      if (user) {
        user.warnings = (user.warnings || 0) + 1;
        await user.save();
        
        await Notification.create({
          recipient: report.targetId,
          sender: req.userId,
          type: 'account_warning',
          title: 'Account Warning',
          message: `Your account has been warned for: ${resolution}`,
        });
      }
    } else if (action === 'suspend_user') {
      const user = await User.findById(report.targetId);
      if (user) {
        user.status = 'suspended';
        await user.save();
        
        await Notification.create({
          recipient: report.targetId,
          sender: req.userId,
          type: 'account_suspended',
          title: 'Account Suspended',
          message: `Your account has been suspended for: ${resolution}`,
        });
      }
    } else if (action === 'restrict_user') {
      const user = await User.findById(report.targetId);
      if (user) {
        user.status = 'restricted';
        await user.save();
        
        await Notification.create({
          recipient: report.targetId,
          sender: req.userId,
          type: 'account_restricted',
          title: 'Account Restricted',
          message: `Your account has been restricted: ${resolution}`,
        });
      }
    }
    
    await report.save();
    
    res.json({
      success: true,
      report,
      message: 'Report resolved',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Item.countDocuments();
    const activeListings = await Item.countDocuments({ status: 'available' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    
    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('reporter', 'name');
    
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);
    
    const roleStats = {};
    userStats.forEach((stat) => {
      roleStats[stat._id || 'user'] = stat.count;
    });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalListings,
        activeListings,
        suspendedUsers,
        pendingReports,
      },
      recentReports,
      roleStats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Manage users - get all
exports.getAllUsers = async (req, res) => {
  try {
    const { status, role, limit = 20, page = 1 } = req.query;
    
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (role && role !== 'all') {
      filter.role = role;
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      users,
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

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Suspend user
exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'suspended', suspensionReason: reason },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Notify user
    await Notification.create({
      recipient: userId,
      sender: req.userId,
      type: 'account_suspended',
      title: 'Account Suspended',
      message: `Your account has been suspended: ${reason}`,
    });
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Restrict user
exports.restrictUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'restricted', restrictionReason: reason },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Notify user
    await Notification.create({
      recipient: userId,
      sender: req.userId,
      type: 'account_restricted',
      title: 'Account Restricted',
      message: `Your account has been restricted: ${reason}`,
    });
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Restore user (remove suspension/restriction)
exports.restoreUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'active', suspensionReason: null, restrictionReason: null },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Notify user
    await Notification.create({
      recipient: userId,
      sender: req.userId,
      type: 'account_restored',
      title: 'Account Restored',
      message: 'Your account has been restored to active status',
    });
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all listings (admin)
exports.getAllListings = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const items = await Item.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Item.countDocuments(filter);
    
    res.json({
      success: true,
      items,
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

// Remove listing
exports.removeListing = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { reason } = req.body;
    
    const item = await Item.findByIdAndUpdate(
      itemId,
      { status: 'flagged', flagReason: reason },
      { new: true }
    ).populate('owner', 'name email');
    
    if (!item) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    // Notify owner
    await Notification.create({
      recipient: item.owner._id,
      sender: req.userId,
      type: 'content_removed',
      relatedItem: itemId,
      title: 'Listing Removed',
      message: `Your listing has been removed: ${reason}`,
    });
    
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
