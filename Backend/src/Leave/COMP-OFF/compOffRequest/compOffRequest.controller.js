const service = require("./compOffRequest.service");
const prisma = require("../../../config/prisma");

async function checkCanManageCompOff(user) {
    if (!user) return false;
    if (['OWNER', 'SUPERADMIN', 'SUPER_ADMIN', 'ADMIN', 'HR'].includes(user.role)) {
        return true;
    }
    if (user.permissions && (user.permissions.includes('MANAGE_LEAVES') || user.permissions.includes('MANAGE_COMP_OFF') || user.permissions.includes('APPLY_LEAVE_ON_BEHALF'))) {
        return true;
    }
    if (user.userId) {
        try {
            const dbUser = await prisma.user.findUnique({
                where: { userId: Number(user.userId) },
                include: {
                    userRoles: {
                        include: {
                            role: {
                                include: {
                                    rolePermissions: {
                                        include: { permission: true }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (dbUser && dbUser.userRoles) {
                return dbUser.userRoles.some(ur => {
                    const code = (ur.role?.roleCode || '').toUpperCase();
                    const name = (ur.role?.roleName || '').toUpperCase();
                    const hasPerm = ur.role?.rolePermissions?.some(rp =>
                        rp.permission?.permissionCode === 'MANAGE_LEAVES' ||
                        rp.permission?.permissionCode === 'MANAGE_COMP_OFF' ||
                        rp.permission?.permissionCode === 'APPLY_LEAVE_ON_BEHALF'
                    );
                    return hasPerm ||
                           code.includes('ADMIN') || code.includes('HR') || code.includes('MGR') || code.includes('MANAGER') ||
                           name.includes('ADMIN') || name.includes('HR') || name.includes('MANAGER');
                });
            }
        } catch (e) {
            console.error("Error checking comp-off manager roles:", e);
        }
    }
    return false;
}

class CompOffRequestController {
    async create(request, reply) {
        try {
            let companyId = request.user?.companyId;
            if (request.user?.role === 'SUPER_ADMIN' || request.user?.role === 'OWNER') {
                companyId = request.body.companyId || companyId;
            }

            if (!companyId) {
                return reply.code(400).send({ success: false, message: "companyId is required" });
            }

            let targetUserId = Number(request.user?.userId);
            if (request.body.userId && Number(request.body.userId) !== targetUserId) {
                const canManage = await checkCanManageCompOff(request.user);
                if (!canManage) {
                    return reply.code(403).send({ success: false, message: "Forbidden: Cannot request comp-off on behalf of another user." });
                }
                targetUserId = Number(request.body.userId);
            }

            const data = {
                ...request.body,
                companyId: Number(companyId),
                userId: targetUserId
            };

            const created = await service.createRequest(data);
            return reply.code(201).send({
                success: true,
                message: "Comp-off work permission requested successfully",
                data: created
            });
        } catch (error) {
            return reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getById(request, reply) {
        try {
            const { id } = request.params;
            let companyId = request.user?.companyId;
            if (request.user?.role === 'SUPER_ADMIN' || request.user?.role === 'OWNER') {
                companyId = request.query.companyId || companyId;
            }

            const data = await service.getById(Number(id), companyId);
            if (!data) {
                return reply.code(404).send({ success: false, message: "Comp-off request not found." });
            }

            if (request.user?.role === 'USER' && Number(data.userId) !== Number(request.user?.userId)) {
                const canManage = await checkCanManageCompOff(request.user);
                const isReportingManager = Number(data.reportingToId) === Number(request.user?.userId);
                if (!canManage && !isReportingManager) {
                    return reply.code(403).send({ success: false, message: "Forbidden: Cannot view other employee's comp-off request." });
                }
            }

            return reply.send({ success: true, data });
        } catch (error) {
            return reply.code(404).send({ success: false, message: error.message });
        }
    }

    async getAll(request, reply) {
        try {
            let companyId = request.user?.companyId;
            if (request.user?.role === 'SUPER_ADMIN' || request.user?.role === 'OWNER') {
                companyId = request.query.companyId || companyId;
            }

            const query = { ...request.query };
            if (request.query.userId) query.userId = Number(request.query.userId);
            if (request.query.reportingToId) query.reportingToId = Number(request.query.reportingToId);

            if (request.user?.role === 'USER') {
                const canManage = await checkCanManageCompOff(request.user);
                if (!canManage) {
                    // Standard users strictly forced to their own requests
                    query.userId = Number(request.user.userId);
                }
            }

            const data = await service.getAll(companyId, query);
            return reply.send({ success: true, data });
        } catch (error) {
            return reply.code(400).send({ success: false, message: error.message });
        }
    }

    async updateStatus(request, reply) {
        try {
            const { id } = request.params;
            let companyId = request.user?.companyId;
            if (request.user?.role === 'SUPER_ADMIN' || request.user?.role === 'OWNER') {
                companyId = request.query.companyId || companyId;
            }

            const existing = await service.getById(Number(id), companyId);
            if (!existing) {
                return reply.code(404).send({ success: false, message: "Comp-off request not found." });
            }

            const status = (request.body.status || '').toUpperCase();

            if (['APPROVED', 'REJECTED'].includes(status)) {
                if (request.user?.role === 'USER') {
                    const canManage = await checkCanManageCompOff(request.user);
                    const isReportingManager = Number(existing.reportingToId) === Number(request.user?.userId);
                    if (!canManage && !isReportingManager) {
                        return reply.code(403).send({ success: false, message: "Forbidden: You are not authorized to approve or reject comp-off requests." });
                    }
                }
            } else if (status === 'CANCELLED') {
                if (request.user?.role === 'USER') {
                    const canManage = await checkCanManageCompOff(request.user);
                    if (!canManage) {
                        if (Number(existing.userId) !== Number(request.user?.userId)) {
                            return reply.code(403).send({ success: false, message: "Forbidden: Cannot cancel another employee's comp-off request." });
                        }
                        if (existing.status !== 'PENDING') {
                            return reply.code(400).send({ success: false, message: "Only PENDING comp-off requests can be cancelled." });
                        }
                    }
                }
            }

            const currentUserId = request.user?.userId || request.user?.superAdminId || null;
            const updated = await service.updateStatus(Number(id), companyId, request.body, currentUserId);

            return reply.send({
                success: true,
                message: `Comp-off request ${updated.status.toLowerCase()} successfully`,
                data: updated
            });
        } catch (error) {
            return reply.code(400).send({ success: false, message: error.message });
        }
    }

    async delete(request, reply) {
        try {
            const { id } = request.params;
            let companyId = request.user?.companyId;
            if (request.user?.role === 'SUPER_ADMIN' || request.user?.role === 'OWNER') {
                companyId = request.query.companyId || companyId;
            }

            const existing = await service.getById(Number(id), companyId);
            if (!existing) {
                return reply.code(404).send({ success: false, message: "Comp-off request not found." });
            }

            if (request.user?.role === 'USER') {
                const canManage = await checkCanManageCompOff(request.user);
                if (!canManage) {
                    if (Number(existing.userId) !== Number(request.user?.userId)) {
                        return reply.code(403).send({ success: false, message: "Forbidden: You cannot cancel another employee's comp-off request." });
                    }
                    if (existing.status !== 'PENDING') {
                        return reply.code(400).send({ success: false, message: "Only PENDING comp-off requests can be cancelled." });
                    }
                }
            }

            await service.delete(Number(id), companyId);
            return reply.send({ success: true, message: "Comp-off request cancelled successfully" });
        } catch (error) {
            return reply.code(400).send({ success: false, message: error.message });
        }
    }
}

module.exports = new CompOffRequestController();
