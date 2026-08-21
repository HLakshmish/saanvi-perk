export interface Designation {
  designationId: number;
  designationCode: string;
  designationName: string;
  departmentId: number;
  description?: string;
  status: boolean;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  location: string;
  department: string;
  designation: string;
  employeeGroup: string;
  reportsTo?: string; // manager's employeeCode
  reportingToId?: number;
  roleName?: string;
  profilePic?: string;
  designationId?: number;
  status?: string;
}

export interface RoleSelection {
  roleId: number;
  roleName: string;
  roleCode?: string;
}

export interface DepartmentSelection {
  departmentId: number;
  departmentName: string;
  departmentCode?: string;
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  employeeCode: string;
  officialEmail: string;
  password?: string;
  phoneNumber?: string | null;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
  joiningDate: string;
  dateOfBirth?: string;
  roleId?: number | string;
  roleIds?: number[];
  departmentId?: number | string | null;
  designationId?: number | string | null;
  probationEndDate?: string | null;
  reportingToId?: number | null;
  shiftId?: number | null;
  status?: "ACTIVE" | "INACTIVE" | "RESIGNED" | "TERMINATED";
  profilePic?: string;
  companyId?: number;
  locationId?: number | string | null;
}

export interface CreatePFDetailInput {
  userId: number;
  uanNumber?: string | null;
  isInternationalWorker?: boolean;
  educationLevel?: 'BELOW_10TH' | 'SSLC' | 'PUC' | 'DIPLOMA' | 'GRADUATE' | 'POST_GRADUATE' | 'DOCTORATE' | 'OTHER' | null;
  pfNumber?: string | null;
  pfJoiningDate?: string | null;
  pfLeavingDate?: string | null;
  documentNumber?: string | null;
  documentType?: 'AADHAAR' | 'PASSPORT' | 'VOTER_ID' | 'DRIVING_LICENSE' | 'PAN' | 'OTHER' | null;
  documentExpiryDate?: string | null;
  reasonForLeaving?: 'RESIGNED' | 'TERMINATED' | 'RETIRED' | 'TRANSFERRED' | 'CONTRACT_COMPLETED' | 'DECEASED' | 'OTHER' | null;
  phcCategory?: 'GENERAL' | 'PH' | 'EXEMPT' | null;
}

export interface CreateESIDetailInput {
  userId: number;
  esiNumber?: string | null;
  esiJoiningDate?: string | null;
  esiLeavingDate?: string | null;
  reasonForLeaving?: 'RESIGNED' | 'TERMINATED' | 'RETIRED' | 'CONTRACT_COMPLETED' | 'TRANSFERRED' | 'DECEASED' | 'OTHER' | null;
}

export interface CreateInsuranceDetailInput {
  userId: number;
  insuranceProvider?: string | null;
  insuranceType?: 'HEALTH' | 'LIFE' | 'ACCIDENT' | 'GROUP_MEDICAL' | 'GROUP_LIFE' | 'OTHER' | null;
  policyNumber?: string | null;
  insuranceExpiryDate?: string | null;
}

export interface EmployeeDocumentResponse {
  documentId: number;
  userId: number;
  documentType: string;
  status: boolean;
  uploadedAt: string;
  updatedAt: string;
  // Metadata fields if any, we include them as optional
  fileName?: string;
  originalFileName?: string;
  mimeType?: string;
  fileSize?: number;
}
export interface SuperAdminDetails {
  superAdminId: number;
  companyId: number;
  email: string;
  firstName: string;
  lastName?: string | null;
  profilePic?: string | null;
  phoneNumber?: string | null;
  status: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
}
