import swaggerJsDoc from 'swagger-jsdoc';

const LIVE_SERVER = process.env.BACKEND_LIVE_URL;
const LOCALHOST_URL = `${process.env.BACKEND_LOCALHOST_URL}/api/v1`;

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
        url: LIVE_SERVER,
        description: 'Live server',
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
