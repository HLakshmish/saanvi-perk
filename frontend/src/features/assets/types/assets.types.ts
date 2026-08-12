export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'UNDER_REPAIR' | 'LOST' | 'DAMAGED' | 'RETIRED';

export interface AssetDetails {
  assetId: number;
  companyId: number;
  assetCode: string;
  assetName: string;
  assetType: string;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  vendorName?: string | null;
  warrantyStartDate?: string | null;
  warrantyEndDate?: string | null;
  assetStatus: AssetStatus;
  description?: string | null;
  createdBy?: number | null;
  createdAt: string;
  updatedAt: string;
  assignments?: AssetAssignment[];
  history?: AssetHistory[];
}

export interface AssetAssignment {
  assignmentId: number;
  assetId: number;
  userId: number;
  assignedDate: string;
  expectedReturnDate?: string | null;
  returnedDate?: string | null;
  assignmentStatus?: string | null;
  conditionAtAssignment?: string | null;
  conditionAtReturn?: string | null;
  assignedBy?: number | null;
  returnedBy?: number | null;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: AssetDetails;
  user?: {
    userId: number;
    firstName: string;
    lastName?: string | null;
    email?: string;
  };
}

export interface AssetHistory {
  historyId: number;
  assetId: number;
  userId?: number | null;
  action: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  actionDate: string;
  remarks?: string | null;
  performedBy?: number | null;
  createdAt: string;
  asset?: {
    assetId: number;
    assetCode: string;
    assetName: string;
  };
  user?: {
    userId: number;
    firstName: string;
    lastName?: string | null;
  };
}

export interface CreateAssetInput {
  assetCode: string;
  assetName: string;
  assetType: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  vendorName?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  assetStatus?: AssetStatus;
  description?: string;
}

export interface AssignAssetInput {
  assetId: number;
  userId: number;
  assignedDate: string;
  expectedReturnDate?: string;
  conditionAtAssignment?: string;
  remarks?: string;
}

export interface ReturnAssetInput {
  returnedDate: string;
  conditionAtReturn?: string;
  remarks?: string;
}
