const departmentController = require("./department.controller");
const { 
    createDepartmentSchema, 
    getDepartmentByIdSchema, 
    getAllDepartmentsSchema, 
    updateDepartmentSchema, 
    deleteDepartmentSchema 
} = require("./department.schema");

async function departmentRoutes(fastify, options) {
    const opts = (schema) => ({
        schema,
        preValidation: [fastify.authenticate]
    });

    fastify.post("/", opts(createDepartmentSchema), departmentController.createDepartment.bind(departmentController));
    fastify.get("/:id", opts(getDepartmentByIdSchema), departmentController.getDepartmentById.bind(departmentController));
    fastify.get("/", opts(getAllDepartmentsSchema), departmentController.getAllDepartments.bind(departmentController));
    fastify.put("/:id", opts(updateDepartmentSchema), departmentController.updateDepartment.bind(departmentController));
    fastify.delete("/:id", opts(deleteDepartmentSchema), departmentController.deleteDepartment.bind(departmentController));
}

module.exports = departmentRoutes;
