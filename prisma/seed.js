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
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  const permissions = await Promise.all([
    ['authors:create', 'Create authors'],
    ['authors:update', 'Update authors'],
    ['authors:delete', 'Delete authors'],
    ['books:create', 'Create books'],
    ['books:delete', 'Delete books'],
    ['loans:create', 'Create a loan'],
    ['loans:read:own', 'Read own loans'],
    ['loans:return:own', 'Return own loans'],
    ['loans:read:any', 'Read every loan'],
    ['loans:return:any', 'Return any loan'],
  ].map(([code, description]) => prisma.permission.create({ data: { code, description } })));

  const permissionsByCode = Object.fromEntries(permissions.map((permission) => [permission.code, permission.id]));
  const member = await prisma.role.create({
    data: {
      name: 'MEMBER',
      isDefault: true,
      permissions: {
        create: ['loans:create', 'loans:read:own', 'loans:return:own']
          .map((code) => ({ permissionId: permissionsByCode[code] })),
      },
    },
  });
  const librarian = await prisma.role.create({
    data: {
      name: 'LIBRARIAN',
      permissions: {
        create: permissions.map((permission) => ({ permissionId: permission.id })),
      },
    },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  const librarianUser = await prisma.user.create({
    data: {
      email: 'librarian@library.com', passwordHash, name: 'Alice Librarian',
      userRoles: { create: { roleId: librarian.id } },
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      email: 'member@library.com', passwordHash, name: 'Bob Member',
      userRoles: { create: { roleId: member.id } },
    },
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

  console.log(' Seed completed:', { librarian: librarianUser.email, member: memberUser.email, book: book.title });
}

main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
