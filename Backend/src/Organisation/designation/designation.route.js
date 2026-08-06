const designationController = require("./designation.controller");
const { 
    createDesignationSchema, 
    updateDesignationSchema, 
    getDesignationByIdSchema, 
    getAllDesignationsSchema, 
    deleteDesignationSchema 
} = require("./designation.schema");

async function designationRoutes(fastify, options) {
    const opts = (schema) => ({
        schema,
        preValidation: [fastify.authenticate]
    });

    fastify.post("/", opts(createDesignationSchema), designationController.createDesignation.bind(designationController));
    fastify.get("/:id", opts(getDesignationByIdSchema), designationController.getDesignationById.bind(designationController));
    fastify.get("/", opts(getAllDesignationsSchema), designationController.getAllDesignations.bind(designationController));
    fastify.put("/:id", opts(updateDesignationSchema), designationController.updateDesignation.bind(designationController));
    fastify.delete("/:id", opts(deleteDesignationSchema), designationController.deleteDesignation.bind(designationController));
}

module.exports = designationRoutes;
