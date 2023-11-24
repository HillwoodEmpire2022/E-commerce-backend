import swaggerJsDoc from "swagger-jsdoc"
 
const LIVE_SERVER = process.env.BACKEND_LIVE_URL
const LOCALHOST_URL = process.env.BACKEND_LOCALHOST_URL


const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Hill Global Ecommerce APIs",
            version: "1.0.0",
            description: "This is a an express API for the Hill Global Ecommerce."
        },
        servers: [
            {
                url: LIVE_SERVER,
                description: "Live server"
            },
            {
                url: LOCALHOST_URL,
                description: "Localhost Server",
            }
        ],
        components: {
            securitySchemes: {
              bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
              },
            },
          },
        security: [
            {
              bearerAuth: [],
            },
        ],
    },
    apis: [ "./src/routes/*.js" ]
}

export const specs = swaggerJsDoc(options)
