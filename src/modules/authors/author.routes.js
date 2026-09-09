const express = require('express');
const controller = require('./author.controller');
const validate = require('../../middlewares/validate');
const { authenticate, requirePermission } = require('../../middlewares/authMiddleware');
const { createAuthorSchema, updateAuthorSchema } = require('./author.validation')

const router = express.Router();

/**
 * @openapi
 * /authors:
 *   post:
 *     tags: [Authors]
 *     summary: Create an author
 *     description: Create a new author in the library catalog.
 *     operationId: createAuthor
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: George Orwell
 *               bio:
 *                 type: string
 *                 maxLength: 2000
 *                 nullable: true
 *                 example: British novelist and essayist.
 *     responses:
 *       201:
 *         description: Author created successfully
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permission
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, requirePermission('authors:create'), validate(createAuthorSchema), controller.createAuthor);

/**
 * @openapi
 * /authors:
 *   get:
 *     tags: [Authors]
 *     summary: List authors
 *     description: Return the list of authors.
 *     operationId: listAuthors
 *     responses:
 *       200:
 *         description: Authors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   bio:
 *                     type: string
 *                     nullable: true
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/', controller.listAuthors);

/**
 * @openapi
 * /authors/{id}:
 *   get:
 *     tags: [Authors]
 *     summary: Get author by id
 *     description: Return one author by its UUID.
 *     operationId: getAuthor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author unique identifier.
 *     responses:
 *       200:
 *         description: Author found
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', controller.getAuthor);

/**
 * @openapi
 * /authors/{id}:
 *   patch:
 *     tags: [Authors]
 *     summary: Update an author
 *     description: Update the fields of an existing author.
 *     operationId: updateAuthor
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
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               bio:
 *                 type: string
 *                 maxLength: 2000
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Author updated successfully
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permission
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', authenticate, requirePermission('authors:update'), validate(updateAuthorSchema), controller.updateAuthor);

/**
 * @openapi
 * /authors/{id}:
 *   delete:
 *     tags: [Authors]
 *     summary: Delete an author
 *     description: Delete an author from the library catalog.
 *     operationId: deleteAuthor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author unique identifier.
 *     responses:
 *       204:
 *         description: Author deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permission
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, requirePermission('authors:delete'), controller.deleteAuthor);

module.exports = router;
