const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoryByName,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Secure all category routes
router.use(isAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management endpoints
 */

/**
 * @swagger
 * /api/notes/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Category data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 *       200:
 *         description: Category already exists
 *       400:
 *         description: Error creating category
 */
router.post('/', createCategory);

/**
 * @swagger
 * /api/notes/categories:
 *   get:
 *     summary: Get all categories for the authenticated user
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of categories (with noteCount)
 *       500:
 *         description: Internal Server Error
 */
router.get('/', getCategories);

/**
 * @swagger
 * /api/notes/categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: The requested category
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', getCategoryById);

/**
 * @swagger
 * /api/notes/categories/name/{name}:
 *   get:
 *     summary: Get a category by name
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Category name
 *     responses:
 *       200:
 *         description: The requested category
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/name/:name', getCategoryByName);

/**
 * @swagger
 * /api/notes/categories/{id}:
 *   put:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     requestBody:
 *       description: The new category name
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', updateCategory);

/**
 * @swagger
 * /api/notes/categories/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', deleteCategory);

module.exports = router;
