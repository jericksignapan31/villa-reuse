// Item/Listing Model
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Furniture', 'Electronics', 'Clothing', 'Books', 'Toys', 'Other'],
    },
    condition: {
      type: String,
      enum: ['Like New', 'Good', 'Fair', 'Poor'],
      default: 'Good',
    },
    type: {
      type: String,
      enum: ['Donation', 'Exchange'],
      default: 'Donation',
    },
    location: {
      type: String,
      required: true,
    },
    photos: [
      {
        type: String, // URL or base64
        default: null,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'completed', 'flagged'],
      default: 'available',
    },
    
    // Request/Transaction tracking
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    requestMessage: {
      type: String,
      default: '',
    },
    requestDate: {
      type: Date,
      default: null,
    },
    
    // Completion tracking
    completedDate: {
      type: Date,
      default: null,
    },
    
    // Reports and flags
    reports: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reportCount: {
      type: Number,
      default: 0,
    },
    
    // Favorites
    favoritedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    favoriteCount: {
      type: Number,
      default: 0,
    },
    
    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for better queries
itemSchema.index({ owner: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ type: 1 });
itemSchema.index({ status: 1 });
itemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Item', itemSchema);
