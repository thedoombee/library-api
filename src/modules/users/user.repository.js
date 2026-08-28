const prisma = require('../../config/database');

async function create({ email, passwordHash, name, role = 'MEMBER' }) {
  return prisma.user.create({
    data: { email, passwordHash, name, role },
    select: { id: true, email: true, name: true, role: true, createdAt: true }, 
  });
}

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
}

module.exports = { create, findByEmail, findById };