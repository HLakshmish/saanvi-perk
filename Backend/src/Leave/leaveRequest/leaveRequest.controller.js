const leaveRequestService = require("./leaveRequest.service");
// Triggering server restart for new prisma client
class LeaveRequestController {
    async createLeaveRequest(request, reply) {
        try {
            const { companyId, userId, ...leaveRequestData } = request.body;
            
            // Determine the target company ID
            let targetCompanyId = request.user.companyId;
            let targetUserId = request.user.userId;

            if (request.user.role === 'OWNER') {
                if (!companyId) throw new Error("OWNER must provide a companyId to create a leave request.");
                targetCompanyId = companyId;
                if (userId) targetUserId = userId; // Owner can apply for others
            } else if (request.user.role === 'SUPERADMIN' || request.user.role === 'ADMIN' || request.user.role === 'HR') {
                targetCompanyId = request.user.companyId;
                if (userId) targetUserId = userId; // HR/Admin can apply for others
            } else {
                targetCompanyId = request.user.companyId;
                if (userId && userId !== request.user.userId) {
                    return reply.code(403).send({ success: false, message: "Forbidden: Cannot apply leave for another user." });
                }
            }

            leaveRequestData.companyId = targetCompanyId;
            leaveRequestData.userId = targetUserId;

            // Ensure dates are correctly formatted
            leaveRequestData.fromDate = new Date(leaveRequestData.fromDate);
            leaveRequestData.toDate = new Date(leaveRequestData.toDate);

            const leaveRequest = await leaveRequestService.createLeaveRequest(leaveRequestData);
            reply.code(201).send({ success: true, message: "Leave request created successfully", data: leaveRequest });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async getLeaveRequestById(request, reply) {
        try {
            const { id } = request.params;
            
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            const leaveRequest = await leaveRequestService.getLeaveRequestById(Number(id), companyId);
            
            // Basic check so normal users only see their own requests (can be refined via permissions)
            if (request.user.role === 'USER' && leaveRequest.userId !== request.user.userId) {
                const hasViewLeavesPermission = request.user.permissions && (request.user.permissions.includes('VIEW_LEAVES') || request.user.permissions.includes('MANAGE_LEAVES'));
                if (!hasViewLeavesPermission) {
                    return reply.code(403).send({ success: false, message: "Forbidden: Cannot view other user's leave request." });
                }
            }

            reply.code(200).send({ success: true, data: leaveRequest });
        } catch (error) {
            reply.code(404).send({ success: false, message: error.message });
        }
    }

    async getAllLeaveRequests(request, reply) {
        try {
            let companyId = request.user.companyId;
            let filterUserId = request.query.userId ? Number(request.query.userId) : undefined;

            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            } else if (request.user.role === 'USER') {
                const hasViewLeavesPermission = request.user.permissions && (request.user.permissions.includes('VIEW_LEAVES') || request.user.permissions.includes('MANAGE_LEAVES'));
                if (!hasViewLeavesPermission) {
                    filterUserId = request.user.userId; // Regular users only see their own
                }
            }

            const leaveRequests = await leaveRequestService.getAllLeaveRequests(companyId, filterUserId);
            reply.code(200).send({ success: true, data: leaveRequests });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    async updateLeaveRequestStatus(request, reply) {
        try {
            const { id } = request.params;
            const { companyId, status, rejectionReason, remarks } = request.body;

            let targetCompanyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                targetCompanyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            } 
            
            // Only specific roles can approve/reject
            if (['APPROVED', 'REJECTED'].includes(status) && request.user.role === 'USER') {
                const hasManageLeavesPermission = request.user.permissions && request.user.permissions.includes('MANAGE_LEAVES');
                if (!hasManageLeavesPermission) {
                    return reply.code(403).send({ success: false, message: "Forbidden: Not authorized to approve/reject leave requests." });
                }
            }

            const statusData = {
                status,
                remarks,
                rejectionReason
            };

            if (['APPROVED', 'REJECTED'].includes(status)) {
                // SUPERADMIN and OWNER exist in separate tables, not User. 
                // Assigning their ID to approvedBy causes a Foreign Key constraint error.
                if (request.user.role !== 'SUPERADMIN' && request.user.role !== 'OWNER') {
                    statusData.approvedBy = request.user.userId;
                } else {
                    statusData.approvedBy = null;
                }
                statusData.approvedAt = new Date();
            }

            const leaveRequest = await leaveRequestService.updateLeaveRequestStatus(Number(id), targetCompanyId, statusData);
            reply.code(200).send({ success: true, message: `Leave request ${status.toLowerCase()} successfully`, data: leaveRequest });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async deleteLeaveRequest(request, reply) {
        try {
            const { id } = request.params;
            
            let companyId = request.user.companyId;
            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            }

            // Optional: You might want to allow users to delete their own "PENDING" requests.
            // For now, adhering to MANAGE_LEAVE_REQUESTS permission.

            await leaveRequestService.deleteLeaveRequest(Number(id), companyId);
            reply.code(200).send({ success: true, message: "Leave request deleted successfully" });
        } catch (error) {
            reply.code(400).send({ success: false, message: error.message });
        }
    }

    async downloadReport(request, reply) {
        try {
            let companyId = request.user.companyId;
            let filterUserId = request.query.userId ? Number(request.query.userId) : undefined;

            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            } else if (request.user.role === 'USER') {
                const hasViewLeavesPermission = request.user.permissions && (request.user.permissions.includes('VIEW_LEAVES') || request.user.permissions.includes('MANAGE_LEAVES'));
                if (!hasViewLeavesPermission) {
                    filterUserId = request.user.userId;
                }
            }

            const leaveRequests = await leaveRequestService.getAllLeaveRequests(companyId, filterUserId);
            
            const headers = ['Leave Request ID', 'User ID', 'Leave Type ID', 'From Date', 'To Date', 'Number Of Days', 'Status', 'Reason', 'Remarks', 'Approved By'];
            
            const csvRows = leaveRequests.map(l => [
                l.leaveRequestId,
                l.userId,
                l.leaveTypeId,
                l.fromDate ? new Date(l.fromDate).toISOString().split('T')[0] : '',
                l.toDate ? new Date(l.toDate).toISOString().split('T')[0] : '',
                l.numberOfDays || 0,
                l.status || '',
                `"${(l.reason || '').replace(/"/g, '""')}"`,
                `"${(l.remarks || '').replace(/"/g, '""')}"`,
                l.approvedBy || ''
            ]);

            const csvString = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

            reply.header('Content-Type', 'text/csv');
            reply.header('Content-Disposition', 'attachment; filename="leave_report.csv"');
            return reply.send(csvString);
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }

    async viewReport(request, reply) {
        try {
            let companyId = request.user.companyId;
            let filterUserId = request.query.userId ? Number(request.query.userId) : undefined;

            if (request.user.role === 'OWNER') {
                companyId = request.query.companyId ? Number(request.query.companyId) : undefined;
            } else if (request.user.role === 'USER') {
                const hasViewLeavesPermission = request.user.permissions && (request.user.permissions.includes('VIEW_LEAVES') || request.user.permissions.includes('MANAGE_LEAVES'));
                if (!hasViewLeavesPermission) {
                    filterUserId = request.user.userId;
                }
            }

            const leaveRequests = await leaveRequestService.getAllLeaveRequests(companyId, filterUserId);
            reply.code(200).send({ success: true, data: leaveRequests });
        } catch (error) {
            reply.code(500).send({ success: false, message: error.message });
        }
    }
}

module.exports = new LeaveRequestController();
