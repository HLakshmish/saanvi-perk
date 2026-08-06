const prisma = require("../../config/prisma");

class LocationRepository {
    async createLocation(data) {
        return await prisma.officeLocation.create({
            data
        });
    }

    async getLocationById(id) {
        return await prisma.officeLocation.findUnique({
            where: { officeLocationId: id }
        });
    }
    
    async getLocationByCode(companyId, code) {
        return await prisma.officeLocation.findUnique({
            where: {
                companyId_locationCode: {
                    companyId: companyId,
                    locationCode: code
                }
            }
        });
    }

    async getAllLocations(query = {}) {
        return await prisma.officeLocation.findMany({
            where: query
        });
    }

    async updateLocation(id, data) {
        return await prisma.officeLocation.update({
            where: { officeLocationId: id },
            data
        });
    }

    async deleteLocation(id) {
        return await prisma.officeLocation.delete({
            where: { officeLocationId: id }
        });
    }
}

module.exports = new LocationRepository();
