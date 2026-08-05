const cors = require("@fastify/cors");
const fp = require("fastify-plugin");

async function corsPlugin(app) {
    await app.register(cors, {
        origin: process.env.FRONTENT_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
        preflightContinue: false,
        optionsSuccessStatus: 204
    });
}

module.exports = fp(corsPlugin);