const express = require('express');
const controller = require('./book.controller');
const validate = require('../../middlewares/validate');
const { authenticate, requirePermission } = require('../../middlewares/authMiddleware');
const { createBookSchema, listBooksSchema, updateBookSchema } = require('./book.validation');

const router = express.Router();

/**
 * @openapi
 * /books:
 *   post:
 *     tags: [Books]
 *     summary: Create a book
 *     description: Create a new book and associate it with one or more authors.
 *     operationId: createBook
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required:
 *               - title
 *               - isbn
 *               - publishedYear
 *               - totalCopies
 *               - authorIds
 *             properties:
 *               title:
 *                 type: string
 *                 example: 1984
 *               isbn:
 *                 type: string
 *                 example: 9780451524935
 *               publishedYear:
 *                 type: integer
 *                 example: 1949
 *               totalCopies:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 example: 5
 *               authorIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permission
 *       404:
 *         description: One or more authors were not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, requirePermission('books:create'), validate(createBookSchema), controller.createBook);

/**
 * @openapi
 * /books:
 *   get:
 *     tags: [Books]
 *     summary: List books
 *     description: Search and paginate books.
 *     operationId: listBooks
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Free-text search term.
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Cursor for pagination.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of books returned.
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', validate(listBooksSchema), controller.listBooks);

/**
 * @openapi
 * /books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Get a book by id
 *     description: Return information about one book by its UUID.
 *     operationId: getBook
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Book unique identifier.
 *     responses:
 *       200:
 *         description: Book found
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', controller.getBook);

/**
 * @openapi
 * /books/{id}:
 *   patch:
 *     tags: [Books]
 *     summary: Update a book
 *     description: Update at least one field of an existing book.
 *     operationId: updateBook
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             properties:
 *               title:
 *                 type: string
 *               isbn:
 *                 type: string
 *               publishedYear:
 *                 type: integer
 *               totalCopies:
 *                 type: integer
 *                 minimum: 1
 *               authorIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permission
 *       404:
 *         description: Book or author not found
 *       409:
 *         description: Total copies cannot be lower than borrowed copies
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', authenticate, requirePermission('books:update'), validate(updateBookSchema), controller.updateBook);

/**
 * @openapi
 * /books/{id}:
 *   delete:
 *     tags: [Books]
 *     summary: Delete a book
 *     description: Delete a book from the catalog.
 *     operationId: deleteBook
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Book unique identifier.
 *     responses:
 *       204:
 *         description: Book deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permission
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, requirePermission('books:delete'), controller.deleteBook);

module.exports = router;
