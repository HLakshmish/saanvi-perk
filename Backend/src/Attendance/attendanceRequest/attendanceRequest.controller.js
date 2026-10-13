const attendanceRequestService = require("./attendanceRequest.service");
const prisma = require("../../config/prisma");

async function checkCanViewAllAttendanceRequests(user) {
    if (!user) return false;
    if (['OWNER', 'SUPERADMIN', 'ADMIN', 'HR', 'MANAGER'].includes(user.role)) return true;
    const perms = user.permissions || [];
    if (
        perms.includes('VIEW_ATTENDANCE_REQUESTS') ||
        perms.includes('MANAGE_ATTENDANCE_REQUESTS') ||
        perms.includes('VIEW_ATTENDANCE') ||
        perms.includes('MANAGE_ATTENDANCE') ||
        perms.includes('VIEW_COMPANY')
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
                        rp.permission?.permissionCode === 'VIEW_ATTENDANCE_REQUESTS' ||
                        rp.permission?.permissionCode === 'MANAGE_ATTENDANCE_REQUESTS' ||
                        rp.permission?.permissionCode === 'VIEW_ATTENDANCE'
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
            const data = { ...request.body, companyId: request.user.companyId, userId: request.user.userId };
            const req = await attendanceRequestService.createRequest(data);
            reply.code(201).send({ success: true, message: "Attendance request submitted successfully", data: req });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
    
    async getAllRequests(request, reply) {
        try {
            const query = { companyId: request.user.companyId };
            const canViewAll = await checkCanViewAllAttendanceRequests(request.user);
            if (!canViewAll) {
                query.userId = request.user.userId;
            } else if (request.query.userId) {
                query.userId = Number(request.query.userId);
            }
            
            if (request.query.status) {
                query.status = request.query.status;
            }
            
            const reqs = await attendanceRequestService.getAllRequests(query);
            reply.code(200).send({ success: true, data: reqs });
        } catch (error) { reply.code(500).send({ success: false, message: error.message }); }
    }

    async updateRequestStatus(request, reply) {
        try {
            const data = {
                status: request.body.status,
                rejectionReason: request.body.rejectionReason,
                approvedBy: ['SUPERADMIN', 'OWNER'].includes(request.user.role) ? null : request.user.userId
            };
            const req = await attendanceRequestService.updateRequestStatus(Number(request.params.id), data);
            reply.code(200).send({ success: true, message: "Request status updated successfully", data: req });
        } catch (error) { reply.code(400).send({ success: false, message: error.message }); }
    }
}

module.exports = new AttendanceRequestController();
