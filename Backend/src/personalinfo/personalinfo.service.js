const personalInfoRepository = require("./personalinfo.repository");

class PersonalInfoService {

    async createPersonalInfo(data) {
        const existingUser = await personalInfoRepository.getPersonalInfoByUserId(data.userId);

        if (existingUser) {
            throw new Error("Personal information already exists for this user");
        }

        return await personalInfoRepository.createPersonalInfo(data);
    }

    async getPersonalInfoById(id) {
        const personalInfo = await personalInfoRepository.getPersonalInfoById(id);

        if (!personalInfo) {
            throw new Error("Personal information not found");
        }

        return personalInfo;
    }

    async getPersonalInfoByUserId(userId) {
        const personalInfo = await personalInfoRepository.getPersonalInfoByUserId(userId);

        if (!personalInfo) {
            throw new Error("Personal information not found");
        }

        return personalInfo;
    }

    async getAllPersonalInfo(query) {
        return await personalInfoRepository.getAllPersonalInfo(query);
    }

    async updatePersonalInfo(id, data) {
        await this.getPersonalInfoById(id);

        if (data.userId) {
            const existingUser = await personalInfoRepository.getPersonalInfoByUserId(data.userId);

            if (
                existingUser &&
                existingUser.personalInfoId !== Number(id)
            ) {
                throw new Error("Personal information already exists for this user");
            }
        }

        return await personalInfoRepository.updatePersonalInfo(id, data);
    }

    async deletePersonalInfo(id) {
        await this.getPersonalInfoById(id);
        return await personalInfoRepository.deletePersonalInfo(id);
    }

}

module.exports = new PersonalInfoService();