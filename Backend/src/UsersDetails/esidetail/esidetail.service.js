const esiDetailRepository = require("./esidetail.repository");

class ESIDetailService {

    async createESIDetail(data) {
        const existingDetail = await esiDetailRepository.getESIDetailByUserId(data.userId);

        if (existingDetail) {
            throw new Error("ESI details already exist for this user");
        }

        return await esiDetailRepository.createESIDetail(data);
    }

    async getESIDetailById(id) {
        const esiDetail = await esiDetailRepository.getESIDetailById(id);

        if (!esiDetail) {
            throw new Error("ESI details not found");
        }

        return esiDetail;
    }

    async getESIDetailByUserId(userId) {
        const esiDetail = await esiDetailRepository.getESIDetailByUserId(userId);

        if (!esiDetail) {
            throw new Error("ESI details not found");
        }

        return esiDetail;
    }

    async getAllESIDetails(query) {
        return await esiDetailRepository.getAllESIDetails(query);
    }

    async updateESIDetail(id, data) {
        await this.getESIDetailById(id);

        if (data.userId) {
            const existingDetail = await esiDetailRepository.getESIDetailByUserId(data.userId);

            if (
                existingDetail &&
                existingDetail.esiDetailId !== Number(id)
            ) {
                throw new Error("ESI details already exist for this user");
            }
        }

        return await esiDetailRepository.updateESIDetail(id, data);
    }

    async deleteESIDetail(id) {
        await this.getESIDetailById(id);
        return await esiDetailRepository.deleteESIDetail(id);
    }

}

module.exports = new ESIDetailService();
