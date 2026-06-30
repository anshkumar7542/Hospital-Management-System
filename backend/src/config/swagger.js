const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const env = require('./env');

const completeSpecPath = path.resolve(process.cwd(), 'swagger/complete.yaml');
const completeSpec = yaml.parse(fs.readFileSync(completeSpecPath, 'utf8'));

const baseSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Hospital Management System API',
      version: '1.0.0',
      description: 'Production API documentation for HMS backend'
    },
    servers: [{ url: env.apiPrefix }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: []
});

const swaggerSpec = {
  ...baseSpec,
  tags: completeSpec.tags,
  paths: completeSpec.paths,
  components: {
    ...baseSpec.components,
    ...completeSpec.components,
    securitySchemes: {
      ...baseSpec.components.securitySchemes,
      ...completeSpec.components?.securitySchemes
    }
  }
};

module.exports = { swaggerUi, swaggerSpec };
