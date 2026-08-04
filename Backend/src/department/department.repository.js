const prisma = require("../config/prisma");

class DepartmentRepository {
    async createDepartment(data) {
        return await prisma.department.create({ data });
    }

    async getDepartmentById(departmentId, companyId) {
        const whereClause = { departmentId };
        if (companyId) whereClause.companyId = companyId;

        return await prisma.department.findFirst({
            where: whereClause,
            include: {
                headUser: {
                    select: { firstName: true, lastName: true, officialEmail: true }
                }
            }
        });
    }

    async getAllDepartments(companyId) {
        const whereClause = {};
        if (companyId) whereClause.companyId = companyId;

        return await prisma.department.findMany({
            where: whereClause,
            include: {
                headUser: {
                    select: { firstName: true, lastName: true, officialEmail: true }
                }
            }
        });
    }

    async updateDepartment(departmentId, companyId, data) {
        const whereClause = { departmentId };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.department.findFirst({ where: whereClause });
        if (!exists) throw new Error("Department not found or does not belong to this company");

        return await prisma.department.update({
            where: { departmentId },
            data
        });
    }

    async deleteDepartment(departmentId, companyId) {
        const whereClause = { departmentId };
        if (companyId) whereClause.companyId = companyId;

        const exists = await prisma.department.findFirst({ where: whereClause });
        if (!exists) throw new Error("Department not found or does not belong to this company");

        return await prisma.department.delete({
            where: { departmentId }
        });
    }
}

module.exports = new DepartmentRepository();
