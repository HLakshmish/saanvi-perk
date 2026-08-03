const companyController = require("./company.controller");
const { 
    createCompanySchema, 
    updateCompanySchema, 
    getCompanyByIdSchema, 
    getAllCompaniesSchema, 
    deleteCompanySchema 
} = require("./company.schema");

async function companyRoutes(fastify, options) {
    fastify.post("/", { schema: createCompanySchema }, companyController.createCompany.bind(companyController));
    fastify.get("/:id", { schema: getCompanyByIdSchema }, companyController.getCompanyById.bind(companyController));
    fastify.get("/", { schema: getAllCompaniesSchema }, companyController.getAllCompanies.bind(companyController));
    fastify.put("/:id", { schema: updateCompanySchema }, companyController.updateCompany.bind(companyController));
    fastify.delete("/:id", { schema: deleteCompanySchema }, companyController.deleteCompany.bind(companyController));
}

module.exports = companyRoutes;
