const prisma = require("../../config/prisma");

class CalendarRepository {
    async createCalendar(data) {
        return await prisma.calendar.create({ data });
    }
    async getCalendarById(id) {
        return await prisma.calendar.findUnique({
            where: { calendarId: id },
            include: { holidays: true }
        });
    }
    async getCalendarByCode(companyId, code) {
        return await prisma.calendar.findUnique({
            where: { companyId_calendarCode: { companyId, calendarCode: code } }
        });
    }
    async getAllCalendars(query = {}) {
        return await prisma.calendar.findMany({ where: query });
    }
    async updateCalendar(id, data) {
        return await prisma.calendar.update({ where: { calendarId: id }, data });
    }
    async deleteCalendar(id) {
        return await prisma.calendar.delete({ where: { calendarId: id } });
    }
}
module.exports = new CalendarRepository();
