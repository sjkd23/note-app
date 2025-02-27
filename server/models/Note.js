/**
 * Note.js
 * Mongoose model for a Note. Contains userId, title, content, categories.
 * Also auto-enforces unique note titles by appending (1), (2), etc. as needed.
 */
const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }]
});

/**
 * Helper function that ensures the note title is unique for this user.
 * If the same title is found, it appends (1), (2), etc.
 */
async function findUniqueTitle(model, userId, proposedTitle, excludeId) {
  // Strip any trailing "(n)" from the baseTitle
  const baseTitle = proposedTitle.replace(/\(\d+\)$/, "").trim();
  let newTitle = baseTitle;
  let counter = 1;

  // Check if there's an existing note with same title
  let existingNote = await model.findOne({
    title: newTitle,
    userId: userId,
    _id: { $ne: excludeId }
  });

  // While we find a clash, keep incrementing
  while (existingNote) {
    newTitle = `${baseTitle} (${counter})`;
    existingNote = await model.findOne({
      title: newTitle,
      userId: userId,
      _id: { $ne: excludeId }
    });
    counter++;
  }
  return newTitle;
}

// Pre-save hook: only runs if 'title' was modified
NoteSchema.pre("save", async function (next) {
  if (!this.isModified("title")) return next();
  this.title = await findUniqueTitle(this.constructor, this.userId, this.title, this._id);
  next();
});

// Pre-query hook: runs on findOneAndUpdate / findByIdAndUpdate if 'title' is updated
NoteSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (!update || !update.title) return next();

  // We need the existing doc to figure out userId + _id
  const noteBeingUpdated = await this.model.findOne(this.getQuery());
  if (!noteBeingUpdated) return next();

  const userId       = noteBeingUpdated.userId;
  const excludeId    = noteBeingUpdated._id;
  const proposedTitle = update.title;

  const newTitle = await findUniqueTitle(this.model, userId, proposedTitle, excludeId);
  update.title   = newTitle;

  next();
});

module.exports = mongoose.model("Note", NoteSchema);
