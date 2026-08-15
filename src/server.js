const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.PORT, () => {
  console.log(` Server running on http://localhost:${env.PORT}`);
});


process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => process.exit(0));
});