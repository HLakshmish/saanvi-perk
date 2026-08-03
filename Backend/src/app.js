const Fastify = require("fastify");
const corsPlugin = require("./plugins/cors");
const swaggerPlugin = require("./plugins/swagger");
const jwtPlugin = require("./plugins/jwt");
const multipartPlugin = require("./plugins/multipart");
require("dotenv").config();

const app = Fastify({
    logger: true,
});

// Register plugins
app.register(corsPlugin);
app.register(swaggerPlugin);
app.register(jwtPlugin);
app.register(multipartPlugin);

// Routes
app.get("/", async (request, reply) => {
    return {
        message: "Hello Fastify",
    };
});

app.register(require("./company/company.route"), { prefix: "/api/companies" });

module.exports = app;