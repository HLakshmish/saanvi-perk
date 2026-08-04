const fp = require("fastify-plugin");
const swagger = require("@fastify/swagger");
const swaggerUI = require("@fastify/swagger-ui");

async function swaggerPlugin(app) {

    await app.register(swagger, {
        openapi: {
            info: {
                title: "Perk HRMS API",
                description: "API Documentation",
                version: "1.0.0"
            },
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
        }
    });

    await app.register(swaggerUI, {
        routePrefix: "/docs"
    });

}

module.exports = fp(swaggerPlugin);