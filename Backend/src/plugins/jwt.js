const jwt = require("@fastify/jwt");

async function jwtPlugin(app) {

    await app.register(jwt, {
        secret: process.env.JWT_SECRET
    });

}

module.exports = jwtPlugin; 