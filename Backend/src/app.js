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
app.register(require("./Organisation/company/company.route"), { prefix: "/api/companies" });
app.register(require("./Organisation/role/role.route"), { prefix: "/api/roles" });
app.register(require("./Organisation/department/department.route"), { prefix: "/api/departments" });
app.register(require("./UsersDetails/user/user.route"), { prefix: "/api/users" });
app.register(require("./UsersDetails/personalinfo/personalinfo.route"), {
    prefix: "/api/personal-information"
});
app.register(require("./UsersDetails/parentinfo/parentinfo.route"), {
    prefix: "/api/parent-info"
});
app.register(require("./UsersDetails/addressinfo/addressinfo.route"), {
    prefix: "/api/address-info"
});
app.register(require("./UsersDetails/bankdetails/bankdetails.route"), {
    prefix: "/api/bank-details"
});
app.register(require("./UsersDetails/pfdetail/pfdetail.route"), {
    prefix: "/api/pf-details"
});
app.register(require("./UsersDetails/esidetail/esidetail.route"), {
    prefix: "/api/esi-details"
});
app.register(require("./UsersDetails/insurancedetail/insurancedetail.route"), {
    prefix: "/api/insurance-details"
});
app.register(require("./UsersDetails/employeedocument/employeedocument.route"), {
    prefix: "/api/employee-documents"
});

module.exports = app;