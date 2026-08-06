const holidayService = require("./holiday.service");

class HolidayController {
    async createHoliday(request, reply) {
        try {
            const data = { ...request.body, companyId: request.user.companyId, createdBy: request.user.userId };
            const holiday = await holidayService.createHoliday(data);
            reply.code(201).send({ success: true, message: "Holiday created", data: holiday });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
    async getHolidayById(request, reply) {
        try {
            const holiday = await holidayService.getHolidayById(Number(request.params.id));
            if (holiday.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });
            reply.code(200).send({ success: true, data: holiday });
        } catch (error) { reply.code(404).send({ success: false, message: error.message }); }
    }
    async getAllHolidays(request, reply) {
        try {
            const query = { ...request.query, companyId: request.user.companyId };
            // convert string numbers to actual numbers for valid query if needed, Fastify query parser can handle but to be safe:
            if (query.calendarId) query.calendarId = Number(query.calendarId);
            const holidays = await holidayService.getAllHolidays(query);
            reply.code(200).send({ success: true, data: holidays });
        } catch (error) { reply.code(500).send({ success: false, message: error.message }); }
    }
    async updateHoliday(request, reply) {
        try {
            const holiday = await holidayService.getHolidayById(Number(request.params.id));
            if (holiday.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });
            const updated = await holidayService.updateHoliday(Number(request.params.id), request.body);
            reply.code(200).send({ success: true, message: "Holiday updated", data: updated });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
    async deleteHoliday(request, reply) {
        try {
            const holiday = await holidayService.getHolidayById(Number(request.params.id));
            if (holiday.companyId !== request.user.companyId) return reply.code(403).send({ success: false, message: "Forbidden" });
            await holidayService.deleteHoliday(Number(request.params.id));
            reply.code(200).send({ success: true, message: "Holiday deleted" });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
}
module.exports = new HolidayController();
