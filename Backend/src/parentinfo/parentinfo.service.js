const parentInfoRepository = require("./parentinfo.repository");

class ParentInfoService {

    async createParentInfo(data) {
        const existingUser = await parentInfoRepository.getParentInfoByUserId(data.userId);

        if (existingUser) {
            throw new Error("Parents information already exists for this user");
        }

        return await parentInfoRepository.createParentInfo(data);
    }

    async getParentInfoByUserId(userId) {
        const parentInfo = await parentInfoRepository.getParentInfoByUserId(Number(userId));

        if (!parentInfo) {
            throw new Error("Parents information not found");
        }

        return parentInfo;
    }

    async getAllParentInfo(query) {
        return await parentInfoRepository.getAllParentInfo(query);
    }

    async updateParentInfo(userId, data) {
        await this.getParentInfoByUserId(userId);

        // Don't allow changing ownership
        if (data.userId && Number(data.userId) !== Number(userId)) {
            throw new Error("User ID cannot be changed");
        }

        return await parentInfoRepository.updateParentInfo(
            Number(userId),
            data
        );
    }

    async deleteParentInfo(userId) {
        await this.getParentInfoByUserId(userId);
        return await parentInfoRepository.deleteParentInfo(Number(userId));
    }

}

module.exports = new ParentInfoService();