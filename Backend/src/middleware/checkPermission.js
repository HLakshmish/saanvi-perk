function requirePermission(permissionCode) {
    return async function(request, reply) {
        // OWNER and SUPERADMIN bypass permission checks
        if (request.user.role === 'OWNER' || request.user.role === 'SUPERADMIN') {
            return; 
        }
        
        // If it's a regular user, check their permissions array in the JWT payload
        if (request.user.role === 'USER') {
            const userPermissions = request.user.permissions || [];
            if (!userPermissions.includes(permissionCode)) {
                return reply.code(403).send({ 
                    success: false, 
                    message: `Forbidden: Missing required permission '${permissionCode}'` 
                });
            }
            return;
        }

        // Catch-all denial
        return reply.code(403).send({ success: false, message: "Forbidden" });
    };
}

module.exports = requirePermission;
