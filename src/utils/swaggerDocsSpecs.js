import swaggerJsDoc from "swagger-jsdoc" 



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
                url: "https://smiling-neckerchief-eel.cyclic.app",
                description: "Live server"
            },
            {
                url: "http://localhost:3002",
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
