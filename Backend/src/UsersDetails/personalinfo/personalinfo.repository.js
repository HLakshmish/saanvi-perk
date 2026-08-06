const prisma = require("../../config/prisma");

class PersonalInfoRepository {

    async createPersonalInfo(data) {
        return await prisma.personalInformation.create({
            data
        });
    }

    async getPersonalInfoById(id) {
        return await prisma.personalInformation.findUnique({
            where: {
                personalInfoId: Number(id)
            }
        });
    }

    async getPersonalInfoByUserId(userId) {
        return await prisma.personalInformation.findUnique({
            where: {
                userId: Number(userId)
            }
        });
    }

    async getByAadhaarNumber(aadhaarNumber) {
        return await prisma.personalInformation.findUnique({
            where: {
                aadhaarNumber
            }
        });
    }

    async getByPanNumber(panNumber) {
        return await prisma.personalInformation.findUnique({
            where: {
                panNumber
            }
        });
    }

    async getByPassportNumber(passportNumber) {
        return await prisma.personalInformation.findUnique({
            where: {
                passportNumber
            }
        });
    }

    async getByDrivingLicenseNumber(drivingLicenseNumber) {
        return await prisma.personalInformation.findUnique({
            where: {
                drivingLicenseNumber
            }
        });
    }

    async getAllPersonalInfo(query = {}) {
        return await prisma.personalInformation.findMany({
            where: query
        });
    }

    async updatePersonalInfo(id, data) {
        return await prisma.personalInformation.update({
            where: {
                personalInfoId: Number(id)
            },
            data
        });
    }

    async deletePersonalInfo(id) {
        return await prisma.personalInformation.delete({
            where: {
                personalInfoId: Number(id)
            }
        });
    }

}

module.exports = new PersonalInfoRepository();