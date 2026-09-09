const prisma = require("../config/prisma");

function requirePermission(permissionCode) {
    return async function(request, reply) {
        // OWNER and SUPERADMIN bypass permission checks
        if (request.user.role === 'OWNER' || request.user.role === 'SUPERADMIN') {
            return; 
        }
        
        // If it's a regular user, check their permissions array
        if (request.user.role === 'USER') {
            const userPermissions = request.user.permissions || [];
            
            // 1. Fast path: Token payload already has the permission
            if (userPermissions.includes(permissionCode)) {
                return;
            }

            // 2. Fallback: If JWT is stale (e.g., permissions or roles were granted after login),
            // verify fresh permissions directly from the database
            if (request.user.userId) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { userId: request.user.userId },
                        include: {
                            userRoles: {
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
                            }
                        }
                    });

                    if (dbUser && dbUser.userRoles) {
                        const freshPerms = new Set();
                        dbUser.userRoles.forEach(ur => {
                            if (ur.role && ur.role.rolePermissions) {
                                ur.role.rolePermissions.forEach(rp => {
                                    if (rp.permission) freshPerms.add(rp.permission.permissionCode);
                                });
                            }
                        });

                        // Cache on request for downstream handlers
                        request.user.permissions = Array.from(freshPerms);

                        if (freshPerms.has(permissionCode)) {
                            return;
                        }
                    }
                } catch (err) {
                    if (request.log && request.log.error) {
                        request.log.error(err, "Failed to verify fresh permissions from database");
                    }
                }
            }

            return reply.code(403).send({ 
                success: false, 
                message: `Forbidden: Missing required permission '${permissionCode}'` 
            });
        }

        // Catch-all denial
        return reply.code(403).send({ success: false, message: "Forbidden" });
    };
}

module.exports = requirePermission;
