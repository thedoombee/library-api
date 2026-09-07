const prisma = require('../../src/config/database');

async function resetTestDatabase() {
    
  await prisma.loan.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();
}

async function seedTestData() {
  const bcrypt = require('bcrypt');
  const jwt = require('jsonwebtoken');
  const env = require('../../src/config/env');

  const passwordHash = await bcrypt.hash('password123', 10);
  const member = await prisma.user.create({
    data: { email: 'member@test.com', passwordHash, name: 'Test Member', role: 'MEMBER' },
  });
  const librarian = await prisma.user.create({
    data: { email: 'librarian@test.com', passwordHash, name: 'Test Librarian', role: 'LIBRARIAN' },
  });
  const author = await prisma.author.create({ data: { name: 'Test Author' } });
  const book = await prisma.book.create({
    data: {
      title: 'Test Book', isbn: '111-1111111111', publishedYear: 2000,
      totalCopies: 1, availableCopies: 1,
      authors: { create: [{ authorId: author.id }] },
    },
  });

  const memberToken = jwt.sign({ sub: member.id, role: member.role }, env.JWT_SECRET);
  const librarianToken = jwt.sign({ sub: librarian.id, role: librarian.role }, env.JWT_SECRET);

  return { member, librarian, book, memberToken, librarianToken };
}

module.exports = { resetTestDatabase, seedTestData };