export interface SuperAdminInput {
  firstName: string;
  lastName?: string;
  email: string;
  password?: string;
  phoneNumber?: string;
}

export interface CreateCompanyInput {
  companyName: string;
  companyCode: string;
  companyEmail: string;
  companyPhone?: string;
  website?: string;
  companyLogo?: string;

  // Tax & Compliance
  gstNumber?: string;
  panNumber?: string;
  cinNumber?: string;
  registrationNumber?: string;
  industryType?: string;
  companyType?: string;
  foundedDate?: string;
  employeeStrength?: number;

  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;

  // Workplace Settings
  timezone?: string;
  currency?: string;
  workingHoursPerDay?: number;
  workingDaysPerWeek?: number;
  officeStartTime?: string;
  officeEndTime?: string;

  // Geo-Fencing for Attendance
  latitude?: number;
  longitude?: number;
  allowedRadius?: number;

  // SuperAdmin Account
  superAdmin: SuperAdminInput;
}

export interface Company {
  companyId: number;
  companyName: string;
  companyCode: string;
  companyEmail: string;
  companyPhone?: string;
  website?: string;
  companyLogo?: string;
  gstNumber?: string;
  panNumber?: string;
  industryType?: string;
  city?: string;
  state?: string;
  pincode?: string;
  workingHoursPerDay?: number;
  workingDaysPerWeek?: number;
  officeStartTime?: string;
  officeEndTime?: string;
  allowedRadius?: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  superAdmin?: {
    superAdminId: number;
    email: string;
    firstName: string;
    lastName?: string;
    phoneNumber?: string;
  };
}

export interface CompanyApiResponse {
  success: boolean;
  message?: string;
  data?: Company;
  error?: string;
}
