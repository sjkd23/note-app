/**
 * db.js
 * Mongoose connection logic. Switches between TEST_MONGO_URI and MONGO_URI based on NODE_ENV.
 */
const mongoose = require('mongoose');
require('dotenv').config();

const DB_URI = process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGO_URI
    : process.env.MONGO_URI;

/**
 * Connects to MongoDB using the proper URI.
 */
const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // If not in test, exit so dev servers don't keep going without DB
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
