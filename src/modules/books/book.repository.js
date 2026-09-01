const prisma = require('../../config/database');

async function create({ title, isbn, publishedYear, totalCopies, authorIds }) {
  return prisma.book.create({
    data: {
      title,
      isbn,
      publishedYear,
      totalCopies,
      availableCopies: totalCopies,
      authors: {
        create: authorIds.map((authorId) => ({ authorId })), 
      },
    },
    include: { authors: { include: { author: true } } },
  });
}

async function findById(id) {
  return prisma.book.findUnique({
    where: { id },
    include: { authors: { include: { author: true } } },
  });
}

async function findMany({ search, cursor, limit = 20  }) {
  const books = await prisma.book.findMany({
    where: search ? { title: { contains: search, mode: 'insensitive' } } : {},
    take: Number(limit) + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { title: 'asc' },
    include: { authors: { include: { author: true } } },
  });

  const hasNextPage = books.length > limit;
  const items = hasNextPage ? books.slice(0, -1) : books;

  return {
    items,
    nextCursor: hasNextPage ? items[items.length - 1].id : null,
  };
}

async function remove(id) {
    await prisma.book.delete({
        where: {id} ,
    })
}

module.exports = { create, findById, findMany, remove};
