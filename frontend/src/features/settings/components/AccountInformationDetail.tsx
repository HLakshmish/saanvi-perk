import React, { useState, useEffect } from "react";
import { ChevronRight, Edit3, Upload, Check, ShieldAlert, Loader2 } from "lucide-react";
import { CompanyInfoData } from "../types/settings.types";
import { fetchCompanyDetails, updateCompanyDetails, fetchLocations, updateLocation } from "../api/settings.api";

interface AccountInformationDetailProps {
  onBackToAccountInfo: () => void;
}

const EMPTY_COMPANY_DATA: CompanyInfoData = {
  companyName: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  country: "",
  pinCode: "",
  fax: "",
  phone: "",
  website: "",
  subscriptionExpiry: "",
};

export const AccountInformationDetail: React.FC<AccountInformationDetailProps> = ({
  onBackToAccountInfo,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyInfoData>(EMPTY_COMPANY_DATA);
  const [formData, setFormData] = useState<CompanyInfoData>(EMPTY_COMPANY_DATA);
  const [activeLocationId, setActiveLocationId] = useState<number | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  useEffect(() => {
    const loadCompanyAndLocation = async () => {
      setIsLoading(true);

      // Fetch company and location parallelly
      const [compRes, locRes] = await Promise.all([
        fetchCompanyDetails(),
        fetchLocations(),
      ]);

      let comp = compRes.success ? compRes.data : {};
      let locList = locRes.success ? locRes.data : [];
      let primaryLoc = locList.length > 0 ? locList[0] : comp.officeLocations?.[0] || {};

      if (primaryLoc && primaryLoc.officeLocationId) {
        setActiveLocationId(primaryLoc.officeLocationId);
      }

      const mapped: CompanyInfoData = {
        companyName: comp.companyName || "",
        address1: primaryLoc.addressLine1 || comp.addressLine1 || "",
        address2: primaryLoc.addressLine2 || comp.addressLine2 || "",
        city: primaryLoc.city || comp.city || "",
        state: primaryLoc.state || comp.state || "",
        country: primaryLoc.country || comp.country || "",
        pinCode: primaryLoc.pincode || comp.pincode || "",
        fax: primaryLoc.fax || comp.fax || "",
        phone: comp.companyPhone || primaryLoc.officePhoneNumber || "",
        website: comp.website || primaryLoc.website || "",
        logoUrl: comp.companyLogo || "",
        subscriptionExpiry: comp.subscriptionExpiry || "",
      };

      setCompanyData(mapped);
      setFormData(mapped);
      setIsLoading(false);
    };

    loadCompanyAndLocation();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg("");

    const companyPayload = {
      companyName: formData.companyName,
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

    // Update Company & Location
    const updatePromises: Promise<any>[] = [updateCompanyDetails(companyPayload)];
    if (activeLocationId) {
      updatePromises.push(updateLocation(activeLocationId, locationPayload));
    }

    await Promise.all(updatePromises);
    setIsSaving(false);

    setCompanyData(formData);
    setIsEditing(false);
    if (typeof window !== "undefined") {
      if (formData.companyName) localStorage.setItem("company_name", formData.companyName);
      if (formData.logoUrl) localStorage.setItem("company_logo", formData.logoUrl);
      window.dispatchEvent(
        new CustomEvent("company_metadata_updated", {
          detail: { companyName: formData.companyName, companyLogo: formData.logoUrl },
        })
      );
    }
    setSaveSuccessMsg("Company & Location details updated successfully!");
    setTimeout(() => setSaveSuccessMsg(""), 4000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, logoUrl: base64String }));
      setCompanyData((prev) => ({ ...prev, logoUrl: base64String }));

      // Save logo directly to backend database
      await updateCompanyDetails({ companyLogo: base64String });
      if (typeof window !== "undefined") {
        localStorage.setItem("company_logo", base64String);
        window.dispatchEvent(new CustomEvent("company_metadata_updated", { detail: { companyLogo: base64String } }));
      }
      setSaveSuccessMsg("Company logo uploaded and saved successfully!");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    setFormData(companyData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Breadcrumb & Expiry Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <button
            onClick={onBackToAccountInfo}
            className="text-slate-500 hover:text-brand-primary font-bold transition-colors cursor-pointer"
          >
            Account Info
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Account Information</span>
        </div>

        {/* Expiry Badge (If Exists) */}
        {companyData.subscriptionExpiry && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold shadow-2xs">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Subscription Expires on {companyData.subscriptionExpiry}</span>
          </div>
        )}
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-xs flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Split Container: Left Sub-Menu Sidebar + Right Form Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Sub-Sidebar Menu */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs space-y-1">
          <button
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 cursor-pointer"
          >
            <span>Company info</span>
            <ChevronRight className="w-4 h-4 text-brand-primary" />
          </button>
        </div>

        {/* Right Main Form Content */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6 relative min-h-[380px]">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20 rounded-2xl">
              <div className="flex items-center gap-2 text-brand-primary font-bold text-xs">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading Company & Location Data...</span>
              </div>
            </div>
          )}

          {/* Card Header & Edit Action */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Company Info
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-[#012d28] transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Detail</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3.5 py-1 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text rounded-lg text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-brand-btn-text" />}
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Details Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
            {/* Company Name */}
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Company Name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Enter company name"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                />
              ) : (
                <p className="font-bold text-slate-800 text-sm">{companyData.companyName || "-"}</p>
              )}
            </div>

            {/* Address 1 */}
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Address 1</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address1}
                  onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                  placeholder="Enter address line 1"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.address1 || "-"}</p>
              )}
            </div>

            {/* Address 2 */}
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Address 2</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address2}
                  onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  placeholder="Enter address line 2"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.address2 || "-"}</p>
              )}
            </div>

            {/* City */}
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">City</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.city || "-"}</p>
              )}
            </div>

            {/* State */}
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">State</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Enter state"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.state || "-"}</p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Country</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Enter country"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.country || "-"}</p>
              )}
            </div>

            {/* Pin Code */}
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Pin Code</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  placeholder="Enter pincode"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.pinCode || "-"}</p>
              )}
            </div>

            {/* Fax */}
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Fax</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fax}
                  onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                  placeholder="Enter fax number"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.fax || "-"}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Phone Number</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.phone || "-"}</p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Website</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="Enter website URL"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                />
              ) : (
                <p className="font-semibold text-brand-primary hover:underline cursor-pointer">{companyData.website || "-"}</p>
              )}
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
                    <div className="w-6 h-6 rounded-md bg-brand-primary text-brand-btn-text flex items-center justify-center text-xs font-bold">
                      {companyData.companyName ? companyData.companyName.charAt(0).toUpperCase() : "C"}
                    </div>
                    <span className="font-bold text-slate-800 text-sm tracking-tight">
                      {companyData.companyName || "Company Name"}
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
                  Note : Please upload in .png, .jpg formats
                </p>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
