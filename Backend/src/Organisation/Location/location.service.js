const locationRepository = require("./location.repository");

class LocationService {
    async createLocation(data) {
        const existingCode = await locationRepository.getLocationByCode(data.companyId, data.locationCode);
        if (existingCode) {
            throw new Error("Location code already exists for this company");
        }
        return await locationRepository.createLocation(data);
    }

    async getLocationById(id) {
        const location = await locationRepository.getLocationById(id);
        if (!location) {
            throw new Error("Location not found");
        }
        return location;
    }

    async getAllLocations(query) {
        return await locationRepository.getAllLocations(query);
    }

    async updateLocation(id, data) {
        const location = await this.getLocationById(id);
        if (data.locationCode && data.locationCode !== location.locationCode) {
            const existingCode = await locationRepository.getLocationByCode(location.companyId, data.locationCode);
            if (existingCode) {
                throw new Error("Location code already exists for this company");
            }
        }
        return await locationRepository.updateLocation(id, data);
    }

    async deleteLocation(id) {
        await this.getLocationById(id);
        return await locationRepository.deleteLocation(id);
    }
}

module.exports = new LocationService();
