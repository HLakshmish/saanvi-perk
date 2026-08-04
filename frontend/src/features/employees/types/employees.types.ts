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
