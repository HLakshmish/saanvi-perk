export type SettingsSubTab =
  | "account-info"
  | "organization"
  | "payroll"
  | "attendance"
  | "leave"
  | "others";

export interface CompanyInfoData {
  companyName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  fax: string;
  phone: string;
  website: string;
  subscriptionExpiry: string;
  logoUrl?: string;
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  assigned: boolean;
}

export interface RoleItem {
  id: string | number;
  code: string;
  name: string;
  remarks: string;
  permissions: Permission[];
}
