const calendarRepository = require("./calendar.repository");

class CalendarService {
    async createCalendar(data) {
        const existing = await calendarRepository.getCalendarByCode(data.companyId, data.calendarCode);
        if (existing) throw new Error("Calendar code already exists for this company");
        return await calendarRepository.createCalendar(data);
    }
    async getCalendarById(id) {
        const calendar = await calendarRepository.getCalendarById(id);
        if (!calendar) throw new Error("Calendar not found");
        return calendar;
    }
    async getAllCalendars(query) {
        return await calendarRepository.getAllCalendars(query);
    }
    async updateCalendar(id, data) {
        const calendar = await this.getCalendarById(id);
        if (data.calendarCode && data.calendarCode !== calendar.calendarCode) {
            const existing = await calendarRepository.getCalendarByCode(calendar.companyId, data.calendarCode);
            if (existing) throw new Error("Calendar code already exists for this company");
        }
        return await calendarRepository.updateCalendar(id, data);
    }
    async deleteCalendar(id) {
        await this.getCalendarById(id);
        return await calendarRepository.deleteCalendar(id);
    }
}
module.exports = new CalendarService();
