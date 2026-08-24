const weekOffRepository = require("./weekOff.repository");

class WeekOffService {
    async createWeekOff(data) {
        return await weekOffRepository.createWeekOff(data);
    }

    async getWeekOffById(weekOffId, companyId) {
        const weekOff = await weekOffRepository.getWeekOffById(weekOffId, companyId);
        if (!weekOff) throw new Error("Week-Off configuration not found");
        return weekOff;
    }

    async getAllWeekOffs(companyId) {
        return await weekOffRepository.getAllWeekOffs(companyId);
    }

    async updateWeekOff(weekOffId, companyId, data) {
        const existing = await weekOffRepository.getWeekOffById(weekOffId, companyId);
        if (!existing) throw new Error("Week-Off configuration not found");
        return await weekOffRepository.updateWeekOff(weekOffId, companyId, data);
    }

    async deleteWeekOff(weekOffId, companyId) {
        const existing = await weekOffRepository.getWeekOffById(weekOffId, companyId);
        if (!existing) throw new Error("Week-Off configuration not found");
        return await weekOffRepository.deleteWeekOff(weekOffId, companyId);
    }

    async assignWeekOff(data) {
        return await weekOffRepository.assignWeekOff(data);
    }

    async getAssignedWeekOffs(companyId, userId) {
        return await weekOffRepository.getAssignedWeekOffs(companyId, userId);
    }
}

module.exports = new WeekOffService();
