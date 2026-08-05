const bankDetailsRepository = require("./bankdetails.repository");

class BankDetailsService {

    async createBankDetails(data) {
        const existingDetails = await bankDetailsRepository.getBankDetailsByUserId(data.userId);

        if (existingDetails) {
            throw new Error("Bank details already exist for this user");
        }

        return await bankDetailsRepository.createBankDetails(data);
    }

    async getBankDetailsById(id) {
        const bankDetails = await bankDetailsRepository.getBankDetailsById(id);

        if (!bankDetails) {
            throw new Error("Bank details not found");
        }

        return bankDetails;
    }

    async getBankDetailsByUserId(userId) {
        const bankDetails = await bankDetailsRepository.getBankDetailsByUserId(userId);

        if (!bankDetails) {
            throw new Error("Bank details not found");
        }

        return bankDetails;
    }

    async getAllBankDetails(query) {
        return await bankDetailsRepository.getAllBankDetails(query);
    }

    async updateBankDetails(id, data) {
        await this.getBankDetailsById(id);

        if (data.userId) {
            const existingDetails = await bankDetailsRepository.getBankDetailsByUserId(data.userId);

            if (
                existingDetails &&
                existingDetails.bankId !== Number(id)
            ) {
                throw new Error("Bank details already exist for this user");
            }
        }

        return await bankDetailsRepository.updateBankDetails(id, data);
    }

    async deleteBankDetails(id) {
        await this.getBankDetailsById(id);
        return await bankDetailsRepository.deleteBankDetails(id);
    }

}

module.exports = new BankDetailsService();
