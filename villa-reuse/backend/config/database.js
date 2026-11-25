// Database configuration
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // For development, use local MongoDB
    // For production, use MongoDB Atlas URL from .env
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/villa-reuse';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
