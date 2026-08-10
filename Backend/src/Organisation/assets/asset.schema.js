// ============================
// AssetDetails Schemas
// ============================
const assetProperties = {
    assetCode: { type: 'string' },
    assetName: { type: 'string' },
    assetType: { type: 'string' },
    brand: { type: 'string', nullable: true },
    model: { type: 'string', nullable: true },
    serialNumber: { type: 'string', nullable: true },
    purchaseDate: { type: 'string', nullable: true },
    purchasePrice: { type: 'number', nullable: true },
    vendorName: { type: 'string', nullable: true },
    warrantyStartDate: { type: 'string', nullable: true },
    warrantyEndDate: { type: 'string', nullable: true },
    assetStatus: {
        type: 'string',
        enum: ['AVAILABLE', 'ASSIGNED', 'UNDER_REPAIR', 'LOST', 'DAMAGED', 'RETIRED'],
        nullable: true
    },
    description: { type: 'string', nullable: true },
    createdBy: { type: 'number', nullable: true }
};

const assetResponseProperties = {
    assetId: { type: 'number' },
    companyId: { type: 'number' },
    ...assetProperties,
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' }
};

const createAssetSchema = {
    description: 'Create a new asset',
    tags: ['Assets'],
    summary: 'Creates a new asset in the system',
    body: {
        type: 'object',
        required: ['assetCode', 'assetName', 'assetType'],
        properties: assetProperties
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: { type: 'object', properties: assetResponseProperties }
            }
        }
    }
};

const updateAssetSchema = {
    description: 'Update an asset by ID',
    tags: ['Assets'],
    summary: 'Updates an existing asset',
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    body: { type: 'object', properties: assetProperties },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: { type: 'object', properties: assetResponseProperties }
            }
        }
    }
};

const getAssetByIdSchema = {
    description: 'Get an asset by ID',
    tags: ['Assets'],
    summary: 'Retrieves a single asset by its ID',
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object', properties: assetResponseProperties }
            }
        }
    }
};

const getAllAssetsSchema = {
    description: 'Get all assets',
    tags: ['Assets'],
    summary: 'Retrieves a list of all assets for the company',
    querystring: {
        type: 'object',
        properties: {
            assetType: { type: 'string' },
            assetStatus: { type: 'string' },
            brand: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: { type: 'object', properties: assetResponseProperties }
                }
            }
        }
    }
};

const deleteAssetSchema = {
    description: 'Delete an asset by ID',
    tags: ['Assets'],
    summary: 'Deletes an asset record',
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ============================
// AssetAssignment Schemas
// ============================
const assignmentProperties = {
    assetId: { type: 'number' },
    userId: { type: 'number' },
    assignedDate: { type: 'string' },
    expectedReturnDate: { type: 'string', nullable: true },
    returnedDate: { type: 'string', nullable: true },
    assignmentStatus: { type: 'string', nullable: true },
    conditionAtAssignment: { type: 'string', nullable: true },
    conditionAtReturn: { type: 'string', nullable: true },
    assignedBy: { type: 'number', nullable: true },
    returnedBy: { type: 'number', nullable: true },
    remarks: { type: 'string', nullable: true }
};

const assignmentResponseProperties = {
    assignmentId: { type: 'number' },
    ...assignmentProperties,
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' }
};

const createAssignmentSchema = {
    description: 'Assign an asset to a user',
    tags: ['Asset Assignments'],
    summary: 'Creates a new asset assignment',
    body: {
        type: 'object',
        required: ['assetId', 'userId', 'assignedDate'],
        properties: assignmentProperties
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: { type: 'object', properties: assignmentResponseProperties }
            }
        }
    }
};

const updateAssignmentSchema = {
    description: 'Update an asset assignment by ID',
    tags: ['Asset Assignments'],
    summary: 'Updates an existing asset assignment',
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    body: { type: 'object', properties: assignmentProperties },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: { type: 'object', properties: assignmentResponseProperties }
            }
        }
    }
};

const getAssignmentByIdSchema = {
    description: 'Get an asset assignment by ID',
    tags: ['Asset Assignments'],
    summary: 'Retrieves a single assignment record',
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object', properties: assignmentResponseProperties }
            }
        }
    }
};

const getAllAssignmentsSchema = {
    description: 'Get all asset assignments',
    tags: ['Asset Assignments'],
    summary: 'Retrieves all asset assignments',
    querystring: {
        type: 'object',
        properties: {
            assetId: { type: 'number' },
            userId: { type: 'number' },
            assignmentStatus: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: { type: 'object', properties: assignmentResponseProperties }
                }
            }
        }
    }
};

const deleteAssignmentSchema = {
    description: 'Delete an asset assignment by ID',
    tags: ['Asset Assignments'],
    summary: 'Deletes an asset assignment record',
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ============================
// AssetHistory Schemas
// ============================
const historyProperties = {
    assetId: { type: 'number' },
    userId: { type: 'number', nullable: true },
    action: { type: 'string' },
    previousStatus: { type: 'string', nullable: true },
    newStatus: { type: 'string', nullable: true },
    actionDate: { type: 'string' },
    remarks: { type: 'string', nullable: true },
    performedBy: { type: 'number', nullable: true }
};

const historyResponseProperties = {
    historyId: { type: 'number' },
    ...historyProperties,
    createdAt: { type: 'string' }
};

const createHistorySchema = {
    description: 'Create an asset history record',
    tags: ['Asset History'],
    summary: 'Logs a new asset history entry',
    body: {
        type: 'object',
        required: ['assetId', 'action', 'actionDate'],
        properties: historyProperties
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: { type: 'object', properties: historyResponseProperties }
            }
        }
    }
};

const getHistoryByIdSchema = {
    description: 'Get an asset history entry by ID',
    tags: ['Asset History'],
    summary: 'Retrieves a single asset history record',
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object', properties: historyResponseProperties }
            }
        }
    }
};

const getAllHistorySchema = {
    description: 'Get all asset history records',
    tags: ['Asset History'],
    summary: 'Retrieves asset history, optionally filtered by asset or user',
    querystring: {
        type: 'object',
        properties: {
            assetId: { type: 'number' },
            userId: { type: 'number' },
            action: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: { type: 'object', properties: historyResponseProperties }
                }
            }
        }
    }
};

const deleteHistorySchema = {
    description: 'Delete an asset history record by ID',
    tags: ['Asset History'],
    summary: 'Deletes a single asset history entry',
    params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

module.exports = {
    // Asset
    createAssetSchema,
    updateAssetSchema,
    getAssetByIdSchema,
    getAllAssetsSchema,
    deleteAssetSchema,
    // Assignment
    createAssignmentSchema,
    updateAssignmentSchema,
    getAssignmentByIdSchema,
    getAllAssignmentsSchema,
    deleteAssignmentSchema,
    // History
    createHistorySchema,
    getHistoryByIdSchema,
    getAllHistorySchema,
    deleteHistorySchema
};
