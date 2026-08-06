const prisma = require("../../config/prisma");

class HolidayRepository {
    async createHoliday(data) {
        return await prisma.holiday.create({ data });
    }
    async getHolidayById(id) {
        return await prisma.holiday.findUnique({
            where: { holidayId: id }
        });
    }
    async getHolidayByCode(companyId, calendarId, code) {
        return await prisma.holiday.findUnique({
            where: { companyId_calendarId_holidayCode: { companyId, calendarId, holidayCode: code } }
        });
    }
    async getAllHolidays(query = {}) {
        return await prisma.holiday.findMany({ where: query });
    }
    async updateHoliday(id, data) {
        return await prisma.holiday.update({ where: { holidayId: id }, data });
    }
    async deleteHoliday(id) {
        return await prisma.holiday.delete({ where: { holidayId: id } });
    }
}
module.exports = new HolidayRepository();
