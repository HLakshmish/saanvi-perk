const compOffAssignResponseProperties = {
    id: { type: 'number' },
    companyId: { type: 'number' },
    userId: { type: 'number' },
    policyId: { type: 'number' },
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' },
    status: { type: 'boolean' },
    createdBy: { type: 'number', nullable: true },
    updatedBy: { type: 'number', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createCompOffAssignSchema = {
    description: 'Assign a Comp Off Policy to one or more users',
    tags: ['Comp Off Assign'],
    summary: 'Assign Comp Off Policy',
    body: {
        type: 'object',
        required: ['userIds', 'policyId', 'startDate', 'endDate'],
        properties: {
            userIds: { 
                type: 'array',
                items: { type: 'number' }
            },
            policyId: { type: 'number' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            status: { type: 'boolean', default: true },
            companyId: { type: 'number', description: 'Required for OWNER' }
        }
    },
    response: {
        201: {
            description: 'Successful response',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                count: { type: 'number' }
            }
        }
    }
};

const getCompOffAssignByIdSchema = {
    description: 'Get Comp Off Assignment by ID',
    tags: ['Comp Off Assign'],
    summary: 'Retrieve Comp Off Assignment details',
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
                    properties: compOffAssignResponseProperties
                }
            }
        }
    }
};

const getAllCompOffAssignsSchema = {
    description: 'Get all Comp Off Assignments',
    tags: ['Comp Off Assign'],
    summary: 'List all Comp Off Assignments for a company',
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' },
            userId: { type: 'number', description: 'Filter by user ID' },
            policyId: { type: 'number', description: 'Filter by policy ID' }
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
                        properties: compOffAssignResponseProperties
                    }
                }
            }
        }
    }
};

const updateCompOffAssignSchema = {
    description: 'Update a Comp Off Assignment',
    tags: ['Comp Off Assign'],
    summary: 'Update Comp Off Assignment details',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' }
        }
    },
    body: {
        type: 'object',
        properties: {
            userId: { type: 'number', description: 'Reassign to specific user' },
            policyId: { type: 'number' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            status: { type: 'boolean' },
            companyId: { type: 'number', description: 'Required for OWNER' }
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
                    properties: compOffAssignResponseProperties
                }
            }
        }
    }
};

const deleteCompOffAssignSchema = {
    description: 'Delete a Comp Off Assignment',
    tags: ['Comp Off Assign'],
    summary: 'Delete Comp Off Assignment by ID',
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

const getUserCompOffDetailsSchema = {
    description: 'Get total Comp-Off eligible days and eligible day details for a user based on policy',
    tags: ['Comp Off Assign'],
    summary: 'Get user Comp-Off eligible days & details',
    querystring: {
        type: 'object',
        properties: {
            userId: { type: 'number', description: 'User ID (Only Admin/HR can query other users)' },
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
                    properties: {
                        userId: { type: 'number' },
                        employeeCode: { type: 'string' },
                        employeeName: { type: 'string' },
                        policyName: { type: 'string', nullable: true },
                        availabilityDays: { type: 'number', nullable: true },
                        totalCompOffDays: { type: 'number', description: 'Total available comp-off days to use' },
                        totalEligibleDays: { type: 'number' },
                        remainingCompOffDays: { type: 'number' },
                        usedCompOffDays: { type: 'number' },
                        totalAvailed: { type: 'number' },
                        validEarned: { type: 'number' },
                        eligibleDays: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    accumulationId: { type: 'number' },
                                    date: { type: 'string', format: 'date-time' },
                                    earnedCompOffDays: { type: 'number', description: 'Comp-off days earned for this worked date' },
                                    numberOfLeaves: { type: 'number' },
                                    validFrom: { type: 'string', format: 'date-time' },
                                    validTo: { type: 'string', format: 'date-time' },
                                    daysRemaining: { type: 'number', nullable: true },
                                    note: { type: 'string', nullable: true }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

const getAdminCompOffOverviewSchema = {
    description: 'Get company-wide comp-off balance summary for all employees (Admin/HR view)',
    tags: ['Comp Off Assign'],
    summary: 'Get all employees comp-off overview',
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' },
            departmentId: { type: 'number', description: 'Filter by Department' },
            userId: { type: 'number', description: 'Filter by User ID' },
            policyId: { type: 'number', description: 'Filter by Policy ID' },
            search: { type: 'string', description: 'Search by employee name or code' }
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
                    properties: {
                        totalEmployees: { type: 'number' },
                        employees: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    userId: { type: 'number' },
                                    employeeCode: { type: 'string' },
                                    firstName: { type: 'string' },
                                    lastName: { type: 'string', nullable: true },
                                    officialEmail: { type: 'string' },
                                    department: {
                                        type: 'object',
                                        nullable: true,
                                        properties: {
                                            departmentId: { type: 'number' },
                                            departmentName: { type: 'string' }
                                        }
                                    },
                                    designation: {
                                        type: 'object',
                                        nullable: true,
                                        properties: {
                                            designationId: { type: 'number' },
                                            designationName: { type: 'string' }
                                        }
                                    },
                                    assignedPolicy: {
                                        type: 'object',
                                        nullable: true,
                                        properties: {
                                            policyId: { type: 'number' },
                                            policyName: { type: 'string' },
                                            availabilityDays: { type: 'number', nullable: true },
                                            leaveType: {
                                                type: 'object',
                                                nullable: true,
                                                properties: {
                                                    leaveTypeId: { type: 'number' },
                                                    leaveName: { type: 'string' },
                                                    leaveCode: { type: 'string' }
                                                }
                                            }
                                        }
                                    },
                                    summary: {
                                        type: 'object',
                                        properties: {
                                            totalEarned: { type: 'number' },
                                            totalExpired: { type: 'number' },
                                            validEarned: { type: 'number' },
                                            totalAvailed: { type: 'number' },
                                            usedCompOffDays: { type: 'number' },
                                            remainingCompOffDays: { type: 'number' },
                                            totalPending: { type: 'number' },
                                            validAvailableCount: { type: 'number' },
                                            availableBalance: { type: 'number' },
                                            latestEarnedDate: { type: 'string', format: 'date-time', nullable: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

module.exports = {
    createCompOffAssignSchema,
    getCompOffAssignByIdSchema,
    getAllCompOffAssignsSchema,
    updateCompOffAssignSchema,
    deleteCompOffAssignSchema,
    getUserCompOffDetailsSchema,
    getAdminCompOffOverviewSchema
};
