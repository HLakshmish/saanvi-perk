const jwt = require("@fastify/jwt");
const fp = require("fastify-plugin");

async function jwtPlugin(app) {

    await app.register(jwt, {
        secret: process.env.JWT_SECRET
    });

    app.decorate("authenticate", async function (request, reply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.status(401).send({ success: false, message: "Unauthorized" });
        }
    });

}

module.exports = fp(jwtPlugin); 