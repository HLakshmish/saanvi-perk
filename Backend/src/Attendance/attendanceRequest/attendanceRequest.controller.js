const attendanceRequestService = require("./attendanceRequest.service");
const prisma = require("../../config/prisma");

async function checkCanManageAttendanceRequests(user) {
    if (!user) return false;
    if (['OWNER', 'SUPERADMIN', 'ADMIN', 'HR', 'MANAGER'].includes(user.role)) return true;
    const perms = user.permissions || [];
    if (
        perms.includes('MANAGE_ATTENDANCE_REQUESTS') ||
        perms.includes('MANAGE_ATTENDANCE')
    ) {
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
                        rp.permission?.permissionCode === 'MANAGE_ATTENDANCE_REQUESTS' ||
                        rp.permission?.permissionCode === 'MANAGE_ATTENDANCE'
                    );
                    return hasPerm ||
                           code.includes('ADMIN') || code.includes('HR') || code.includes('MGR') || code.includes('MANAGER') ||
                           name.includes('ADMIN') || name.includes('HR') || name.includes('MANAGER');
                });
            }
        } catch (e) {
            console.error("Error checking attendance request permissions:", e);
        }
    }
    return false;
}

class AttendanceRequestController {
    async createRequest(request, reply) {
        try {
            let targetUserId = Number(request.user?.userId);
            if (request.body.userId && Number(request.body.userId) !== targetUserId) {
                const canManage = await checkCanManageAttendanceRequests(request.user);
                if (!canManage) {
                    return reply.code(403).send({ success: false, message: "Forbidden: Cannot submit attendance request on behalf of another user." });
                }
                targetUserId = Number(request.body.userId);
            }

            const data = {
                ...request.body,
                companyId: request.user.companyId,
                userId: targetUserId
            };

            const req = await attendanceRequestService.createRequest(data);
            reply.code(201).send({ success: true, message: "Attendance request submitted successfully", data: req });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }
    
    async getAllRequests(request, reply) {
        try {
            const query = { companyId: request.user.companyId };
            const canManage = await checkCanManageAttendanceRequests(request.user);
            if (!canManage) {
                // Standard users strictly forced to their own requests
                query.userId = Number(request.user.userId);
            } else if (request.query.userId) {
                query.userId = Number(request.query.userId);
            }
            
            if (request.query.status) {
                query.status = request.query.status;
            }
            
            const reqs = await attendanceRequestService.getAllRequests(query);
            reply.code(200).send({ success: true, data: reqs });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    async updateRequestStatus(request, reply) {
        try {
            const { id } = request.params;
            const existing = await attendanceRequestService.getRequestById(Number(id));
            if (!existing || (request.user.role !== 'OWNER' && existing.companyId !== request.user.companyId)) {
                return reply.code(404).send({ success: false, message: "Attendance request not found" });
            }

            const statusUpper = (request.body.status || '').toUpperCase();
            if (['APPROVED', 'REJECTED'].includes(statusUpper)) {
                const canManage = await checkCanManageAttendanceRequests(request.user);
                if (!canManage) {
                    return reply.code(403).send({ success: false, message: "Forbidden: Not authorized to approve or reject attendance requests." });
                }
            } else if (statusUpper === 'CANCELLED') {
                const canManage = await checkCanManageAttendanceRequests(request.user);
                if (!canManage) {
                    if (Number(existing.userId) !== Number(request.user.userId)) {
                        return reply.code(403).send({ success: false, message: "Forbidden: You cannot cancel another employee's attendance request." });
                    }
                    if (existing.status !== 'PENDING') {
                        return reply.code(400).send({ success: false, message: "Only PENDING attendance requests can be cancelled." });
                    }
                }
            } else {
                return reply.code(400).send({ success: false, message: "Invalid status value." });
            }

            const data = {
                status: statusUpper,
                rejectionReason: request.body.rejectionReason,
                approvedBy: ['SUPERADMIN', 'OWNER'].includes(request.user.role) ? null : request.user.userId
            };
            const req = await attendanceRequestService.updateRequestStatus(Number(id), data);
            reply.code(200).send({ success: true, message: `Request status updated to ${statusUpper.toLowerCase()} successfully`, data: req });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async deleteRequest(request, reply) {
        try {
            const { id } = request.params;
            const existing = await attendanceRequestService.getRequestById(Number(id));
            if (!existing || (request.user.role !== 'OWNER' && existing.companyId !== request.user.companyId)) {
                return reply.code(404).send({ success: false, message: "Attendance request not found" });
            }

            const canManage = await checkCanManageAttendanceRequests(request.user);
            if (!canManage) {
                if (Number(existing.userId) !== Number(request.user.userId)) {
                    return reply.code(403).send({ success: false, message: "Forbidden: You cannot cancel another employee's attendance request." });
                }
                if (existing.status !== 'PENDING') {
                    return reply.code(400).send({ success: false, message: "Only PENDING attendance requests can be cancelled." });
                }
            }

            await attendanceRequestService.deleteRequest(Number(id));
            reply.code(200).send({ success: true, message: "Attendance request cancelled successfully" });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }
}

module.exports = new AttendanceRequestController();
