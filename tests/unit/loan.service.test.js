jest.mock('../../src/modules/loans/loan.repository');
jest.mock('../../src/modules/books/book.repository');

const loanService = require('../../src/modules/loans/loan.service');
const loanRepository = require('../../src/modules/loans/loan.repository');
const bookRepository = require('../../src/modules/books/book.repository');
const { NotFoundError, ConflictError, ForbiddenError } = require('../../src/errors');

describe('loanService.createLoan', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws NotFoundError if the book does not exist', async () => {
    bookRepository.findById.mockResolvedValue(null);

    await expect(loanService.createLoan({ userId: 'u1', bookId: 'b1' }))
      .rejects.toThrow(NotFoundError);
  });

  it('throws ConflictError if user already has the max active loans', async () => {
    bookRepository.findById.mockResolvedValue({ id: 'b1' });
    loanRepository.ActiveUserLoans.mockResolvedValue(3);

    await expect(loanService.createLoan({ userId: 'u1', bookId: 'b1' }))
      .rejects.toThrow(ConflictError);
  });

  it('propagates the ConflictError thrown by the repository when no copies are available', async () => {
    bookRepository.findById.mockResolvedValue({ id: 'b1' });
    loanRepository.ActiveUserLoans.mockResolvedValue(0);
    loanRepository.createLoan.mockRejectedValue(new ConflictError('No available copies for this book'));

    await expect(loanService.createLoan({ userId: 'u1', bookId: 'b1' }))
      .rejects.toThrow(ConflictError);
  });

  it('creates a loan with a due date 14 days from now when all conditions are met', async () => {
    bookRepository.findById.mockResolvedValue({ id: 'b1' });
    loanRepository.ActiveUserLoans.mockResolvedValue(1);
    loanRepository.createLoan.mockResolvedValue({ id: 'loan1' });

    const result = await loanService.createLoan({ userId: 'u1', bookId: 'b1' });

    expect(result).toEqual({ id: 'loan1' });
    const callArg = loanRepository.createLoan.mock.calls[0][0];
    const daysDiff = Math.round((callArg.dueAt - new Date()) / (1000 * 60 * 60 * 24));
    expect(daysDiff).toBe(14);
  });
});

describe('loanService.returnLoan', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws NotFoundError if the loan does not exist', async () => {
    loanRepository.findById.mockResolvedValue(null);
    await expect(loanService.returnLoan({ loanId: 'l1', requestingUser: { id: 'u1', role: 'MEMBER' } }))
      .rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError if the requesting user is neither owner nor librarian', async () => {
    loanRepository.findById.mockResolvedValue({ id: 'l1', userId: 'u1', returnedAt: null });
    await expect(loanService.returnLoan({ loanId: 'l1', requestingUser: { id: 'u2', role: 'MEMBER' } }))
      .rejects.toThrow(ForbiddenError);
  });

  it('allows a librarian to return a loan that is not theirs', async () => {
    loanRepository.findById.mockResolvedValue({ id: 'l1', userId: 'u1', returnedAt: null });
    loanRepository.returnLoan.mockResolvedValue({ id: 'l1', status: 'RETURNED' });

    const result = await loanService.returnLoan({ loanId: 'l1', requestingUser: { id: 'librarian1', role: 'LIBRARIAN' } });
    expect(result.status).toBe('RETURNED');
  });

  it('throws ConflictError if the loan was already returned', async () => {
    loanRepository.findById.mockResolvedValue({ id: 'l1', userId: 'u1', returnedAt: new Date() });
    await expect(loanService.returnLoan({ loanId: 'l1', requestingUser: { id: 'u1', role: 'MEMBER' } }))
      .rejects.toThrow(ConflictError);
  });
});