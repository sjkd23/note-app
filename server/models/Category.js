/**
 * Category.js
 * Mongoose model for a Category (tag). Has a name + userId. Unique per user.
 */
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxLength: 24
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

// Make sure name + userId is unique together
CategorySchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
