export interface Department {
  departmentId: number;
  companyId: number;
  departmentCode: string;
  departmentName: string;
  departmentHead?: number | null;
  description?: string | null;
  status: boolean;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
  headUser?: {
    firstName: string;
    lastName: string;
    officialEmail: string;
  } | null;
}

export interface CreateDepartmentInput {
  departmentCode: string;
  departmentName: string;
  departmentHead?: number | null;
  description?: string | null;
  status?: boolean;
}

export interface UpdateDepartmentInput {
  departmentCode?: string;
  departmentName?: string;
  departmentHead?: number | null;
  description?: string | null;
  status?: boolean;
}
