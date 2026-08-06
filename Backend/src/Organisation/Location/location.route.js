const locationController = require("./location.controller");
const { 
    createLocationSchema, 
    updateLocationSchema, 
    getLocationByIdSchema, 
    getAllLocationsSchema, 
    deleteLocationSchema 
} = require("./location.schema");

async function locationRoutes(fastify, options) {
    const opts = (schema) => ({
        schema,
        preValidation: [fastify.authenticate]
    });

    fastify.post("/", opts(createLocationSchema), locationController.createLocation.bind(locationController));
    fastify.get("/:id", opts(getLocationByIdSchema), locationController.getLocationById.bind(locationController));
    fastify.get("/", opts(getAllLocationsSchema), locationController.getAllLocations.bind(locationController));
    fastify.put("/:id", opts(updateLocationSchema), locationController.updateLocation.bind(locationController));
    fastify.delete("/:id", opts(deleteLocationSchema), locationController.deleteLocation.bind(locationController));
}

module.exports = locationRoutes;
