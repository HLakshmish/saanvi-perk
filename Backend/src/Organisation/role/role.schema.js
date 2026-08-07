const roleResponseProperties = {
    roleId: { type: 'number' },
    companyId: { type: 'number' },
    roleName: { type: 'string' },
    roleCode: { type: 'string' },
    description: { type: 'string', nullable: true },
    status: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    rolePermissions: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                permissionId: { type: 'number' },
                permission: {
                    type: 'object',
                    properties: {
                        permissionId: { type: 'number' },
                        permissionName: { type: 'string' },
                        permissionCode: { type: 'string' },
                        module: { type: 'string' }
                    }
                }
            }
        }
    }
};

const createRoleSchema = {
    description: 'Create a new role',
    tags: ['Role'],
    summary: 'Create a role with permissions',
    body: {
        type: 'object',
        required: ['roleName', 'roleCode'],
        properties: {
            roleName: { type: 'string' },
            roleCode: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'boolean', default: true },
            companyId: { type: 'number', description: 'Required for OWNER' },
            permissionIds: { 
                type: 'array', 
                items: { type: 'number' },
                description: 'List of permission IDs to assign'
            }
        }
    },
    response: {
        201: {
            description: 'Successful response',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: roleResponseProperties
                }
            }
        }
    }
};

const getRoleByIdSchema = {
    description: 'Get role by ID',
    tags: ['Role'],
    summary: 'Retrieve role details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' }
        }
    },
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' }
        }
    },
    response: {
        200: {
            description: 'Successful response',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: roleResponseProperties
                }
            }
        }
    }
};

const getAllRolesSchema = {
    description: 'Get all roles',
    tags: ['Role'],
    summary: 'List all roles for a company',
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' }
        }
    },
    response: {
        200: {
            description: 'Successful response',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: roleResponseProperties
                    }
                }
            }
        }
    }
};

const updateRoleSchema = {
    description: 'Update a role',
    tags: ['Role'],
    summary: 'Update role and permissions',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' }
        }
    },
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' }
        }
    },
    body: {
        type: 'object',
        properties: {
            roleName: { type: 'string' },
            roleCode: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'boolean' },
            permissionIds: { 
                type: 'array', 
                items: { type: 'number' }
            }
        }
    },
    response: {
        200: {
            description: 'Successful response',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: roleResponseProperties
                }
            }
        }
    }
};

const deleteRoleSchema = {
    description: 'Delete a role',
    tags: ['Role'],
    summary: 'Delete role by ID',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' }
        }
    },
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' }
        }
    },
    response: {
        200: {
            description: 'Successful response',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

const getAllPermissionsSchema = {
    description: 'Get all permissions',
    tags: ['Role'],
    summary: 'List all available permissions',
    response: {
        200: {
            description: 'Successful response',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            permissionId: { type: 'number' },
                            permissionName: { type: 'string' },
                            permissionCode: { type: 'string' },
                            module: { type: 'string' },
                            description: { type: 'string', nullable: true }
                        }
                    }
                }
            }
        }
    }
};

module.exports = {
    createRoleSchema,
    getRoleByIdSchema,
    getAllRolesSchema,
    updateRoleSchema,
    deleteRoleSchema,
    getAllPermissionsSchema
};
