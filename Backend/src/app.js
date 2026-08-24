const Fastify = require("fastify");
const corsPlugin = require("./plugins/cors");
const swaggerPlugin = require("./plugins/swagger");
const jwtPlugin = require("./plugins/jwt");
const multipartPlugin = require("./plugins/multipart");
require("dotenv").config();

const app = Fastify({
    logger: true,
});

// Register plugins
app.register(corsPlugin);
app.register(swaggerPlugin);
app.register(jwtPlugin);
app.register(multipartPlugin);

// Routes
app.get("/", async (request, reply) => {
    return {
        message: "Hello Fastify",
    };
});

app.register(require("./auth/auth.route"), { prefix: "/api/auth" });
app.register(require("./superAdmin/superAdmin.route"), { prefix: "/api/super-admin" });
app.register(require("./Organisation/company/company.route"), { prefix: "/api/companies" });
app.register(require("./Organisation/role/role.route"), { prefix: "/api/roles" });
app.register(require("./Organisation/department/department.route"), { prefix: "/api/departments" });
app.register(require("./Organisation/Location/location.route"), { prefix: "/api/locations" });
app.register(require("./Organisation/designation/designation.route"), { prefix: "/api/designations" });
app.register(require("./Organisation/calendar/calendar.route"), { prefix: "/api/calendars" });
app.register(require("./Organisation/holiday/holiday.route"), { prefix: "/api/holidays" });
app.register(require("./UsersDetails/user/user.route"), { prefix: "/api/users" });
app.register(require("./UsersDetails/personalinfo/personalinfo.route"), {
    prefix: "/api/personal-information"
});
app.register(require("./UsersDetails/parentinfo/parentinfo.route"), {
    prefix: "/api/parent-info"
});
app.register(require("./UsersDetails/addressinfo/addressinfo.route"), {
    prefix: "/api/address-info"
});
app.register(require("./UsersDetails/bankdetails/bankdetails.route"), {
    prefix: "/api/bank-details"
});
app.register(require("./UsersDetails/pfdetail/pfdetail.route"), {
    prefix: "/api/pf-details"
});
app.register(require("./UsersDetails/esidetail/esidetail.route"), {
    prefix: "/api/esi-details"
});
app.register(require("./UsersDetails/insurancedetail/insurancedetail.route"), {
    prefix: "/api/insurance-details"
});
app.register(require("./UsersDetails/employeedocument/employeedocument.route"), {
    prefix: "/api/employee-documents"
});
app.register(require("./Attendance/attendance.route"), { prefix: "/api/attendances" });
app.register(require("./Attendance/weekOff/weekOff.route"), { prefix: "/api/week-offs" });
app.register(require("./Leave/leaveType/leaveType.route"), { prefix: "/api/leave-types" });
app.register(require("./Leave/leaveRequest/leaveRequest.route"), { prefix: "/api/leave-requests" });
app.register(require("./Leave/leavePolicies/leavePolicy.route"), { prefix: "/api/leave-policies" });
app.register(require("./Leave/leavePolicyRules/leavePolicyRule.route"), { prefix: "/api/leave-policy-rules" });
app.register(require("./Leave/leavePolicyAccumulations/leavePolicyAccumulation.route"), { prefix: "/api/leave-policy-accumulations" });
app.register(require("./Leave/leave_accumulations/leave_accumulation.route"), { prefix: "/api/leave-accumulations" });
app.register(require("./Leave/year_end_process/year_end_process.route"), { prefix: "/api/leave-year-end-processes" });
app.register(require("./Leave/COMP-OFF/compOffPolicy/compOffPolicy.route"), { prefix: "/api/comp-off-policies" });
app.register(require("./Leave/COMP-OFF/compOffAssign/compOffAssign.route"), { prefix: "/api/comp-off-assigns" });
app.register(require("./Organisation/assets/asset.route"), { prefix: "/api/assets" });
app.register(require("./Reimbursement/reimbursement.route"), { prefix: "/api/reimbursements" });

module.exports = app;
// Trigger restart