const departmentService = require("./department.service");

class DepartmentController {
    async createDepartment(request, reply) {
        try {
            const { companyId, ...departmentData } = request.body;
            
            let targetCompanyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                if (!companyId) throw new Error("OWNER must provide a companyId to create a department.");
                targetCompanyId = companyId;
            } else if (request.user.role === 'SUPERADMIN') {
                targetCompanyId = request.user.companyId;
            } else {
                return reply.code(403).send({ success: false, message: "Forbidden" });
            }

            departmentData.companyId = targetCompanyId;
            departmentData.createdBy = request.user.role === 'USER' ? request.user.userId : null;

            if (!departmentData.departmentHead) {
                departmentData.departmentHead = null;
            }

            const department = await departmentService.createDepartment(departmentData);
            reply.code(201).send({ success: true, message: "Department created successfully", data: department });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getDepartmentById(request, reply) {
        try {
            const { id } = request.params;
            
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            const department = await departmentService.getDepartmentById(Number(id), companyId);
            reply.code(200).send({ success: true, data: department });
        } catch (error) {
            reply.code(404).send({ success: false, message: error.message });
        }
    }

    async getAllDepartments(request, reply) {
        try {
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            const departments = await departmentService.getAllDepartments(companyId);
            reply.code(200).send({ success: true, data: departments });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    async updateDepartment(request, reply) {
        try {
            const { id } = request.params;
            const { companyId, ...data } = request.body;

            let targetCompanyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                targetCompanyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            } else if (request.user.role !== 'SUPERADMIN') {
                return reply.code(403).send({ success: false, message: "Forbidden" });
            }

            data.updatedBy = request.user.role === 'USER' ? request.user.userId : null;

            if (data.departmentHead === 0 || data.departmentHead === "") {
                data.departmentHead = null;
            }

            const department = await departmentService.updateDepartment(Number(id), targetCompanyId, data);
            reply.code(200).send({ success: true, message: "Department updated successfully", data: department });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async deleteDepartment(request, reply) {
        try {
            const { id } = request.params;
            
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            } else if (request.user.role !== 'SUPERADMIN') {
                return reply.code(403).send({ success: false, message: "Forbidden" });
            }

            await departmentService.deleteDepartment(Number(id), companyId);
            reply.code(200).send({ success: true, message: "Department deleted successfully" });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }
}

module.exports = new DepartmentController();
