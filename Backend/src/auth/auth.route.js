const authController = require("./auth.controller");
const { loginSchema } = require("./auth.schema");

async function authRoutes(fastify, options) {
    fastify.post("/login", { schema: loginSchema }, authController.login.bind(authController));
}

module.exports = authRoutes;
