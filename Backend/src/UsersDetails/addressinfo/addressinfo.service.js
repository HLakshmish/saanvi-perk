const addressInfoRepository = require("./addressinfo.repository");

class AddressInfoService {

    async createAddressInfo(data) {
        // extract isSame and uppercase the addressType
        const { isSame, ...addressData } = data;
        
        if (addressData.addressType) {
            addressData.addressType = addressData.addressType.toUpperCase();
        }

        const existingAddress =
            await addressInfoRepository.getAddressByUserAndType(
                addressData.userId,
                addressData.addressType
            );

        if (existingAddress) {
            throw new Error(
                `${addressData.addressType} address already exists for this user`
            );
        }

        const createdAddress = await addressInfoRepository.createAddressInfo(addressData);

        if (isSame) {
            const otherType = addressData.addressType === 'CURRENT' ? 'PERMANENT' : 'CURRENT';
            const existingOther = await addressInfoRepository.getAddressByUserAndType(
                addressData.userId,
                otherType
            );
            
            if (!existingOther) {
                const otherData = { ...addressData, addressType: otherType };
                await addressInfoRepository.createAddressInfo(otherData);
            }
        }

        return createdAddress;
    }

    async getAddressInfoByUserId(userId) {
        const addressInfo =
            await addressInfoRepository.getAddressInfoByUserId(
                Number(userId)
            );

        if (!addressInfo || addressInfo.length === 0) {
            throw new Error("Address information not found");
        }

        return addressInfo;
    }

    async getAddressByUserAndType(userId, addressType) {
        const address =
            await addressInfoRepository.getAddressByUserAndType(
                Number(userId),
                addressType
            );

        if (!address) {
            throw new Error("Address not found");
        }

        return address;
    }

    async getAllAddressInfo(query) {
        return await addressInfoRepository.getAllAddressInfo(query);
    }

    async updateAddressInfo(userId, addressType, data) {
        const { isSame, ...addressData } = data;
        const upperAddressType = addressType.toUpperCase();

        await this.getAddressByUserAndType(
            Number(userId),
            upperAddressType
        );

        if (addressData.userId && Number(addressData.userId) !== Number(userId)) {
            throw new Error("User ID cannot be changed");
        }

        if (addressData.addressType && addressData.addressType.toUpperCase() !== upperAddressType) {
            throw new Error("Address type cannot be changed");
        }
        
        if (addressData.addressType) {
            addressData.addressType = addressData.addressType.toUpperCase();
        }

        const updated = await addressInfoRepository.updateAddressInfo(
            Number(userId),
            upperAddressType,
            addressData
        );

        if (isSame) {
            const otherType = upperAddressType === 'CURRENT' ? 'PERMANENT' : 'CURRENT';
            const existingOther = await addressInfoRepository.getAddressByUserAndType(
                Number(userId),
                otherType
            );
            
            const otherData = { ...addressData, addressType: otherType };
            if (existingOther) {
                await addressInfoRepository.updateAddressInfo(
                    Number(userId),
                    otherType,
                    otherData
                );
            } else {
                await addressInfoRepository.createAddressInfo({ ...otherData, userId: Number(userId) });
            }
        }

        return updated;
    }

    async deleteAddressInfo(userId, addressType) {
        const upperAddressType = addressType.toUpperCase();
        
        await this.getAddressByUserAndType(
            Number(userId),
            upperAddressType
        );

        return await addressInfoRepository.deleteAddressInfo(
            Number(userId),
            upperAddressType
        );
    }
}

module.exports = new AddressInfoService();