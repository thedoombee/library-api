module.exports = {
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  coveragePathIgnorePatterns: ['/node_modules/', '/prisma/'],
  testTimeout: 10000, 
};