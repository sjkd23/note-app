/**
 * noteController.js
 * Logic for creating, listing, updating, deleting notes for an authenticated user.
 */
const Note = require('../models/Note');
const Category = require('../models/Category');
const mongoose = require('mongoose');

/**
 * Helper function: Verify that an array of category IDs all belong to this user.
 * If any category is not found or belongs to another user, we return false.
 */
async function validateCategoriesOwnership(categoryIds, userId) {
    // If no category IDs provided, skip
    if (!categoryIds || !Array.isArray(categoryIds)) return true;

    // Find categories for these IDs that match the user
    const found = await Category.find({
        _id: { $in: categoryIds },
        userId: userId
    });

    // If we didn't find exactly as many as were passed in, there's a mismatch
    return found.length === categoryIds.length;
}

/**
 * Create a new note (title, content) for the logged-in user.
 * Adds optional category references if they exist and are owned by the user.
 */
const createNote = async (req, res) => {
    try {
        const { title, content, categories } = req.body;

        // Basic validations: ensure title & content are not empty
        if (!title || !title.trim()) {
            return res.status(400).json({ error: "Note title cannot be empty" });
        }
        if (!content || !content.trim()) {
            return res.status(400).json({ error: "Note content cannot be empty" });
        }

        // If categories were passed, ensure they belong to the user
        if (categories && categories.length > 0) {
            const valid = await validateCategoriesOwnership(categories, req.user.id);
            if (!valid) {
                return res.status(403).json({
                    error: "One or more categories do not belong to this user"
                });
            }
        }

        // Create the note
        const note = await Note.create({
            title: title.trim(),
            content: content.trim(),
            userId: req.user.id,
            categories: categories || []
        });

        return res.status(201).json({
            message: 'Note created successfully',
            note
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Get all notes for the authenticated user
 */
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.id });
        return res.status(200).json({ notes });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Get a note by title (via query param ?title=...)
 */
const getNoteByTitle = async (req, res) => {
    try {
        const titleParam = req.query.title;
        if (!titleParam) {
            return res.status(400).json({ message: "Title is required" });
        }
        const note = await Note.findOne({
            title: titleParam,
            userId: req.user.id
        });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        return res.status(200).json({ note });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Get a note by _id
 */
const getNoteById = async (req, res) => {
    try {
        // Validate param as a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid note ID" });
        }

        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        return res.status(200).json({ note });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Update a note by _id (title, content, categories).
 * Also ensures user owns the note and any categories.
 */
const updateNote = async (req, res) => {
    try {
        const noteId = req.params.id;

        // Check if note belongs to user
        const note = await Note.findOne({ _id: noteId, userId: req.user.id });
        if (!note) {
            return res.status(403).json({ message: "You do not own this note" });
        }

        // Extract possible updates
        const { title, content, categories } = req.body;

        // Validate if title or content are being updated to not be empty
        if (title !== undefined && (!title.trim())) {
            return res.status(400).json({ error: "Note title cannot be empty" });
        }
        if (content !== undefined && (!content.trim())) {
            return res.status(400).json({ error: "Note content cannot be empty" });
        }

        // If categories are passed in, ensure they belong to the user
        if (categories && categories.length > 0) {
            const valid = await validateCategoriesOwnership(categories, req.user.id);
            if (!valid) {
                return res.status(403).json({
                    error: "One or more categories do not belong to this user"
                });
            }
        }

        // Apply updates
        if (title !== undefined) {
            note.title = title.trim();
        }
        if (content !== undefined) {
            note.content = content.trim();
        }
        if (categories !== undefined) {
            note.categories = categories;
        }

        const updatedNote = await note.save();

        return res.status(200).json({
            message: "Note updated successfully",
            updatedNote
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Delete a note by _id (must belong to user)
 */
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        return res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createNote,
    getNotes,
    getNoteByTitle,
    getNoteById,
    updateNote,
    deleteNote
};
