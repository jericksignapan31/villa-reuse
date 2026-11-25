// Authentication Controller
const User = require('../models/User');

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    console.log('📝 Registration attempt:', { name, email, phone, address }); // Debug log
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create new user
    user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      address: address || '',
      emailVerified: true, // Auto-verify for demo
    });
    
    console.log('💾 Saving user to database...'); // Debug log
    await user.save();
    console.log('✅ User saved successfully:', user._id); // Debug log
    
    // Generate token
    const token = user.generateAuthToken();
    
    res.status(201).json({
      success: true,
      token,
      user: user.getPublicProfile(),
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('❌ Registration error:', error); // Debug log
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({ error: `Account is ${user.status}. Please contact support.` });
    }
    
    // Generate token (adjust expiration based on rememberMe)
    const jwt = require('jsonwebtoken');
    const expiresIn = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn }
    );
    
    res.json({
      success: true,
      token,
      user: user.getPublicProfile(),
      expiresIn,
      message: 'Login successful',
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, bio, profilePicture } = req.body;
    const user = req.user;
    
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    
    user.updatedAt = Date.now();
    await user.save();
    
    res.json({
      success: true,
      user: user.getPublicProfile(),
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;
    
    // Validate
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const { requestNotifications, messageNotifications, communityUpdates } = req.body;
    const user = req.user;
    
    if (requestNotifications !== undefined) user.requestNotifications = requestNotifications;
    if (messageNotifications !== undefined) user.messageNotifications = messageNotifications;
    if (communityUpdates !== undefined) user.communityUpdates = communityUpdates;
    
    user.updatedAt = Date.now();
    await user.save();
    
    res.json({
      success: true,
      preferences: {
        requestNotifications: user.requestNotifications,
        messageNotifications: user.messageNotifications,
        communityUpdates: user.communityUpdates,
      },
      message: 'Preferences updated',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID (public profile)
exports.getUserPublic = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
