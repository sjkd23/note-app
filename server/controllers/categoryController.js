/**
 * categoryController.js
 * Logic for creating, listing, updating, deleting categories (tags).
 */
const Category = require('../models/Category');
const Note = require('../models/Note');

/**
 * Creates a category for the authenticated user, if not already existing.
 * Now checks if name is not empty.
 */
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Basic validation: name must exist and be non-empty
        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Category name cannot be empty" });
        }

        // Check if user already has this category
        let category = await Category.findOne({ name: name.trim(), userId: req.user.id });
        if (category) {
            return res.status(200).json({
                message: "Category already exists. Returning existing category.",
                category
            });
        }

        // Create new category
        category = await Category.create({ name: name.trim(), userId: req.user.id });
        return res.status(201).json({
            message: "Category created successfully",
            category
        });

    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Returns all categories belonging to the authenticated user, with note counts.
 */
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ userId: req.user.id });

        // For each category, count how many notes reference it
        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const noteCount = await Note.countDocuments({ categories: category._id });
                return { ...category.toObject(), noteCount };
            })
        );

        return res.status(200).json({ categories: categoriesWithCounts });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Finds a category by its ID (must match user).
 */
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.status(200).json({ category });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Finds a category by name (must match user).
 */
const getCategoryByName = async (req, res) => {
    try {
        const category = await Category.findOne({
            name: req.params.name,
            userId: req.user.id
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.status(200).json({ category });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Updates a category's name by ID (must belong to user).
 */
const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Basic validation
        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Category name cannot be empty" });
        }

        // Find the category for this user
        const existingCat = await Category.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!existingCat) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Actually update it
        existingCat.name = name.trim();
        await existingCat.save();

        return res.status(200).json({
            message: 'Category updated successfully',
            category: existingCat
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Deletes a category (and removes it from any notes referencing it).
 * Must belong to the user.
 */
const deleteCategory = async (req, res) => {
    try {
        // Delete the category for this user
        const category = await Category.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Remove reference from notes
        await Note.updateMany(
            { categories: category._id },
            { $pull: { categories: category._id } }
        );

        return res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    getCategoryByName,
    updateCategory,
    deleteCategory
};
