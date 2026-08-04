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

        // 3. Check if it's a regular User
        const bcrypt = require("bcrypt");
        const regularUser = await prisma.user.findUnique({
            where: { officialEmail: email },
            include: {
                role: {
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        });

        if (regularUser) {
            const isMatch = await bcrypt.compare(password, regularUser.password);
            if (isMatch) {
                if (regularUser.status !== 'ACTIVE') {
                    throw new Error("User account is not active");
                }

                // Update last login
                await prisma.user.update({
                    where: { userId: regularUser.userId },
                    data: { lastLogin: new Date() }
                });

                const permissions = regularUser.role.rolePermissions.map(rp => rp.permission.permissionCode);

                return {
                    userId: regularUser.userId,
                    email: regularUser.officialEmail,
                    role: 'USER',
                    companyId: regularUser.companyId,
                    permissions: permissions
                };
            }
        }

        throw new Error("Invalid email or password");
    }
}

module.exports = new AuthService();
