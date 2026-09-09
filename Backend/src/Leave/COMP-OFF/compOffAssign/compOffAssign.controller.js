const service = require("./compOffAssign.service");

class CompOffAssignController {
    async create(request, reply) {
        try {
            const { userIds, policyId, startDate, endDate, status } = request.body;
            let companyId = request.user.companyId;

            if (request.user.role === 'SUPER_ADMIN' || request.user.role === 'OWNER') {
                companyId = request.body.companyId || companyId;
            }

            if (!companyId) {
                return reply.code(400).send({ success: false, message: "companyId is required" });
            }

            const assignments = userIds.map(userId => ({
                userId,
                policyId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: status ?? true,
                companyId,
                createdBy: request.user.userId || null
            }));

            const result = await service.createMany(assignments);
            return reply.code(201).send({ 
                success: true, 
                message: "Comp Off assigned successfully", 
                count: result.count 
            });
        } catch (error) {
            return reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getById(request, reply) {
        try {
            const { id } = request.params;
            let companyId = request.user.companyId;

            if (request.user.role === 'SUPER_ADMIN' || request.user.role === 'OWNER') {
                companyId = request.query.companyId || companyId;
            }

            const data = await service.getById(Number(id), companyId);
            return reply.send({ success: true, data });
        } catch (error) {
            return reply.code(404).send({ success: false, message: error.message });
        }
    }

    async getAll(request, reply) {
        try {
            let companyId = request.user.companyId;

            if (request.user.role === 'SUPER_ADMIN' || request.user.role === 'OWNER') {
                companyId = request.query.companyId || companyId;
            }

            const { userId, policyId } = request.query;

            const data = await service.getAll(companyId, userId ? Number(userId) : undefined, policyId ? Number(policyId) : undefined);
            return reply.send({ success: true, data });
        } catch (error) {
            return reply.code(500).send({ success: false, message: error.message });
        }
    }

    async update(request, reply) {
        try {
            const { id } = request.params;
            let companyId = request.user.companyId;

            if (request.user.role === 'SUPER_ADMIN' || request.user.role === 'OWNER') {
                companyId = request.body.companyId || companyId;
            }

            const updateData = {
                ...request.body,
                updatedBy: request.user.userId || null
            };
            
            // Remove companyId from updateData if it exists so we don't accidentally update it
            if (updateData.companyId) {
                delete updateData.companyId;
            }
            
            if (updateData.userId) updateData.userId = Number(updateData.userId);
            if (updateData.policyId) updateData.policyId = Number(updateData.policyId);
            if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
            if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

            const data = await service.update(Number(id), companyId, updateData);
            return reply.send({ success: true, message: "Comp Off Assignment updated successfully", data });
        } catch (error) {
            return reply.code(400).send({ success: false, message: error.message });
        }
    }

    async delete(request, reply) {
        try {
            const { id } = request.params;
            let companyId = request.user.companyId;

            if (request.user.role === 'SUPER_ADMIN' || request.user.role === 'OWNER') {
                companyId = request.query.companyId || companyId;
            }

            await service.delete(Number(id), companyId);
            return reply.send({ success: true, message: "Comp Off Assignment deleted successfully" });
        } catch (error) {
            return reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getUserCompOffDetails(request, reply) {
        try {
            let companyId = request.user.companyId;
            let targetUserId = request.user.userId;

            if (request.user.role === 'SUPER_ADMIN' || request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : companyId;
            }

            if (request.query.userId) {
                const requestedUserId = Number(request.query.userId);
                const isPrivileged = ['OWNER', 'SUPERADMIN', 'SUPER_ADMIN', 'ADMIN', 'HR'].includes(request.user.role);
                const hasPermission = request.user.permissions && (request.user.permissions.includes('VIEW_LEAVES') || request.user.permissions.includes('MANAGE_LEAVES'));

                if (!isPrivileged && !hasPermission && requestedUserId !== request.user.userId) {
                    return reply.code(403).send({ success: false, message: "Forbidden: Cannot view other employee's comp-off details" });
                }
                targetUserId = requestedUserId;
            }

            if (!companyId) {
                return reply.code(400).send({ success: false, message: "companyId is required" });
            }

            const data = await service.getUserCompOffDetails(companyId, targetUserId);
            return reply.send({ success: true, data });
        } catch (error) {
            return reply.code(error.message === "User not found" ? 404 : 400).send({ success: false, message: error.message });
        }
    }

    async getAdminCompOffOverview(request, reply) {
        try {
            const isPrivileged = ['OWNER', 'SUPERADMIN', 'SUPER_ADMIN', 'ADMIN', 'HR'].includes(request.user.role);
            const hasPermission = request.user.permissions && (request.user.permissions.includes('VIEW_LEAVES') || request.user.permissions.includes('MANAGE_LEAVES'));

            if (!isPrivileged && !hasPermission) {
                return reply.code(403).send({ success: false, message: "Forbidden: Insufficient permissions to view all employees' comp-off summary" });
            }

            let companyId = request.user.companyId;
            if (request.user.role === 'SUPER_ADMIN' || request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : companyId;
            }

            if (!companyId) {
                return reply.code(400).send({ success: false, message: "companyId is required" });
            }

            const filters = {
                departmentId: request.query.departmentId ? Number(request.query.departmentId) : undefined,
                userId: request.query.userId ? Number(request.query.userId) : undefined,
                policyId: request.query.policyId ? Number(request.query.policyId) : undefined,
                search: request.query.search || undefined
            };

            const data = await service.getAdminCompOffOverview(companyId, filters);
            return reply.send({ success: true, data });
        } catch (error) {
            return reply.code(500).send({ success: false, message: error.message });
        }
    }
}

module.exports = new CompOffAssignController();
