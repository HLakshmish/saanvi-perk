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
  roleId: number | string;
  departmentId?: number | string | null;
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
