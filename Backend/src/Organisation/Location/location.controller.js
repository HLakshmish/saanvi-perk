const locationService = require("./location.service");

class LocationController {
    async createLocation(request, reply) {
        try {
            const data = {
                ...request.body,
                companyId: request.user.companyId,
                createdBy: request.user.userId
            };
            const location = await locationService.createLocation(data);
            reply.code(201).send({ success: true, message: "Location created successfully", data: location });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getLocationById(request, reply) {
        try {
            const { id } = request.params;
            const location = await locationService.getLocationById(Number(id));
            if (location.companyId !== request.user.companyId) {
                return reply.code(403).send({ success: false, message: "Forbidden: You can only access locations of your own company" });
            }
            reply.code(200).send({ success: true, data: location });
        } catch (error) {
            reply.code(404).send({ success: false, message: error.message });
        }
    }

    async getAllLocations(request, reply) {
        try {
            const query = { ...request.query, companyId: request.user.companyId };
            const locations = await locationService.getAllLocations(query);
            reply.code(200).send({ success: true, data: locations });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    async updateLocation(request, reply) {
        try {
            const { id } = request.params;
            const location = await locationService.getLocationById(Number(id));
            if (location.companyId !== request.user.companyId) {
                return reply.code(403).send({ success: false, message: "Forbidden: You can only update locations of your own company" });
            }
            const updatedLocation = await locationService.updateLocation(Number(id), request.body);
            reply.code(200).send({ success: true, message: "Location updated successfully", data: updatedLocation });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async deleteLocation(request, reply) {
        try {
            const { id } = request.params;
            const location = await locationService.getLocationById(Number(id));
            if (location.companyId !== request.user.companyId) {
                return reply.code(403).send({ success: false, message: "Forbidden: You can only delete locations of your own company" });
            }
            await locationService.deleteLocation(Number(id));
            reply.code(200).send({ success: true, message: "Location deleted successfully" });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }
}

module.exports = new LocationController();
