// Report Model (for moderation)
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['listing', 'user', 'message'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Can reference Item or User
    },
    targetName: {
      type: String,
      required: true,
    },
    
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'inappropriate_content',
        'spam',
        'fraud',
        'harassment',
        'copyright_violation',
        'misleading_information',
        'other',
      ],
    },
    description: {
      type: String,
      default: '',
    },
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    
    // Resolution
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      enum: ['none', 'warning', 'content_removed', 'account_suspended'],
      default: 'none',
    },
    
    // Timestamps
    reportedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for queries
reportSchema.index({ status: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ reportedAt: -1 });
reportSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('Report', reportSchema);
