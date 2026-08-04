const personalInfoService = require("./personalinfo.service");

class PersonalInfoController {

    async createPersonalInfo(request, reply) {
        try {
            const personalInfo = await personalInfoService.createPersonalInfo(request.body);

            reply.code(201).send({
                success: true,
                message: "Personal information created successfully",
                data: personalInfo
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async getPersonalInfoById(request, reply) {
        try {
            const { id } = request.params;

            const personalInfo = await personalInfoService.getPersonalInfoById(Number(id));

            reply.code(200).send({
                success: true,
                data: personalInfo
            });
        } catch (error) {
            reply.code(404).send({
                success: false,
                message: error.message
            });
        }
    }

    async getAllPersonalInfo(request, reply) {
        try {
            const personalInfo = await personalInfoService.getAllPersonalInfo(request.query);

            reply.code(200).send({
                success: true,
                data: personalInfo
            });
        } catch (error) {
            reply.code(500).send({
                success: false,
                message: error.message
            });
        }
    }

    async updatePersonalInfo(request, reply) {
        try {
            const { id } = request.params;

            const personalInfo = await personalInfoService.updatePersonalInfo(
                Number(id),
                request.body
            );

            reply.code(200).send({
                success: true,
                message: "Personal information updated successfully",
                data: personalInfo
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async deletePersonalInfo(request, reply) {
        try {
            const { id } = request.params;

            await personalInfoService.deletePersonalInfo(Number(id));

            reply.code(200).send({
                success: true,
                message: "Personal information deleted successfully"
            });
        } catch (error) {
            reply.code(400).send({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = new PersonalInfoController();