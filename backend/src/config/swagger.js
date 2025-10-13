// src/config/swagger.js
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SGTU API',
      version: '1.0.0',
      description: 'API do SGTU — documentação automática gerada via swagger-jsdoc',
    },
    servers: [
      { url: process.env.API_BASE_URL || 'http://localhost:4000/api' }
    ],
  },
  apis: [
    './src/routes/*.js',
    './src/modules/**/*.routes.js',
    './src/modules/**/*.controller.js'
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
