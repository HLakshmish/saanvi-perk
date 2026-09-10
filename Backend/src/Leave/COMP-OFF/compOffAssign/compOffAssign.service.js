const repository = require("./compOffAssign.repository");

function evaluateCompOffForAttendance(att, holidays, weekOffAssigns, policy, assignmentDetails) {
    const attDate = new Date(att.attendanceDate);
    attDate.setHours(0, 0, 0, 0);

    // Check assignment validity dates
    if (assignmentDetails) {
        if (assignmentDetails.startDate) {
            const start = new Date(assignmentDetails.startDate);
            start.setHours(0, 0, 0, 0);
            if (attDate < start) return null;
        }
        if (assignmentDetails.endDate) {
            const end = new Date(assignmentDetails.endDate);
            end.setHours(23, 59, 59, 999);
            if (attDate > end) return null;
        }
    }

    // 1. Check Holiday
    let isHoliday = false;
    let holidayName = "";
    const holiday = holidays.find(h => {
        const start = new Date(h.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(h.endDate);
        end.setHours(23, 59, 59, 999);
        return attDate >= start && attDate <= end;
    });
    if (holiday) {
        isHoliday = true;
        holidayName = holiday.holidayName;
    }

    // 2. Check Week-Off
    let isWeekOff = false;
    let weekOffName = "";
    let activeWeekOffAssign = weekOffAssigns.find(w => {
        const start = new Date(w.startDate);
        start.setHours(0, 0, 0, 0);
        const end = w.endDate ? new Date(w.endDate) : null;
        if (end) end.setHours(23, 59, 59, 999);
        return attDate >= start && (!end || attDate <= end);
    });

    if (!activeWeekOffAssign && weekOffAssigns.length > 0) {
        activeWeekOffAssign = weekOffAssigns[0];
    }

    if (activeWeekOffAssign && activeWeekOffAssign.weekOff && activeWeekOffAssign.weekOff.rules) {
        const dayOfWeekIndex = attDate.getDay();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeekStr = days[dayOfWeekIndex];
        const occurrence = Math.ceil(attDate.getDate() / 7);
        const occurrenceStrings = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
        const occStr = occurrenceStrings[occurrence - 1];

        const matchRule = activeWeekOffAssign.weekOff.rules.find(r =>
            r.dayOfWeek === dayOfWeekStr && (r.frequency === 'Every' || r.frequency === occStr)
        );
        if (matchRule) {
            isWeekOff = true;
            weekOffName = dayOfWeekStr;
        }
    }

    const isEligible = (isHoliday && policy.holidayWorked) || (isWeekOff && policy.weekOffWorked);
    if (!isEligible) return null;

    let earnedCompOffDays = 0;
    if (policy.regularHoursEnabled && att.workingMinutes !== undefined && att.workingMinutes !== null) {
        const fullDayMin = (policy.regularFullDayHours || 0) * 60 + (policy.regularFullDayMinutes || 0);
        const halfDayMin = (policy.regularHalfDayHours || 0) * 60 + (policy.regularHalfDayMinutes || 0);
        if (fullDayMin > 0 && att.workingMinutes >= fullDayMin) {
            earnedCompOffDays = 1.0;
        } else if (halfDayMin > 0 && att.workingMinutes >= halfDayMin) {
            earnedCompOffDays = 0.5;
        } else if (fullDayMin === 0 && halfDayMin === 0) {
            earnedCompOffDays = att.attendanceStatus === 'PRESENT' ? 1.0 : (att.attendanceStatus === 'HALF_DAY' ? 0.5 : 0);
        }
    } else {
        earnedCompOffDays = att.attendanceStatus === 'PRESENT' ? 1.0 : (att.attendanceStatus === 'HALF_DAY' ? 0.5 : 0);
    }

    if (earnedCompOffDays <= 0) return null;

    const durationStr = earnedCompOffDays === 1.0 ? 'Full-Day' : 'Half-Day';
    const note = isHoliday ? `Comp-off for ${durationStr} work on Holiday (${holidayName})` : `Comp-off for ${durationStr} work on Week-Off (${weekOffName})`;

    return {
        attDate,
        earnedCompOffDays,
        note
    };
}

class CompOffAssignService {
    async createMany(data) {
        try {
            return await repository.createMany(data);
        } catch (error) {
            if (error.code === 'P2003') {
                throw new Error("Invalid reference: User, Policy, or Company does not exist.");
            }
            throw error;
        }
    }

    async getById(id, companyId) {
        const record = await repository.getById(id, companyId);
        if (!record) throw new Error("Comp Off Assignment not found");
        return record;
    }

    async getAll(companyId, userId, policyId) {
        return await repository.getAll(companyId, userId, policyId);
    }

    async update(id, companyId, data) {
        try {
            return await repository.update(id, companyId, data);
        } catch (error) {
            if (error.code === 'P2003') {
                throw new Error("Invalid reference: User, Policy, or Company does not exist.");
            }
            throw error;
        }
    }

    async delete(id, companyId) {
        return await repository.delete(id, companyId);
    }

    async getUserCompOffDetails(companyId, userId) {
        const data = await repository.getUserCompOffData(companyId, userId);
        const policy = data.assignedPolicy;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Calculate total availed days (approved leave requests)
        let totalAvailed = 0;
        data.leaveRequests.forEach(req => {
            if (req.status === 'APPROVED') {
                totalAvailed += Number(req.numberOfDays) || 0;
            }
        });

        // 2. Filter & format only eligible (unexpired) comp-off days from attendance
        let validEarned = 0;
        const eligibleDays = [];

        data.attendances.forEach(att => {
            const compOffResult = evaluateCompOffForAttendance(
                att,
                data.holidays,
                data.weekOffAssigns,
                policy,
                data.assignmentDetails
            );

            if (!compOffResult) return;

            const { attDate, earnedCompOffDays, note } = compOffResult;

            // 1. Expiry Date = workedDate + policy.availabilityDays
            let validTo = null;
            if (policy.availabilityDays && policy.availabilityDays > 0) {
                validTo = new Date(attDate);
                validTo.setDate(validTo.getDate() + policy.availabilityDays);
                validTo.setHours(0, 0, 0, 0);
            }

            // 2. remainingDays = expiryDate - today
            let daysRemaining = null;
            if (validTo) {
                const diffMs = validTo.getTime() - today.getTime();
                daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));
            }

            // 3. Only count if remaining days to use comp-off > 0
            const isEligible = daysRemaining !== null ? daysRemaining > 0 : true;

            if (isEligible) {
                validEarned += earnedCompOffDays;
                eligibleDays.push({
                    attendanceId: att.attendanceId,
                    date: att.attendanceDate,
                    earnedCompOffDays,
                    numberOfLeaves: earnedCompOffDays,
                    validFrom: att.attendanceDate,
                    validTo,
                    daysRemaining,
                    note
                });
            }
        });

        const totalCompOffDays = Math.max(0, validEarned - totalAvailed);

        return {
            userId: data.user.userId,
            employeeCode: data.user.employeeCode,
            employeeName: `${data.user.firstName} ${data.user.lastName || ''}`.trim(),
            policyName: policy.policyName,
            availabilityDays: policy.availabilityDays,
            totalCompOffDays,
            totalEligibleDays: totalCompOffDays,
            remainingCompOffDays: totalCompOffDays,
            usedCompOffDays: totalAvailed,
            totalAvailed,
            validEarned,
            eligibleDays
        };
    }

    async getAdminCompOffOverview(companyId, filters = {}) {
        const data = await repository.getAdminCompOffOverview(companyId, filters);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Group attendances by userId
        const attendancesByUser = new Map();
        data.attendances.forEach(att => {
            if (!attendancesByUser.has(att.userId)) {
                attendancesByUser.set(att.userId, []);
            }
            attendancesByUser.get(att.userId).push(att);
        });

        // Group week-offs by userId
        const weekOffsByUser = new Map();
        data.weekOffAssigns.forEach(w => {
            if (!weekOffsByUser.has(w.userId)) {
                weekOffsByUser.set(w.userId, []);
            }
            weekOffsByUser.get(w.userId).push(w);
        });

        // Group leave requests by userId
        const requestsByUser = new Map();
        data.leaveRequests.forEach(req => {
            if (!requestsByUser.has(req.userId)) {
                requestsByUser.set(req.userId, []);
            }
            requestsByUser.get(req.userId).push(req);
        });

        const employees = data.users.map(user => {
            const userAtts = attendancesByUser.get(user.userId) || [];
            const userWeekOffs = weekOffsByUser.get(user.userId) || [];
            const userReqs = requestsByUser.get(user.userId) || [];
            const activeAssignment = user.compOffAssigns && user.compOffAssigns.length > 0 ? user.compOffAssigns[0] : null;
            const policy = activeAssignment ? activeAssignment.policy : null;

            let totalEarned = 0;
            let totalExpired = 0;
            let validEarned = 0;
            let latestEarnedDate = null;

            if (policy && policy.status) {
                userAtts.forEach(att => {
                    const compOffResult = evaluateCompOffForAttendance(
                        att,
                        data.holidays,
                        userWeekOffs,
                        policy,
                        activeAssignment
                    );

                    if (!compOffResult) return;

                    const { attDate, earnedCompOffDays } = compOffResult;

                    let validTo = null;
                    if (policy.availabilityDays && policy.availabilityDays > 0) {
                        validTo = new Date(attDate);
                        validTo.setDate(validTo.getDate() + policy.availabilityDays);
                        validTo.setHours(0, 0, 0, 0);
                    }

                    let daysRemaining = null;
                    if (validTo) {
                        const diffMs = validTo.getTime() - today.getTime();
                        daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));
                    }

                    const isEligible = daysRemaining !== null ? daysRemaining > 0 : true;

                    totalEarned += earnedCompOffDays;
                    if (isEligible) {
                        validEarned += earnedCompOffDays;
                    } else {
                        totalExpired += earnedCompOffDays;
                    }

                    if (!latestEarnedDate || new Date(att.attendanceDate) > new Date(latestEarnedDate)) {
                        latestEarnedDate = att.attendanceDate;
                    }
                });
            }

            let totalAvailed = 0;
            let totalPending = 0;

            userReqs.forEach(req => {
                const days = Number(req.numberOfDays) || 0;
                if (req.status === 'APPROVED') {
                    totalAvailed += days;
                } else if (req.status === 'PENDING') {
                    totalPending += days;
                }
            });

            const validAvailableCount = Math.max(0, validEarned - totalAvailed);

            return {
                userId: user.userId,
                employeeCode: user.employeeCode,
                firstName: user.firstName,
                lastName: user.lastName,
                officialEmail: user.officialEmail,
                department: user.department,
                designation: user.designation,
                assignedPolicy: policy ? {
                    policyId: policy.id,
                    policyName: policy.policyName,
                    availabilityDays: policy.availabilityDays,
                    leaveType: policy.leaveType
                } : null,
                summary: {
                    totalEarned,
                    totalExpired,
                    validEarned,
                    totalAvailed,
                    usedCompOffDays: totalAvailed,
                    remainingCompOffDays: validAvailableCount,
                    totalPending,
                    validAvailableCount,
                    availableBalance: validAvailableCount,
                    latestEarnedDate
                }
            };
        });

        // Filter by policyId if provided
        let filteredEmployees = employees;
        if (filters.policyId) {
            filteredEmployees = filteredEmployees.filter(emp => emp.assignedPolicy && emp.assignedPolicy.policyId === Number(filters.policyId));
        }

        return {
            totalEmployees: filteredEmployees.length,
            employees: filteredEmployees
        };
    }
}

module.exports = new CompOffAssignService();
