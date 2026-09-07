const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const databaseUrl = env.NODE_ENV === 'test' ? process.env.DATABASE_URL_TEST : env.DATABASE_URL;

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

module.exports = prisma;