const cors = require("@fastify/cors");

async function corsPlugin(app) {
    await app.register(cors, {
        origin: true
    });
}

module.exports = corsPlugin;