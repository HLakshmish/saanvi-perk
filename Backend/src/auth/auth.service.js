const prisma = require("../config/prisma");

// Hardcoded static Owner credentials
const OWNER_EMAIL = "owner@gmail.com";
const OWNER_PASSWORD = "Owner@123";

class AuthService {
    async login(email, password) {
        // 1. Check if it's the static Owner
        if (email === OWNER_EMAIL && password === OWNER_PASSWORD) {
            return {
                userId: 0,
                email: OWNER_EMAIL,
                role: 'OWNER',
                companyId: null
            };
        }

        // 2. Check if it's a SuperAdmin
        const superAdmin = await prisma.superAdmin.findUnique({
            where: { email }
        });

        if (superAdmin) {
            // Using plain text check as currently implemented in company module
            if (superAdmin.password === password) {
                // Update last login
                await prisma.superAdmin.update({
                    where: { superAdminId: superAdmin.superAdminId },
                    data: { lastLogin: new Date() }
                });

                return {
                    userId: superAdmin.superAdminId,
                    email: superAdmin.email,
                    role: 'SUPERADMIN',
                    companyId: superAdmin.companyId
                };
            }
        }

        throw new Error("Invalid email or password");
    }
}

module.exports = new AuthService();
