const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Library API', version: '1.0.0', description: 'API REST de gestion de bibliothèque' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.js'], 
};

module.exports = swaggerJsdoc(options);