const fp = require("fastify-plugin");
const multipart = require("@fastify/multipart");

async function multipartPlugin(app) {
    await app.register(multipart, {
        limits: {
            fileSize: 5 * 1024 * 1024 // 5 MB
        }
    });
}

module.exports = fp(multipartPlugin);