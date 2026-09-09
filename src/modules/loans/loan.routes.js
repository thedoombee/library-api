const express = require('express');
const controller = require('./loan.controller');
const { authenticate, requirePermission } = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validate');
const { createLoanSchema, listLoansSchema } = require('./loan.validation');

const router = express.Router();
/**
 * @openapi
 * /loans:
 *   post:
 *     tags: [Loans]
 *     summary: Create a new loan
 *     description: Create a new loan for the authenticated user.
 *     operationId: createLoan
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
 *               - bookId
 *             properties:
 *               bookId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the book to borrow
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       201:
 *         description: Loan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 bookId:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *                   enum: [active, returned]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permission
 *       404:
 *         description: Book not found
 *       409:
 *         description: No copies available or maximum active loans reached
 *       500:
 *         description: Internal server error
 */
/**
 * @openapi
 * /loans:
 *   get:
 *     tags: [Loans]
 *     summary: List loans
 *     description: List the loans of the authenticated user or all loans when the user has the right permission.
 *     operationId: listLoans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Cursor to paginate through the results.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of loans to return.
 *     responses:
 *       200:
 *         description: Loans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       bookId:
 *                         type: string
 *                         format: uuid
 *                       status:
 *                         type: string
 *                         enum: [ACTIVE, RETURNED]
 *                       borrowedAt:
 *                         type: string
 *                         format: date-time
 *                       dueAt:
 *                         type: string
 *                         format: date-time
 *                       returnedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                 nextCursor:
 *                   type: string
 *                   format: uuid
 *                   nullable: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, validate(listLoansSchema), controller.listLoans);

/**
 * @openapi
 * /loans/{id}/return:
 *   patch:
 *     tags: [Loans]
 *     summary: Return a loan
 *     description: Mark a loan as returned and restore one available copy to the associated book.
 *     operationId: returnLoan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Loan unique identifier.
 *     responses:
 *       200:
 *         description: Loan returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 bookId:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *                   enum: [ACTIVE, RETURNED]
 *                 borrowedAt:
 *                   type: string
 *                   format: date-time
 *                 dueAt:
 *                   type: string
 *                   format: date-time
 *                 returnedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: You cannot return a loan that is not yours
 *       404:
 *         description: Loan not found
 *       409:
 *         description: This loan was already returned
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/return', authenticate, controller.returnLoan);

router.post('/', authenticate, requirePermission('loans:create'), validate(createLoanSchema), controller.createLoan);

module.exports = router;
