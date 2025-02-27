const express = require('express');
const router = express.Router();
const {
  createNote,
  getNotes,
  getNoteByTitle,
  getNoteById,
  updateNote,
  deleteNote
} = require('../controllers/noteController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Secure all note routes
router.use(isAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Note management endpoints
 */

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get all notes of the authenticated user
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns an array of notes
 *       500:
 *         description: Internal Server Error
 */
router.get("/", getNotes);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Note data to create
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note created successfully
 *       400:
 *         description: Invalid request
 */
router.post('/', createNote);

/**
 * @swagger
 * /api/notes/title:
 *   get:
 *     summary: Get a note by title (via query param)
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: true
 *         description: Title of the note
 *     responses:
 *       200:
 *         description: Returns the requested note
 *       400:
 *         description: Title is required
 *       404:
 *         description: Note not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/title', getNoteByTitle);

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get a note by ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The note ID
 *     responses:
 *       200:
 *         description: Returns the requested note
 *       400:
 *         description: Invalid note ID
 *       404:
 *         description: Note not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', getNoteById);

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Update a note by ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The note ID
 *     requestBody:
 *       description: The new note data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Category ID
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       404:
 *         description: Note not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', updateNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete a note by ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The note ID
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       404:
 *         description: Note not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', deleteNote);

module.exports = router;
