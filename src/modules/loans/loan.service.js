const loanRepository = require('./loan.repository');
const bookRepository = require('../books/book.repository');
const { NotFoundError, ConflictError, ForbiddenError } = require('../../errors');
const { hasPermission } = require('../../middlewares/authMiddleware');

const MAX_ACTIVE_LOANS_PER_USER = 3;
const LOAN_DURATION_DAYS = 14;

async function createLoan({ userId, bookId }) {
  const book = await bookRepository.findById(bookId);
  if (!book) throw new NotFoundError('Book not found');

  const activeLoansCount = await loanRepository.ActiveUserLoans(userId);
  if (activeLoansCount >= MAX_ACTIVE_LOANS_PER_USER) {
    throw new ConflictError(
      `User already has the maximum of ${MAX_ACTIVE_LOANS_PER_USER} active loans`
    );
  }

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + LOAN_DURATION_DAYS);

  return loanRepository.createLoan({ userId, bookId, dueAt });
}

async function returnLoan({ loanId, requestingUser }) {
  const loan = await loanRepository.findById(loanId);
  if (!loan) throw new NotFoundError('Loan not found');

  const canReturnAnyLoan = hasPermission(requestingUser, 'loans:return:any');
  const canReturnOwnLoan = hasPermission(requestingUser, 'loans:return:own');
  const canReturnLoan = canReturnAnyLoan || (loan.userId === requestingUser.id && canReturnOwnLoan);
  if (!canReturnLoan) {
    throw new ForbiddenError('You cannot return a loan that is not yours');
  }

  if (loan.returnedAt) {
    throw new ConflictError('This loan was already returned');
  }

  return loanRepository.returnLoan(loanId);
}

async function listLoans(requestingUser, { cursor, limit }) {
  if (hasPermission(requestingUser, 'loans:read:any')) {
    return loanRepository.AllLoans({ cursor, limit });
  }
  if (!hasPermission(requestingUser, 'loans:read:own')) {
    throw new ForbiddenError('You do not have the required permission');
  }
  return loanRepository.AllUserLoans(requestingUser.id, { cursor, limit });
}

module.exports = { createLoan, returnLoan, listLoans };
