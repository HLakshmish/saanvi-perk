const companyController = require("./company.controller");
const { 
    createCompanySchema, 
    updateCompanySchema, 
    getCompanyByIdSchema, 
    getAllCompaniesSchema, 
    deleteCompanySchema 
} = require("./company.schema");

async function companyRoutes(fastify, options) {
    const opts = (schema) => ({
        schema,
        preValidation: [fastify.authenticate]
    });

    fastify.post("/", opts(createCompanySchema), companyController.createCompany.bind(companyController));
    fastify.get("/:id", opts(getCompanyByIdSchema), companyController.getCompanyById.bind(companyController));
    fastify.get("/", opts(getAllCompaniesSchema), companyController.getAllCompanies.bind(companyController));
    fastify.put("/:id", opts(updateCompanySchema), companyController.updateCompany.bind(companyController));
    fastify.delete("/:id", opts(deleteCompanySchema), companyController.deleteCompany.bind(companyController));
}

module.exports = companyRoutes;
