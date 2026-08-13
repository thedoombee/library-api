// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config(); 

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


async function main() {
  // Nettoyage (ordre important : respecter les contraintes de clé étrangère)
  await prisma.loan.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const librarian = await prisma.user.create({
    data: { email: 'librarian@library.com', passwordHash, name: 'Alice Librarian', role: 'LIBRARIAN' },
  });

  const member = await prisma.user.create({
    data: { email: 'member@library.com', passwordHash, name: 'Bob Member', role: 'MEMBER' },
  });

  const author = await prisma.author.create({
    data: { name: 'George Orwell', bio: 'English novelist' },
  });

  const book = await prisma.book.create({
    data: {
      title: '1984',
      isbn: '978-0-452-28423-4',
      publishedYear: 1949,
      totalCopies: 3,
      availableCopies: 3,
      authors: { create: [{ authorId: author.id }] },
    },
  });

  console.log(' Seed completed:', { librarian: librarian.email, member: member.email, book: book.title });
}

main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());