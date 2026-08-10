export interface Designation {
  designationId: number;
  companyId: number;
  departmentId: number;
  designationCode: string;
  designationName: string;
  remarks?: string | null;
  status: boolean;
  createdBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
  department?: {
    departmentId: number;
    departmentCode: string;
    departmentName: string;
  } | null;
}

export interface CreateDesignationInput {
  departmentId: number;
  designationCode: string;
  designationName: string;
  remarks?: string | null;
  status?: boolean;
}

export interface UpdateDesignationInput {
  departmentId?: number;
  designationCode?: string;
  designationName?: string;
  remarks?: string | null;
  status?: boolean;
}
