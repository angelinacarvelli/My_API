const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Recettes du Monde',
      version: '1.0.0',
      description: 'API de gestion de recettes de cuisine avec pagination, cache Redis, JWT et OAuth2.',
    },
    servers: [
      {
        url: 'http://recettedumonde.webhop.me:3000',
        description: 'Serveur de Production (AWS EC2)',
      },
      {
        url: 'http://localhost:3000',
        description: 'Serveur Local de Développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/index.js'],
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger disponible sur /api-docs');
}

module.exports = setupSwagger;