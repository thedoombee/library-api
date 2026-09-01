const loanService = require('./loan.service');

async function createLoan(req, res, next) {
  try {
    const loan = await loanService.createLoan({ userId: req.user.id, bookId: req.body.bookId });
    res.status(201).json(loan);
  } catch (err) { next(err); }
}

async function returnLoan(req, res, next) {
  try {
    const loan = await loanService.returnLoan({ loanId: req.params.id, requestingUser: req.user });
    res.status(200).json(loan);
  } catch (err) { next(err); }
}

async function listLoans(req, res, next) {
  try {
    const result = await loanService.listLoans(req.user, req.query);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

module.exports = { createLoan, returnLoan, listLoans };