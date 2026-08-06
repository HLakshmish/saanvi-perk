const prisma = require("../../config/prisma");

class AddressInfoRepository {

    async createAddressInfo(data) {
        return await prisma.addressInformation.create({
            data
        });
    }

    async getAddressInfoByUserId(userId) {
        return await prisma.addressInformation.findMany({
            where: {
                userId: Number(userId)
            },
            orderBy: {
                addressType: "asc"
            }
        });
    }

    async getAddressByUserAndType(userId, addressType) {
    return await prisma.addressInformation.findUnique({
        where: {
            userId_addressType: {
                userId: Number(userId),
                addressType: addressType
            }
        }
    });
}

    async getAllAddressInfo(query = {}) {
        return await prisma.addressInformation.findMany({
            where: query
        });
    }

    async updateAddressInfo(userId, addressType, data) {
        return await prisma.addressInformation.update({
            where: {
                userId_addressType: {
                    userId: Number(userId),
                    addressType
                }
            },
            data
        });
    }

    async deleteAddressInfo(userId, addressType) {
        return await prisma.addressInformation.delete({
            where: {
                userId_addressType: {
                    userId: Number(userId),
                    addressType
                }
            }
        });
    }

}

module.exports = new AddressInfoRepository();