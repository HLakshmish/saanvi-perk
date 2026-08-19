"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateCompanyInput, Company } from "../types/company.types";
import { createCompany, updateCompany } from "../api/company.api";
import { Input } from "@/components/ui/input";
import {
  Building2,
  UserCheck,
  Clock,
  FileCheck2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Pencil,
} from "lucide-react";

interface CompanyRegistrationFormProps {
  onSuccess?: () => void;
  editCompany?: Company | null;
}

export function CompanyRegistrationForm({ onSuccess, editCompany }: CompanyRegistrationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const steps = editCompany
    ? [
        { number: 1, title: "Company Profile", icon: Building2 },
      ]
    : [
        { number: 1, title: "Company Profile", icon: Building2 },
        { number: 2, title: "Owner Account", icon: UserCheck },
      ];

  const maxSteps = steps.length;

  const [formData, setFormData] = useState<CreateCompanyInput>({
    companyName: "",
    companyCode: "",
    companyEmail: "",
    companyPhone: "",
    website: "",
    
    // Tax & Compliance
    gstNumber: "",
    panNumber: "",
    industryType: "Information Technology",

    // Workplace & Attendance Geo-Fencing
    currency: "INR",
    workingHoursPerDay: 8,
    workingDaysPerWeek: 5,
    officeStartTime: "09:00",
    officeEndTime: "18:00",
    allowedRadius: 100,

    // SuperAdmin Account (Used only when creating new company)
    superAdmin: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
    },
  });

  // Pre-fill form if editing existing company
  useEffect(() => {
    if (editCompany) {
      setFormData({
        companyName: editCompany.companyName || "",
        companyCode: editCompany.companyCode || "",
        companyEmail: editCompany.companyEmail || "",
        companyPhone: editCompany.companyPhone || "",
        website: editCompany.website || "",
        gstNumber: editCompany.gstNumber || "",
        panNumber: editCompany.panNumber || "",
        industryType: editCompany.industryType || "Information Technology",
        workingHoursPerDay: editCompany.workingHoursPerDay || 8,
        workingDaysPerWeek: editCompany.workingDaysPerWeek || 5,
        officeStartTime: editCompany.officeStartTime || "09:00",
        officeEndTime: editCompany.officeEndTime || "18:00",
        allowedRadius: editCompany.allowedRadius || 100,
        superAdmin: {
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phoneNumber: "",
        },
      });
    }
  }, [editCompany]);

  const handleChange = (field: keyof CreateCompanyInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSuperAdminChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      superAdmin: {
        ...prev.superAdmin,
        [field]: value,
      },
    }));
  };

  const validateStep = (step: number): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (!formData.companyName) {
        setErrorMsg("Company Name is required.");
        return false;
      }
      if (!formData.companyCode) {
        setErrorMsg("Company Code is required.");
        return false;
      }
      if (!formData.companyEmail) {
        setErrorMsg("Official Company Email is required.");
        return false;
      }
    } else if (!editCompany && step === 2) {
      if (!formData.superAdmin.firstName) {
        setErrorMsg("Owner / SuperAdmin First Name is required.");
        return false;
      }
      if (!formData.superAdmin.email) {
        setErrorMsg("Owner / SuperAdmin Email is required.");
        return false;
      }
      if (!formData.superAdmin.password || formData.superAdmin.password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, maxSteps));
    }
  };

  const prevStep = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let response;
      if (editCompany?.companyId) {
        // Strip superAdmin from payload when editing company
        const { superAdmin, ...updatePayload } = formData;
        response = await updateCompany(editCompany.companyId, updatePayload);
      } else {
        // POST API CALL
        response = await createCompany(formData);
      }

      if (response.success) {
        setSuccessMsg(
          editCompany
            ? "Company profile updated successfully!"
            : "Company and Superadmin Account registered successfully!"
        );
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push("/owner/dashboard");
          }
        }, 1200);
      } else {
        setErrorMsg(response.error || "Operation failed.");
      }
    } catch (err) {
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .forced-light-theme input,
        .forced-light-theme select,
        .forced-light-theme textarea {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-color: #cbd5e1 !important;
        }
        .forced-light-theme input::placeholder {
          color: #94a3b8 !important;
        }
        .forced-light-theme input:hover {
          border-color: #cbd5e1 !important;
        }
        .forced-light-theme input:focus,
        .forced-light-theme input:focus-visible {
          border-color: #013e37 !important;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.2) !important;
          outline: none !important;
        }
        .forced-light-theme label {
          color: #374151 !important;
        }
      `}</style>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 forced-light-theme">
        
        {/* Form Title Banner */}
        <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              {editCompany ? <Pencil className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {editCompany ? `Edit Company: ${editCompany.companyName}` : "Register New Company"}
              </h2>
              <p className="text-xs text-slate-500">
                {editCompany ? "Update company configuration & workplace settings" : "Fill details to setup company and superadmin account"}
              </p>
            </div>
          </div>
        </div>

        {/* Wizard Progress Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 w-full">
          {steps.map((step, idx) => {
            const isActive = currentStep === step.number;
            const isDone = currentStep > step.number;

            return (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-brand-primary text-brand-btn-text ring-4 ring-[#013e37]/20"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      isActive ? "text-brand-primary" : isDone ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 min-w-[12px] mx-1 sm:mx-2.5 ${currentStep > step.number ? "bg-emerald-500" : "bg-slate-200"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Steps */}
        <form onSubmit={(e) => { e.preventDefault(); if (currentStep < maxSteps) nextStep(); }} className="space-y-6">
          
          {/* STEP 1: COMPANY IDENTITY */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-primary" />
                <span>Step 1: Company Profile</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Company Name *"
                  placeholder="e.g. Saanvi Technologies"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  required
                />

                <Input
                  label="Company Code (Short ID) *"
                  placeholder="e.g. SAANVI"
                  value={formData.companyCode}
                  onChange={(e) => handleChange("companyCode", e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Company Email *"
                  type="email"
                  placeholder="contact@company.com"
                  value={formData.companyEmail}
                  onChange={(e) => handleChange("companyEmail", e.target.value)}
                  required
                />

                <Input
                  label="Company Phone"
                  placeholder="+91 98765 43210"
                  value={formData.companyPhone || ""}
                  onChange={(e) => handleChange("companyPhone", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Company Website"
                  placeholder="https://company.com"
                  value={formData.website || ""}
                  onChange={(e) => handleChange("website", e.target.value)}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Industry Type</label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    value={formData.industryType}
                    onChange={(e) => handleChange("industryType", e.target.value)}
                  >
                    <option value="Information Technology">Information Technology (IT)</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance & Banking">Finance & Banking</option>
                    <option value="Retail & E-commerce">Retail & E-commerce</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
              </div>

              {/* Tax & Compliance Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <Input
                  label="GST Number"
                  placeholder="29AAAAA0000A1Z5"
                  value={formData.gstNumber || ""}
                  onChange={(e) => handleChange("gstNumber", e.target.value.toUpperCase())}
                />

                <Input
                  label="PAN Number"
                  placeholder="AAAAA0000A"
                  value={formData.panNumber || ""}
                  onChange={(e) => handleChange("panNumber", e.target.value.toUpperCase())}
                />
              </div>
            </div>
          )}

          {/* STEP 2 (FOR NEW COMPANY ONLY): SUPERADMIN / OWNER ACCOUNT */}
          {!editCompany && currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-brand-primary" />
                <span>Step 2: Superadmin Credentials</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name *"
                  placeholder="e.g. Varsha"
                  value={formData.superAdmin.firstName}
                  onChange={(e) => handleSuperAdminChange("firstName", e.target.value)}
                  required
                />

                <Input
                  label="Last Name"
                  placeholder="e.g. Sharma"
                  value={formData.superAdmin.lastName || ""}
                  onChange={(e) => handleSuperAdminChange("lastName", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Superadmin Login Email *"
                  type="email"
                  placeholder="admin@company.com"
                  value={formData.superAdmin.email}
                  onChange={(e) => handleSuperAdminChange("email", e.target.value)}
                  required
                />

                <Input
                  label="Superadmin Login Password *"
                  type="password"
                  placeholder="••••••••"
                  value={formData.superAdmin.password || ""}
                  onChange={(e) => handleSuperAdminChange("password", e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < maxSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Saving..." : editCompany ? "Update Company Details" : "Submit & Register Company"}
              </button>
            )}
          </div>

        </form>
      </div>
    </>
  );
}
