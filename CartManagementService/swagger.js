const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cart Management API',
      version: '1.0.0',
      description: 'API for managing shopping cart operations including add, update, remove products, and calculate totals.'
    },
    components: {
      securitySchemes: {
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-KEY'
        }
      },
      schemas: {
        CartItem: {
          type: 'object',
          properties: {
            productId: { type: 'string' },
            quantity: { type: 'integer', minimum: 1 }
          },
          required: ['productId', 'quantity']
        },
        Cart: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                allOf: [
                  { $ref: '#/components/schemas/CartItem' },
                  {
                    type: 'object',
                    properties: {
                      unitPrice: { type: 'number', format: 'float' },
                      lineTotal: { type: 'number', format: 'float' }
                    }
                  }
                ]
              }
            },
            total: { type: 'number', format: 'float' }
          },
          required: ['items', 'total']
        }
      }
    },
    security: [{ apiKeyAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
