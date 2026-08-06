const calendarService = require("./calendar.service");

class CalendarController {
    async createCalendar(request, reply) {
        try {
            const data = { ...request.body, companyId: request.user.companyId, createdBy: request.user.userId };
            const calendar = await calendarService.createCalendar(data);
            reply.code(201).send({ success: true, message: "Calendar created", data: calendar });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
    async getCalendarById(request, reply) {
        try {
            const calendar = await calendarService.getCalendarById(Number(request.params.id));
            if (calendar.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });
            reply.code(200).send({ success: true, data: calendar });
        } catch (error) { reply.code(404).send({ success: false, message: error.message }); }
    }
    async getAllCalendars(request, reply) {
        try {
            const query = { ...request.query, companyId: request.user.companyId };
            const calendars = await calendarService.getAllCalendars(query);
            reply.code(200).send({ success: true, data: calendars });
        } catch (error) { reply.code(500).send({ success: false, message: error.message }); }
    }
    async updateCalendar(request, reply) {
        try {
            const calendar = await calendarService.getCalendarById(Number(request.params.id));
            if (calendar.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });
            const updated = await calendarService.updateCalendar(Number(request.params.id), request.body);
            reply.code(200).send({ success: true, message: "Calendar updated", data: updated });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
    async deleteCalendar(request, reply) {
        try {
            const calendar = await calendarService.getCalendarById(Number(request.params.id));
            if (calendar.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });
            await calendarService.deleteCalendar(Number(request.params.id));
            reply.code(200).send({ success: true, message: "Calendar deleted" });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
}
module.exports = new CalendarController();
