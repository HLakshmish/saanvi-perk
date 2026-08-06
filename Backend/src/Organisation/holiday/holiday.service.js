const holidayRepository = require("./holiday.repository");

class HolidayService {
    async createHoliday(data) {
        const existing = await holidayRepository.getHolidayByCode(data.companyId, data.calendarId, data.holidayCode);
        if (existing) throw new Error("Holiday code already exists for this calendar");
        return await holidayRepository.createHoliday(data);
    }
    async getHolidayById(id) {
        const holiday = await holidayRepository.getHolidayById(id);
        if (!holiday) throw new Error("Holiday not found");
        return holiday;
    }
    async getAllHolidays(query) {
        return await holidayRepository.getAllHolidays(query);
    }
    async updateHoliday(id, data) {
        const holiday = await this.getHolidayById(id);
        if (data.holidayCode && data.holidayCode !== holiday.holidayCode) {
            const existing = await holidayRepository.getHolidayByCode(holiday.companyId, holiday.calendarId, data.holidayCode);
            if (existing) throw new Error("Holiday code already exists for this calendar");
        }
        return await holidayRepository.updateHoliday(id, data);
    }
    async deleteHoliday(id) {
        await this.getHolidayById(id);
        return await holidayRepository.deleteHoliday(id);
    }
}
module.exports = new HolidayService();
