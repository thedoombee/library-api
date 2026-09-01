const express = require('express');
const controller = require('./loan.controller');
const { authenticate, requirePermission } = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validate');
const { createLoanSchema, listLoansSchema } = require('./loan.validation');

const router = express.Router();

router.post('/', authenticate, requirePermission('loans:create'), validate(createLoanSchema), controller.createLoan);
router.get('/', authenticate, validate(listLoansSchema), controller.listLoans);
router.patch('/:id/return', authenticate, controller.returnLoan);

module.exports = router;
