const userRepository = require("./user.repository");
const bcrypt = require("bcrypt");

class UserService {
    async createUser(data) {
        try {
            if (data.password) {
                data.password = await bcrypt.hash(data.password, 10);
            }
            return await userRepository.createUser(data);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("User with this employee code or email already exists.");
            }
            if (error.code === 'P2003') {
                throw new Error("Invalid reference: company, role, department, or manager does not exist.");
            }
            throw error;
        }
    }

    async getUserById(userId, companyId) {
        const user = await userRepository.getUserById(userId, companyId);
        if (!user) throw new Error("User not found");
        return user;
    }

    async getAllUsers(companyId) {
        return await userRepository.getAllUsers(companyId);
    }

    async updateUser(userId, companyId, data) {
        try {
            if (data.password) {
                data.password = await bcrypt.hash(data.password, 10);
            }
            return await userRepository.updateUser(userId, companyId, data);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("User with this employee code or email already exists.");
            }
            if (error.code === 'P2003') {
                throw new Error("Invalid reference: role, department, or manager does not exist.");
            }
            throw error;
        }
    }

    async getEvents(companyId, targetDateString) {
        return await userRepository.getEvents(companyId, targetDateString);
    }

    async deleteUser(userId, companyId) {
        return await userRepository.deleteUser(userId, companyId);
    }
}

module.exports = new UserService();
