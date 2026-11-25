// Request/Transaction Controller
const Request = require('../models/Request');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

// Create request
exports.createRequest = async (req, res) => {
  try {
    const { itemId, message } = req.body;
    
    if (!itemId) {
      return res.status(400).json({ error: 'Item ID required' });
    }
    
    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check if user is trying to request their own item
    if (item.owner.toString() === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot request your own item' });
    }
    
    // Check if already has pending/accepted request
    const existingRequest = await Request.findOne({
      item: itemId,
      requester: req.userId,
      status: { $in: ['pending', 'accepted'] },
    });
    
    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending or accepted request for this item' });
    }
    
    // Create request
    const request = new Request({
      item: itemId,
      requester: req.userId,
      owner: item.owner,
      message: message || '',
      status: 'pending',
    });
    
    await request.save();
    await request.populate('requester', 'name email phone profilePicture');
    await request.populate('item', 'name');
    
    // Create notification for item owner
    await Notification.create({
      recipient: item.owner,
      sender: req.userId,
      type: 'new_request',
      relatedItem: itemId,
      relatedRequest: request._id,
      title: 'New Request',
      message: `Someone requested your item "${item.name}"`,
      actionUrl: `/my-listings`,
    });
    
    // Update item status to reserved if not already
    if (item.status === 'available') {
      item.requestedBy = req.userId;
      item.requestMessage = message || '';
      item.requestDate = Date.now();
      await item.save();
    }
    
    res.status(201).json({
      success: true,
      request,
      message: 'Request created successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all requests for user
exports.getUserRequests = async (req, res) => {
  try {
    const { status, type = 'received' } = req.query;
    
    // type: 'received' = requests on user's items, 'sent' = user's requests
    let filter = {};
    
    if (type === 'received') {
      filter.owner = req.userId;
    } else {
      filter.requester = req.userId;
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const requests = await Request.find(filter)
      .populate('item', 'name category photos')
      .populate('requester', 'name email phone profilePicture')
      .populate('owner', 'name email')
      .sort({ requestDate: -1 });
    
    res.json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single request
exports.getRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('item', 'name description category photos')
      .populate('requester', 'name email phone profilePicture')
      .populate('owner', 'name email phone');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Accept request
exports.acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Check ownership
    if (request.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    request.status = 'accepted';
    request.respondedDate = Date.now();
    await request.save();
    
    // Update item status
    const item = await Item.findById(request.item);
    if (item) {
      item.status = 'reserved';
      item.requestedBy = request.requester;
      await item.save();
    }
    
    // Create notification for requester
    await Notification.create({
      recipient: request.requester,
      sender: req.userId,
      type: 'request_accepted',
      relatedRequest: request._id,
      relatedItem: request.item,
      title: 'Request Accepted',
      message: 'Your request has been accepted!',
      actionUrl: `/my-requests`,
    });
    
    res.json({
      success: true,
      request,
      message: 'Request accepted',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject request
exports.rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Check ownership
    if (request.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    request.status = 'rejected';
    request.respondedDate = Date.now();
    await request.save();
    
    // Update item status back to available
    const item = await Item.findById(request.item);
    if (item) {
      item.status = 'available';
      item.requestedBy = null;
      item.requestMessage = '';
      await item.save();
    }
    
    // Create notification for requester
    await Notification.create({
      recipient: request.requester,
      sender: req.userId,
      type: 'request_rejected',
      relatedRequest: request._id,
      relatedItem: request.item,
      title: 'Request Rejected',
      message: 'Your request has been rejected',
      actionUrl: `/my-requests`,
    });
    
    res.json({
      success: true,
      request,
      message: 'Request rejected',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel request (by requester)
exports.cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Check if requester
    if (request.requester.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Can only cancel pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending requests' });
    }
    
    request.status = 'cancelled';
    await request.save();
    
    // Update item if necessary
    const item = await Item.findById(request.item);
    if (item && item.requestedBy.toString() === req.userId.toString()) {
      item.status = 'available';
      item.requestedBy = null;
      item.requestMessage = '';
      await item.save();
    }
    
    res.json({
      success: true,
      request,
      message: 'Request cancelled',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark request as completed
exports.completeRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Check if requester
    if (request.requester.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Can only complete accepted requests
    if (request.status !== 'accepted') {
      return res.status(400).json({ error: 'Can only complete accepted requests' });
    }
    
    request.status = 'completed';
    request.completedDate = Date.now();
    await request.save();
    
    // Update item
    const item = await Item.findById(request.item);
    if (item) {
      item.status = 'completed';
      item.completedDate = Date.now();
      await item.save();
    }
    
    // Create notification for owner
    await Notification.create({
      recipient: request.owner,
      sender: request.requester,
      type: 'transaction_completed',
      relatedRequest: request._id,
      relatedItem: request.item,
      title: 'Transaction Completed',
      message: 'A transaction has been completed!',
      actionUrl: `/my-listings`,
    });
    
    res.json({
      success: true,
      request,
      message: 'Request completed',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add note to request
exports.addNote = async (req, res) => {
  try {
    const { message } = req.body;
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Check if user is part of transaction
    if (
      request.owner.toString() !== req.userId.toString() &&
      request.requester.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    request.notes.push({
      sender: req.userId,
      message: message.trim(),
      date: Date.now(),
    });
    
    await request.save();
    
    res.json({
      success: true,
      request,
      message: 'Note added',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
