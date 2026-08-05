const pfDetailRepository = require("./pfdetail.repository");

class PFDetailService {

    async createPFDetail(data) {
        const existingDetail = await pfDetailRepository.getPFDetailByUserId(data.userId);

        if (existingDetail) {
            throw new Error("PF details already exist for this user");
        }

        return await pfDetailRepository.createPFDetail(data);
    }

    async getPFDetailById(id) {
        const pfDetail = await pfDetailRepository.getPFDetailById(id);

        if (!pfDetail) {
            throw new Error("PF details not found");
        }

        return pfDetail;
    }

    async getPFDetailByUserId(userId) {
        const pfDetail = await pfDetailRepository.getPFDetailByUserId(userId);

        if (!pfDetail) {
            throw new Error("PF details not found");
        }

        return pfDetail;
    }

    async getAllPFDetails(query) {
        return await pfDetailRepository.getAllPFDetails(query);
    }

    async updatePFDetail(id, data) {
        await this.getPFDetailById(id);

        if (data.userId) {
            const existingDetail = await pfDetailRepository.getPFDetailByUserId(data.userId);

            if (
                existingDetail &&
                existingDetail.pfDetailId !== Number(id)
            ) {
                throw new Error("PF details already exist for this user");
            }
        }

        return await pfDetailRepository.updatePFDetail(id, data);
    }

    async deletePFDetail(id) {
        await this.getPFDetailById(id);
        return await pfDetailRepository.deletePFDetail(id);
    }

}

module.exports = new PFDetailService();
