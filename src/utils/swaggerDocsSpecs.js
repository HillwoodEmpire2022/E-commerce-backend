import swaggerJsDoc from 'swagger-jsdoc';

const LIVE_SERVER = process.env.BACKEND_LIVE_URL;
const LOCALHOST_URL = `${process.env.BACKEND_LOCALHOST_URL}/api/v1`;

const stagingUrl = process.env.STAGING_BACKEND_URL;
const productionUrl = process.env.PRODUCTION_BACKEND_URL;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FeliExpress',
      version: '1.0.0',
      description:
        'This is a an express API for the FeliExpress.',
    },
    servers: [
      {
        url: LOCALHOST_URL,
        description: 'Localhost Server',
      },
      {
        url: `${stagingUrl}/api/v1`,
        description: 'Staging Live Server',
      },
      {
        url: `${productionUrl}/api/v1`,
        description: 'Production Live Server',
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

export const specs = swaggerJsDoc(options);
