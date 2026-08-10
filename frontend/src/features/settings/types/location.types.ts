export interface OfficeLocation {
  officeLocationId: number;
  companyId: number;
  locationCode: string;
  locationName: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  officePhoneNumber?: string | null;
  mobileNumber?: string | null;
  fax?: string | null;
  website?: string | null;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  remarks?: string | null;
  status: boolean;
  createdBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLocationInput {
  locationCode: string;
  locationName: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  officePhoneNumber?: string | null;
  mobileNumber?: string | null;
  fax?: string | null;
  website?: string | null;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  remarks?: string | null;
  status?: boolean;
}

export interface UpdateLocationInput {
  locationCode?: string;
  locationName?: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  officePhoneNumber?: string | null;
  mobileNumber?: string | null;
  fax?: string | null;
  website?: string | null;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  remarks?: string | null;
  status?: boolean;
}
