const insuranceDetailRepository = require("./insurancedetail.repository");

class InsuranceDetailService {

    async createInsuranceDetail(data) {
        const existingDetail = await insuranceDetailRepository.getInsuranceDetailByUserId(data.userId);

        if (existingDetail) {
            throw new Error("Insurance details already exist for this user");
        }

        return await insuranceDetailRepository.createInsuranceDetail(data);
    }

    async getInsuranceDetailById(id) {
        const insuranceDetail = await insuranceDetailRepository.getInsuranceDetailById(id);

        if (!insuranceDetail) {
            throw new Error("Insurance details not found");
        }

        return insuranceDetail;
    }

    async getInsuranceDetailByUserId(userId) {
        const insuranceDetail = await insuranceDetailRepository.getInsuranceDetailByUserId(userId);

        if (!insuranceDetail) {
            throw new Error("Insurance details not found");
        }

        return insuranceDetail;
    }

    async getAllInsuranceDetails(query) {
        return await insuranceDetailRepository.getAllInsuranceDetails(query);
    }

    async updateInsuranceDetail(id, data) {
        await this.getInsuranceDetailById(id);

        if (data.userId) {
            const existingDetail = await insuranceDetailRepository.getInsuranceDetailByUserId(data.userId);

            if (
                existingDetail &&
                existingDetail.insuranceId !== Number(id)
            ) {
                throw new Error("Insurance details already exist for this user");
            }
        }

        return await insuranceDetailRepository.updateInsuranceDetail(id, data);
    }

    async deleteInsuranceDetail(id) {
        await this.getInsuranceDetailById(id);
        return await insuranceDetailRepository.deleteInsuranceDetail(id);
    }

}

module.exports = new InsuranceDetailService();
