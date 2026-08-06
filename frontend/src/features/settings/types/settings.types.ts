export type SettingsSubTab =
  | "account-info"
  | "organization"
  | "payroll"
  | "attendance"
  | "leave"
  | "training"
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
  logoUrl?: string;
  subscriptionExpiry: string;
}
