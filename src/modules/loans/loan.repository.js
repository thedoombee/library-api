const prisma = require('../../config/database');
const { ConflictError } = require('../../errors');
//This make loan and decrement 
// To make loand an decrement , it is a  transaction to assure the atomicity and even thout it is a transaction it need to be a same function not two differents ones so there would be not way to make an other call or operation beetwin the ckeck and th decrement(like the two operations) , and also the row-level exclusive lock on every UPDATE on  also help
async function createLoan({ userId, bookId, dueAt }) {
  return prisma.$transaction(async (tx) => {
   
    const updateResult = await tx.book.updateMany({
      where: { id: bookId, availableCopies: { gt: 0 } },
      data: { availableCopies: { decrement: 1 } },
    });

    if (updateResult.count === 0) {
      throw new ConflictError('No available copies for this book');
    }

    return tx.loan.create({
      data: { userId, bookId, dueAt, status: 'ACTIVE' },
    });
  });
}


async function findById(id) {
  return prisma.loan.findUnique({ where: { id } });
}

async function ActiveUserLoans(userId) {
  return prisma.loan.count({ where: { userId, status: 'ACTIVE' } });
}

async function AllUserLoans(userId, { cursor, limit = 20 }) {
  const loans = await prisma.loan.findMany({
    where: { userId },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { borrowedAt: 'desc' },
    include: { book: true },
  });
  const hasNextPage = loans.length > limit;
  const items = hasNextPage ? loans.slice(0, -1) : loans;
  return { items, nextCursor: hasNextPage ? items[items.length - 1].id : null };
}

async function AllLoans({ cursor, limit = 20 }) {
  const loans = await prisma.loan.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { borrowedAt: 'desc' },
    include: { book: true, user: { select: { id: true, name: true, email: true } } },
  });
  const hasNextPage = loans.length > limit;
  const items = hasNextPage ? loans.slice(0, -1) : loans;
  return { items, nextCursor: hasNextPage ? items[items.length - 1].id : null };
}


async function returnLoan(loanId) {
  return prisma.$transaction(async (tx) => {
    const loan = await tx.loan.update({
      where: { id: loanId },
      data: { returnedAt: new Date(), status: 'RETURNED' },
    });
    await tx.book.update({
      where: { id: loan.bookId },
      data: { availableCopies: { increment: 1 } },
    });
    return loan;
  });
}

module.exports = {
  findById,
  ActiveUserLoans,
  AllUserLoans,
  AllLoans,
  createLoan,
  returnLoan,
};
