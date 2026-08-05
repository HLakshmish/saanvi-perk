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

app.register(require("./auth/auth.route"), { prefix: "/api/auth" });
app.register(require("./company/company.route"), { prefix: "/api/companies" });
app.register(require("./role/role.route"), { prefix: "/api/roles" });
app.register(require("./department/department.route"), { prefix: "/api/departments" });
app.register(require("./user/user.route"), { prefix: "/api/users" });
app.register(require("./personalinfo/personalinfo.route"), {
    prefix: "/api/personal-information"
});
app.register(require("./parentinfo/parentinfo.route"), {
    prefix: "/api/parent-info"
});
app.register(require("./addressinfo/addressinfo.route"), {
    prefix: "/api/address-info"
});
app.register(require("./bankdetails/bankdetails.route"), {
    prefix: "/api/bank-details"
});

module.exports = app;