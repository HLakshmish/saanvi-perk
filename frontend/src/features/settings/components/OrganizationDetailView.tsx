"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Edit3, Upload, Check, Loader2, Search, ArrowLeft } from "lucide-react";
import { Company } from "../../company/types/company.types";
import { getAllCompanies, updateCompany } from "../../company/api/company.api";
import { fetchLocations, updateLocation } from "../api/settings.api";

interface OrganizationDetailViewProps {
  onBack: () => void;
}

interface OrgData {
  companyId: number;
  companyCode: string;
  companyName: string;
  companyEmail: string;
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
}

const EMPTY_ORG_DATA: OrgData = {
  companyId: 0,
  companyCode: "",
  companyName: "",
  companyEmail: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  country: "",
  pinCode: "",
  fax: "",
  phone: "",
  website: "",
  logoUrl: "",
};

export const OrganizationDetailView: React.FC<OrganizationDetailViewProps> = ({ onBack }) => {
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  const [orgData, setOrgData] = useState<OrgData>(EMPTY_ORG_DATA);
  const [formData, setFormData] = useState<OrgData>(EMPTY_ORG_DATA);
  const [activeLocationId, setActiveLocationId] = useState<number | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Load companies list on mount
  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoadingList(true);
      const res = await getAllCompanies();
      if (res.success && res.data && res.data.length > 0) {
        setCompanies(res.data);
        setSelectedCompany(res.data[0]);
      } else {
        setCompanies([]);
      }
      setIsLoadingList(false);
    };
    loadCompanies();
  }, []);

  // Fetch location and details when selected company changes
  useEffect(() => {
    if (!selectedCompany) return;

    const loadDetails = async () => {
      setIsLoadingDetails(true);
      setErrorMsg("");
      
      try {
        // Fetch locations (scoped to active token/user context)
        const locRes = await fetchLocations();
        const locList = locRes.success ? locRes.data : [];
        
        // Find primary location matching this company if possible, or fallback to first
        const primaryLoc = locList.find((loc: any) => loc.companyId === selectedCompany.companyId) || locList[0] || {};
        
        if (primaryLoc && primaryLoc.officeLocationId) {
          setActiveLocationId(primaryLoc.officeLocationId);
        } else {
          setActiveLocationId(null);
        }

        const mapped: OrgData = {
          companyId: selectedCompany.companyId,
          companyCode: selectedCompany.companyCode || "",
          companyName: selectedCompany.companyName || "",
          companyEmail: selectedCompany.companyEmail || "",
          address1: primaryLoc.addressLine1 || selectedCompany.city || "",
          address2: primaryLoc.addressLine2 || "",
          city: primaryLoc.city || selectedCompany.city || "",
          state: primaryLoc.state || selectedCompany.state || "",
          country: primaryLoc.country || "India",
          pinCode: primaryLoc.pincode || selectedCompany.pincode || "",
          fax: primaryLoc.fax || "",
          phone: selectedCompany.companyPhone || primaryLoc.officePhoneNumber || "",
          website: selectedCompany.website || primaryLoc.website || "",
          logoUrl: selectedCompany.companyLogo || "",
        };

        setOrgData(mapped);
        setFormData(mapped);
      } catch (err: any) {
        setErrorMsg("Failed to load location details.");
      } finally {
        setIsLoadingDetails(false);
      }
    };

    loadDetails();
  }, [selectedCompany]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccessMsg("");

    const companyPayload = {
      companyName: formData.companyName,
      companyCode: formData.companyCode,
      companyPhone: formData.phone,
      website: formData.website,
      companyLogo: formData.logoUrl,
    };

    const locationPayload = {
      addressLine1: formData.address1,
      addressLine2: formData.address2,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pincode: formData.pinCode,
      fax: formData.fax,
    };

    try {
      // Update Company
      const compRes = await updateCompany(selectedCompany.companyId, companyPayload);
      if (!compRes.success) {
        throw new Error(compRes.error || "Failed to update company details");
      }

      // Update Location if active location exists
      if (activeLocationId) {
        await updateLocation(activeLocationId, locationPayload);
      }

      // Update list state
      setCompanies((prev) =>
        prev.map((c) =>
          c.companyId === selectedCompany.companyId ? { ...c, ...companyPayload } : c
        )
      );

      setOrgData(formData);
      setIsEditing(false);
      setSaveSuccessMsg("Organization & location details updated successfully!");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, logoUrl: base64String }));
      
      if (selectedCompany) {
        await updateCompany(selectedCompany.companyId, { companyLogo: base64String });
        setOrgData((prev) => ({ ...prev, logoUrl: base64String }));
        setSaveSuccessMsg("Company logo updated successfully!");
        setTimeout(() => setSaveSuccessMsg(""), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    setFormData(orgData);
    setIsEditing(false);
    setErrorMsg("");
  };

  // Filter companies list based on search query
  const filteredCompanies = companies.filter((c) =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Breadcrumb & Actions */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-brand-primary font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Organization Management</span>
          </button>
        </div>

        {selectedCompany && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Details</span>
          </button>
        )}
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-xs flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold text-xs flex items-center gap-2 animate-fade-in">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Left List Column + Right Form/Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: List of Organizations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              List of Organizations
            </h3>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Items"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary transition-all"
            />
          </div>

          {/* List Content */}
          <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
            {isLoadingList ? (
              <div className="flex items-center justify-center py-8 text-xs font-bold text-slate-500 gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                <span>Loading...</span>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-6">
                No organizations found
              </p>
            ) : (
              filteredCompanies.map((company) => {
                const isSelected = selectedCompany?.companyId === company.companyId;
                return (
                  <button
                    key={company.companyId}
                    disabled={isEditing}
                    onClick={() => setSelectedCompany(company)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                      isSelected
                        ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 hover:border-slate-300"
                    } ${isEditing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span>{company.companyName}</span>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-brand-primary translate-x-0.5" : "text-slate-400"}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Organization Details */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6 relative min-h-[400px]">
          {isLoadingDetails && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20 rounded-2xl">
              <div className="flex items-center gap-2 text-brand-primary font-bold text-xs">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading Details...</span>
              </div>
            </div>
          )}

          {/* Right Header & Edit Mode Actions */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Organization Details
            </h3>
            {isEditing && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text rounded-lg text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1 transition-colors"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-btn-text" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-brand-btn-text" />
                  )}
                  Save
                </button>
              </div>
            )}
          </div>

          {selectedCompany ? (
            <div className="space-y-6">
              {/* Company Information Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Company Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                  {/* Code Name */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Code Name
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.companyCode}
                        onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })}
                        placeholder="Enter company code"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                      />
                    ) : (
                      <p className="font-bold text-slate-800">{orgData.companyCode || "-"}</p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Company Name
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Enter company name"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                      />
                    ) : (
                      <p className="font-bold text-slate-800">{orgData.companyName || "-"}</p>
                    )}
                  </div>

                  {/* Address 1 */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Address 1
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address1}
                        onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                        placeholder="Enter address line 1"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{orgData.address1 || "-"}</p>
                    )}
                  </div>

                  {/* Address 2 */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Address 2
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address2}
                        onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                        placeholder="Enter address line 2"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{orgData.address2 || "-"}</p>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      City
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Enter city"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{orgData.city || "-"}</p>
                    )}
                  </div>

                  {/* State */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      State
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Enter state"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{orgData.state || "-"}</p>
                    )}
                  </div>

                  {/* Country */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Country
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="Enter country"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{orgData.country || "-"}</p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Pincode
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.pinCode}
                        onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                        placeholder="Enter pincode"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{orgData.pinCode || "-"}</p>
                    )}
                  </div>

                  {/* Fax */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Fax
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.fax}
                        onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                        placeholder="Enter fax number"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{orgData.fax || "-"}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Phone Number
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{orgData.phone || "-"}</p>
                    )}
                  </div>

                  {/* Website */}
                  <div className="space-y-1 md:col-span-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
                      Website
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="Enter website URL"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                      />
                    ) : (
                      orgData.website ? (
                        <a
                          href={orgData.website.startsWith("http") ? orgData.website : `https://${orgData.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-brand-primary hover:underline inline-block cursor-pointer"
                        >
                          {orgData.website}
                        </a>
                      ) : (
                        <p className="font-semibold text-slate-800">-</p>
                      )
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-slate-100 my-4" />

              {/* Company Logo Section */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Company Logo</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    This logo is displayed across all invoices, payslips, and notifications.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
                  {/* Logo Preview Box */}
                  <div className="w-48 h-20 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-center p-3 shadow-2xs overflow-hidden">
                    {formData.logoUrl ? (
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={formData.logoUrl}
                          alt="Company Logo"
                          className="max-h-12 max-w-full object-contain"
                        />
                        <span className="text-[10px] text-emerald-600 font-bold">uploaded</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-brand-primary text-brand-btn-text flex items-center justify-center text-xs font-bold">
                          {orgData.companyName ? orgData.companyName.charAt(0).toUpperCase() : "C"}
                        </div>
                        <span className="font-bold text-slate-800 text-sm tracking-tight">
                          {orgData.companyName || "Company Name"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls & Specs */}
                  {isEditing && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-400 font-semibold">
                        Preferred Image Size: 120 x 40 pixels, Maximum 100 KB
                      </p>

                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer hover:shadow-xs">
                        <Upload className="w-3.5 h-3.5 text-brand-btn-text" />
                        <span>Choose File</span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".png,.jpg,.jpeg"
                          onChange={handleLogoUpload}
                        />
                      </label>

                      <p className="text-[10px] text-slate-400 font-medium">
                        Supported formats: .png, .jpg, .jpeg
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-xs text-slate-400 font-semibold">
              Select an organization from the left to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
