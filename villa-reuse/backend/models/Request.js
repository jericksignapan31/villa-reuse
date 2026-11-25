// Request/Transaction Model
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    
    // Timestamps for each status
    requestDate: {
      type: Date,
      default: Date.now,
    },
    respondedDate: {
      type: Date,
      default: null,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    
    // Communication
    notes: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        message: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Ratings/Reviews (after completion)
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    review: {
      type: String,
      default: '',
    },
    
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

// Index for queries
requestSchema.index({ requester: 1 });
requestSchema.index({ owner: 1 });
requestSchema.index({ item: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ requestDate: -1 });

module.exports = mongoose.model('Request', requestSchema);
