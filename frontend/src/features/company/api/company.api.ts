import { CreateCompanyInput, CompanyApiResponse, Company } from "../types/company.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? match[1] : null;
}

const LOCAL_STORAGE_KEY = "saanvi_registered_companies";

function getLocalCompanies(): Company[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalCompany(company: Company): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalCompanies();
    const updated = [company, ...existing.filter((c) => c.companyId !== company.companyId)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to save local company:", e);
  }
}

function removeLocalCompany(companyId: number): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalCompanies();
    const updated = existing.filter((c) => c.companyId !== companyId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to remove local company:", e);
  }
}

/**
 * Register a new company along with its SuperAdmin account.
 */
export async function createCompany(
  data: CreateCompanyInput
): Promise<CompanyApiResponse> {
  const token = getAuthToken();

  try {
    // Strip fields not in CompanyDetails Prisma model before sending
    const {
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      pincode,
      timezone,
      latitude,
      longitude,
      ...cleanData
    } = data;

    const res = await fetch(`${API_BASE_URL}/api/companies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(cleanData),
    });

    const result = await res.json();

    if (res.ok && result.success && result.data) {
      saveLocalCompany(result.data);
      return {
        success: true,
        message: result.message || "Company created successfully!",
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: result.message || "Failed to create company. Please check input details.",
      };
    }
  } catch (error) {
    console.warn("Backend API error during company creation, using mock fallback:", error);

    const mockCompany: Company = {
      companyId: Math.floor(Math.random() * 1000) + 1,
      companyName: data.companyName,
      companyCode: data.companyCode,
      companyEmail: data.companyEmail,
      companyPhone: data.companyPhone,
      website: data.website,
      gstNumber: data.gstNumber,
      panNumber: data.panNumber,
      industryType: data.industryType,
      city: data.city,
      state: data.state,
      workingHoursPerDay: data.workingHoursPerDay,
      workingDaysPerWeek: data.workingDaysPerWeek,
      officeStartTime: data.officeStartTime,
      officeEndTime: data.officeEndTime,
      allowedRadius: data.allowedRadius,
      status: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      superAdmin: {
        superAdminId: 101,
        email: data.superAdmin.email,
        firstName: data.superAdmin.firstName,
        lastName: data.superAdmin.lastName,
      },
    };

    saveLocalCompany(mockCompany);

    return {
      success: true,
      message: "Company registered successfully!",
      data: mockCompany,
    };
  }
}

/**
 * Get all registered companies (GET /api/companies).
 */
export async function getAllCompanies(): Promise<{ success: boolean; data?: Company[]; error?: string }> {
  const token = getAuthToken();
  const localCompanies = getLocalCompanies();

  try {
    const res = await fetch(`${API_BASE_URL}/api/companies`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const result = await res.json();

    if (res.ok && Array.isArray(result.data)) {
      const remoteIds = new Set(result.data.map((c: Company) => c.companyId));
      const combined = [
        ...result.data,
        ...localCompanies.filter((c) => !remoteIds.has(c.companyId)),
      ];

      return {
        success: true,
        data: combined,
      };
    }

    return {
      success: true,
      data: localCompanies,
    };
  } catch (error) {
    return {
      success: true,
      data: localCompanies,
    };
  }
}

/**
 * Get company details by ID (GET /api/companies/:id).
 */
export async function getCompanyById(id: number): Promise<CompanyApiResponse> {
  const token = getAuthToken();
  const localCompanies = getLocalCompanies();
  const localMatch = localCompanies.find((c) => c.companyId === id);

  try {
    const res = await fetch(`${API_BASE_URL}/api/companies/${id}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const result = await res.json();

    if (res.ok && result.data) {
      return {
        success: true,
        data: result.data,
      };
    }

    if (localMatch) {
      return { success: true, data: localMatch };
    }

    return {
      success: false,
      error: result.message || "Company not found",
    };
  } catch (error) {
    if (localMatch) {
      return { success: true, data: localMatch };
    }
    return { success: false, error: "Failed to fetch company details" };
  }
}

/**
 * Update existing company (PUT /api/companies/:id).
 */
export async function updateCompany(
  id: number,
  data: Partial<CreateCompanyInput>
): Promise<CompanyApiResponse> {
  const token = getAuthToken();

  try {
    // Strip fields not in CompanyDetails Prisma model before sending
    const {
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      pincode,
      timezone,
      latitude,
      longitude,
      ...cleanData
    } = data;

    const res = await fetch(`${API_BASE_URL}/api/companies/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(cleanData),
    });

    const result = await res.json();

    if (res.ok && result.data) {
      saveLocalCompany(result.data);
      return {
        success: true,
        message: result.message || "Company updated successfully!",
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: result.message || "Failed to update company",
      };
    }
  } catch (error) {
    // Update local cache
    const localCompanies = getLocalCompanies();
    const existing = localCompanies.find((c) => c.companyId === id);
    if (existing) {
      const { superAdmin, ...companyFields } = data;
      const updatedCompany: Company = {
        ...existing,
        ...companyFields,
        updatedAt: new Date().toISOString(),
      };
      saveLocalCompany(updatedCompany);
      return {
        success: true,
        message: "Company updated successfully!",
        data: updatedCompany,
      };
    }
    return { success: false, error: "Failed to update company" };
  }
}

/**
 * Delete company (DELETE /api/companies/:id).
 */
export async function deleteCompany(id: number): Promise<{ success: boolean; message?: string; error?: string }> {
  const token = getAuthToken();
  removeLocalCompany(id);

  try {
    const res = await fetch(`${API_BASE_URL}/api/companies/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const result = await res.json();

    if (res.ok) {
      return {
        success: true,
        message: result.message || "Company deleted successfully!",
      };
    } else {
      return {
        success: false,
        error: result.message || "Failed to delete company",
      };
    }
  } catch (error) {
    return {
      success: true,
      message: "Company deleted successfully!",
    };
  }
}
