const prisma = require('../../config/database');

async function create({ email, passwordHash, name }) {
  const defaultRole = await prisma.role.findFirst({
    where: { isDefault: true },
    select: { id: true },
  });

  if (!defaultRole) {
    throw new Error('No default role is configured');
  }

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      userRoles: { create: { roleId: defaultRole.id } },
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      userRoles: { select: { role: { select: { name: true } } } },
    },
  });
}

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      userRoles: { select: 
        { role: { select: { name: true } } } },
    },
  });
}

module.exports = { create, findByEmail, findById };
