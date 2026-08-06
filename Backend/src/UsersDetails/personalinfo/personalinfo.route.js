const personalInfoController = require("./personalInfo.controller");
const {
    createPersonalInfoSchema,
    updatePersonalInfoSchema,
    getPersonalInfoByIdSchema,
    getAllPersonalInfoSchema,
    deletePersonalInfoSchema
} = require("./personalInfo.schema");

async function personalInfoRoutes(fastify, options) {
    const opts = (schema) => ({
        schema,
        preValidation: [fastify.authenticate]
    });

    fastify.post(
        "/",
        opts(createPersonalInfoSchema),
        personalInfoController.createPersonalInfo.bind(personalInfoController)
    );

    fastify.get(
        "/:id",
        opts(getPersonalInfoByIdSchema),
        personalInfoController.getPersonalInfoById.bind(personalInfoController)
    );

    fastify.get(
        "/",
        opts(getAllPersonalInfoSchema),
        personalInfoController.getAllPersonalInfo.bind(personalInfoController)
    );

    fastify.put(
        "/:id",
        opts(updatePersonalInfoSchema),
        personalInfoController.updatePersonalInfo.bind(personalInfoController)
    );

    fastify.delete(
        "/:id",
        opts(deletePersonalInfoSchema),
        personalInfoController.deletePersonalInfo.bind(personalInfoController)
    );
}

module.exports = personalInfoRoutes;