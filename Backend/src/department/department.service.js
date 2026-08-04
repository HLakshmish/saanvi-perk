const departmentRepository = require("./department.repository");

class DepartmentService {
    async createDepartment(data) {
        try {
            return await departmentRepository.createDepartment(data);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("Department code already exists in this company.");
            }
            if (error.code === 'P2003') {
                throw new Error("Invalid reference: company or departmentHead does not exist in the database.");
            }
            throw error;
        }
    }

    async getDepartmentById(departmentId, companyId) {
        const department = await departmentRepository.getDepartmentById(departmentId, companyId);
        if (!department) throw new Error("Department not found");
        return department;
    }

    async getAllDepartments(companyId) {
        return await departmentRepository.getAllDepartments(companyId);
    }

    async updateDepartment(departmentId, companyId, data) {
        try {
            return await departmentRepository.updateDepartment(departmentId, companyId, data);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error("Department code already exists in this company.");
            }
            if (error.code === 'P2003') {
                throw new Error("Invalid reference: departmentHead does not exist in the database.");
            }
            throw error;
        }
    }

    async deleteDepartment(departmentId, companyId) {
        return await departmentRepository.deleteDepartment(departmentId, companyId);
    }
}

module.exports = new DepartmentService();
