const prisma = require('../../config/database');

async function create({ userId, tokenHash, expiresAt, createdByIp }) {
  return prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt, createdByIp } });
}

async function findByTokenHash(tokenHash) {
  return prisma.refreshToken.findUnique({ where: { tokenHash } });
}

async function revoke(id, { replacedByToken } = {}) {
  return prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date(), ...(replacedByToken ? { replacedByToken } : {}) },
  });
}

async function revokeAllForUser(userId) {
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

module.exports = { create, findByTokenHash, revoke, revokeAllForUser };