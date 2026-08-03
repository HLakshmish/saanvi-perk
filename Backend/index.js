const fastify = require("fastify")({ logger: true });

fastify.get("/", async (request, reply) => {
    return { message: "Hello Fastify" };
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log("Server running on http://localhost:3000");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();