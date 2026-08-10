const claimResponseProperties = {
    claimId: { type: 'number' },
    companyId: { type: 'number' },
    userId: { type: 'number' },
    claimNumber: { type: 'string' },
    reimbursementType: { type: 'string' },
    claimDate: { type: 'string', format: 'date-time' },
    totalAmount: { type: 'number' },
    approvedAmount: { type: 'number', nullable: true },
    description: { type: 'string', nullable: true },
    status: { type: 'string' },
    submittedAt: { type: 'string', format: 'date-time', nullable: true },
    approvedBy: { type: 'number', nullable: true },
    approvedAt: { type: 'string', format: 'date-time', nullable: true },
    rejectionReason: { type: 'string', nullable: true },
    paymentDate: { type: 'string', format: 'date-time', nullable: true },
    remarks: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

const createClaimSchema = {
    description: 'Create a new reimbursement claim',
    tags: ['Reimbursement'],
    summary: 'Create a reimbursement claim',
    body: {
        type: 'object',
        required: ['reimbursementType', 'totalAmount'],
        properties: {
            reimbursementType: { type: 'string' },
            claimDate: { type: 'string', format: 'date-time' },
            totalAmount: { type: 'number' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['DRAFT', 'SUBMITTED'] },
            userId: { type: 'number', description: 'Required for HR/ADMIN to create for someone else' },
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
                data: {
                    type: 'object',
                    properties: claimResponseProperties
                }
            }
        }
    }
};

const getClaimByIdSchema = {
    description: 'Get reimbursement claim by ID',
    tags: ['Reimbursement'],
    summary: 'Retrieve reimbursement claim details',
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
                    type: 'object' // Freeform since we include nested objects
                }
            }
        }
    }
};

const getAllClaimsSchema = {
    description: 'Get all reimbursement claims',
    tags: ['Reimbursement'],
    summary: 'List all reimbursement claims',
    querystring: {
        type: 'object',
        properties: {
            companyId: { type: 'number', description: 'Required for OWNER' },
            userId: { type: 'number', description: 'Filter by specific user' }
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
                        properties: claimResponseProperties
                    }
                }
            }
        }
    }
};

const updateClaimSchema = {
    description: 'Update a reimbursement claim',
    tags: ['Reimbursement'],
    summary: 'Update reimbursement claim details',
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
            reimbursementType: { type: 'string' },
            claimDate: { type: 'string', format: 'date-time' },
            totalAmount: { type: 'number' },
            description: { type: 'string' },
            status: { type: 'string' },
            companyId: { type: 'number' }
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
                    properties: claimResponseProperties
                }
            }
        }
    }
};

const updateClaimStatusSchema = {
    description: 'Update a reimbursement claim status',
    tags: ['Reimbursement'],
    summary: 'Approve, Reject or Pay reimbursement claim',
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
        required: ['status'],
        properties: {
            status: { type: 'string', enum: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED'] },
            approvedAmount: { type: 'number' },
            rejectionReason: { type: 'string' },
            paymentDate: { type: 'string', format: 'date-time' },
            remarks: { type: 'string' }
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
                    properties: claimResponseProperties
                }
            }
        }
    }
};

const deleteClaimSchema = {
    description: 'Delete a reimbursement claim',
    tags: ['Reimbursement'],
    summary: 'Delete reimbursement claim by ID',
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

const uploadBillSchema = {
    description: 'Upload a bill for a claim',
    tags: ['Reimbursement'],
    summary: 'Upload bill document (multipart/form-data)',
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        properties: {
            claimId: { type: 'string', description: 'ID of the reimbursement claim' },
            companyId: { type: 'string', description: 'Company ID (optional)' },
            billNumber: { type: 'string', description: 'Bill Number (optional)' },
            billDate: { type: 'string', format: 'date', description: 'Date of the bill (optional)' },
            billAmount: { type: 'string', description: 'Total amount of the bill' },
            vendorName: { type: 'string', description: 'Name of the vendor (optional)' },
            file: { type: 'string', format: 'binary', description: 'The bill document to upload' }
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
                    properties: {
                        billId: { type: 'number' },
                        claimId: { type: 'number' },
                        billNumber: { type: 'string', nullable: true },
                        billAmount: { type: 'number' },
                        fileName: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }
};

const downloadBillSchema = {
    description: 'Download a bill document',
    tags: ['Reimbursement'],
    summary: 'Download bill by ID',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' }
        }
    }
};

const deleteBillSchema = {
    description: 'Delete a bill from a claim',
    tags: ['Reimbursement'],
    summary: 'Delete bill by ID',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'number' }
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

const getClaimHistorySchema = {
    description: 'Get history of a reimbursement claim',
    tags: ['Reimbursement'],
    summary: 'Retrieve audit history of a specific reimbursement claim',
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
                    type: 'array',
                    items: {
                        type: 'object'
                    }
                }
            }
        }
    }
};

module.exports = {
    createClaimSchema,
    getClaimByIdSchema,
    getAllClaimsSchema,
    updateClaimSchema,
    updateClaimStatusSchema,
    deleteClaimSchema,
    uploadBillSchema,
    downloadBillSchema,
    deleteBillSchema,
    getClaimHistorySchema
};
