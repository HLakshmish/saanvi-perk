"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateCompanyInput, Company } from "../types/company.types";
import { createCompany, updateCompany } from "../api/company.api";
import { Input } from "@/components/ui/input";
import {
  Building2,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

interface CompanyRegistrationFormProps {
  onSuccess?: () => void;
  editCompany?: Company | null;
}

// Regex patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,15}$/;
const WEBSITE_REGEX = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+([\/?].*)?$/i;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const CODE_REGEX = /^[A-Z0-9_-]{2,10}$/;
const NAME_REGEX = /^[a-zA-Z\s'-]{2,50}$/;
const LAST_NAME_REGEX = /^[a-zA-Z\s'-]{1,50}$/;

export function CompanyRegistrationForm({ onSuccess, editCompany }: CompanyRegistrationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const steps = editCompany
    ? [{ number: 1, title: "Company Profile", icon: Building2 }]
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
    // Clear error for this field
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSuperAdminChange = (field: string, value: string) => {
    const errorKey = `superAdmin_${field}`;
    setFormData((prev) => ({
      ...prev,
      superAdmin: {
        ...prev.superAdmin,
        [field]: value,
      },
    }));
    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  // Field Level Validator
  const validateSingleField = (name: string, value: string): string | null => {
    const trimmed = value.trim();

    switch (name) {
      case "companyName":
        if (!trimmed) return "Company Name is required.";
        if (trimmed.length < 2) return "Company Name must be at least 2 characters.";
        if (trimmed.length > 100) return "Company Name cannot exceed 100 characters.";
        return null;

      case "companyCode":
        if (!trimmed) return "Company Code is required.";
        if (!CODE_REGEX.test(trimmed))
          return "Company Code must be 2-10 uppercase alphanumeric characters (no spaces).";
        return null;

      case "companyEmail":
        if (!trimmed) return "Official Company Email is required.";
        if (!EMAIL_REGEX.test(trimmed))
          return "Please enter a valid email address (e.g. contact@company.com).";
        return null;

      case "companyPhone":
        if (trimmed && !PHONE_REGEX.test(trimmed))
          return "Please enter a valid phone number (7-15 digits).";
        return null;

      case "website":
        if (trimmed && !WEBSITE_REGEX.test(trimmed))
          return "Please enter a valid website URL (e.g. https://company.com).";
        return null;

      case "gstNumber":
        if (trimmed && !GST_REGEX.test(trimmed))
          return "Invalid GSTIN format (e.g. 29AAAAA0000A1Z5).";
        return null;

      case "panNumber":
        if (trimmed && !PAN_REGEX.test(trimmed))
          return "Invalid PAN format (e.g. AAAAA0000A).";
        return null;

      case "superAdmin_firstName":
        if (!trimmed) return "Owner / SuperAdmin First Name is required.";
        if (!NAME_REGEX.test(trimmed))
          return "First Name must contain letters only (2-50 characters).";
        return null;

      case "superAdmin_lastName":
        if (trimmed && !LAST_NAME_REGEX.test(trimmed))
          return "Last Name must contain letters only.";
        return null;

      case "superAdmin_email":
        if (!trimmed) return "Owner / SuperAdmin Email is required.";
        if (!EMAIL_REGEX.test(trimmed))
          return "Please enter a valid email address (e.g. admin@company.com).";
        return null;

      case "superAdmin_password":
        if (!trimmed) return "SuperAdmin Login Password is required.";
        return null;

      default:
        return null;
    }
  };

  const validateStep = (step: number): boolean => {
    setErrorMsg(null);
    const errors: Record<string, string> = {};
    let firstErrorField: string | null = null;

    if (step === 1) {
      const errName = validateSingleField("companyName", formData.companyName);
      if (errName) {
        errors.companyName = errName;
        if (!firstErrorField) firstErrorField = "companyName";
      }

      const errCode = validateSingleField("companyCode", formData.companyCode);
      if (errCode) {
        errors.companyCode = errCode;
        if (!firstErrorField) firstErrorField = "companyCode";
      }

      const errEmail = validateSingleField("companyEmail", formData.companyEmail);
      if (errEmail) {
        errors.companyEmail = errEmail;
        if (!firstErrorField) firstErrorField = "companyEmail";
      }

      const errPhone = validateSingleField("companyPhone", formData.companyPhone || "");
      if (errPhone) {
        errors.companyPhone = errPhone;
        if (!firstErrorField) firstErrorField = "companyPhone";
      }

      const errWebsite = validateSingleField("website", formData.website || "");
      if (errWebsite) {
        errors.website = errWebsite;
        if (!firstErrorField) firstErrorField = "website";
      }

      const errGst = validateSingleField("gstNumber", formData.gstNumber || "");
      if (errGst) {
        errors.gstNumber = errGst;
        if (!firstErrorField) firstErrorField = "gstNumber";
      }

      const errPan = validateSingleField("panNumber", formData.panNumber || "");
      if (errPan) {
        errors.panNumber = errPan;
        if (!firstErrorField) firstErrorField = "panNumber";
      }
    } else if (!editCompany && step === 2) {
      const errFirst = validateSingleField("superAdmin_firstName", formData.superAdmin.firstName);
      if (errFirst) {
        errors.superAdmin_firstName = errFirst;
        if (!firstErrorField) firstErrorField = "superAdmin_firstName";
      }

      const errLast = validateSingleField("superAdmin_lastName", formData.superAdmin.lastName || "");
      if (errLast) {
        errors.superAdmin_lastName = errLast;
        if (!firstErrorField) firstErrorField = "superAdmin_lastName";
      }

      const errEmail = validateSingleField("superAdmin_email", formData.superAdmin.email);
      if (errEmail) {
        errors.superAdmin_email = errEmail;
        if (!firstErrorField) firstErrorField = "superAdmin_email";
      }

      const errPass = validateSingleField("superAdmin_password", formData.superAdmin.password || "");
      if (errPass) {
        errors.superAdmin_password = errPass;
        if (!firstErrorField) firstErrorField = "superAdmin_password";
      }
    }

    setFieldErrors(errors);

    if (firstErrorField) {
      setErrorMsg("Please fix the highlighted fields before proceeding.");
      setTimeout(() => {
        const el = document.getElementById(firstErrorField!);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 50);
      return false;
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

  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep > currentStep) {
      if (validateStep(currentStep)) {
        setCurrentStep(targetStep);
      }
    } else {
      setErrorMsg(null);
      setCurrentStep(targetStep);
    }
  };

  const handleFinalSubmit = async () => {
    // Validate Step 1 first if editing or on Step 1
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }
    // Validate Step 2 if adding new company
    if (!editCompany && !validateStep(2)) {
      setCurrentStep(2);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Sanitize values
    const cleanPayload: CreateCompanyInput = {
      ...formData,
      companyName: formData.companyName.trim(),
      companyCode: formData.companyCode.trim().toUpperCase(),
      companyEmail: formData.companyEmail.trim().toLowerCase(),
      companyPhone: formData.companyPhone?.trim(),
      website: formData.website?.trim(),
      gstNumber: formData.gstNumber?.trim().toUpperCase(),
      panNumber: formData.panNumber?.trim().toUpperCase(),
      superAdmin: {
        ...formData.superAdmin,
        firstName: formData.superAdmin.firstName.trim(),
        lastName: formData.superAdmin.lastName?.trim(),
        email: formData.superAdmin.email.trim().toLowerCase(),
      },
    };

    try {
      let response;
      if (editCompany?.companyId) {
        // Strip superAdmin from payload when editing company
        const { superAdmin, ...updatePayload } = cleanPayload;
        response = await updateCompany(editCompany.companyId, updatePayload);
      } else {
        // POST API CALL
        response = await createCompany(cleanPayload);
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
        const rawErr = response.error || "Operation failed.";
        setErrorMsg(rawErr);

        // Map backend uniqueness error string to specific fields
        const lowerErr = rawErr.toLowerCase();
        const apiErrors: Record<string, string> = {};

        if (lowerErr.includes("company code") || lowerErr.includes("companycode")) {
          apiErrors.companyCode = "Company code already exists. Please choose another code.";
          setCurrentStep(1);
          setTimeout(() => document.getElementById("companyCode")?.focus(), 100);
        } else if (lowerErr.includes("super admin email") || lowerErr.includes("superadmin email")) {
          apiErrors.superAdmin_email = "Superadmin email is already registered. Please use a different email.";
          if (!editCompany) setCurrentStep(2);
          setTimeout(() => document.getElementById("superAdmin_email")?.focus(), 100);
        } else if (lowerErr.includes("company email") || lowerErr.includes("companyemail")) {
          apiErrors.companyEmail = "Company email is already registered. Please use a different email.";
          setCurrentStep(1);
          setTimeout(() => document.getElementById("companyEmail")?.focus(), 100);
        }

        if (Object.keys(apiErrors).length > 0) {
          setFieldErrors((prev) => ({ ...prev, ...apiErrors }));
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred. Please try again.");
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
                <div
                  onClick={() => handleStepClick(step.number)}
                  className="flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer group"
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-brand-primary text-brand-btn-text ring-4 ring-[#013e37]/20"
                        : "bg-slate-100 text-slate-400 border border-slate-200 group-hover:border-slate-400"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      isActive ? "text-brand-primary" : isDone ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
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
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
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
                  id="companyName"
                  label="Company Name *"
                  placeholder="e.g. Saanvi Technologies"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  onBlur={(e) => {
                    const err = validateSingleField("companyName", e.target.value);
                    setFieldErrors((prev) => ({ ...prev, companyName: err || "" }));
                  }}
                  error={fieldErrors["companyName"]}
                  required
                />

                <Input
                  id="companyCode"
                  label="Company Code (Short ID) *"
                  placeholder="e.g. SAANVI"
                  value={formData.companyCode}
                  onChange={(e) => handleChange("companyCode", e.target.value.toUpperCase())}
                  onBlur={(e) => {
                    const err = validateSingleField("companyCode", e.target.value);
                    setFieldErrors((prev) => ({ ...prev, companyCode: err || "" }));
                  }}
                  error={fieldErrors["companyCode"]}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="companyEmail"
                  label="Official Company Email *"
                  type="email"
                  placeholder="contact@company.com"
                  value={formData.companyEmail}
                  onChange={(e) => handleChange("companyEmail", e.target.value)}
                  onBlur={(e) => {
                    const err = validateSingleField("companyEmail", e.target.value);
                    setFieldErrors((prev) => ({ ...prev, companyEmail: err || "" }));
                  }}
                  error={fieldErrors["companyEmail"]}
                  required
                />

                <Input
                  id="companyPhone"
                  label="Company Phone"
                  placeholder="+91 98765 43210"
                  value={formData.companyPhone || ""}
                  onChange={(e) => handleChange("companyPhone", e.target.value)}
                  onBlur={(e) => {
                    const err = validateSingleField("companyPhone", e.target.value);
                    setFieldErrors((prev) => ({ ...prev, companyPhone: err || "" }));
                  }}
                  error={fieldErrors["companyPhone"]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="website"
                  label="Company Website"
                  placeholder="https://company.com"
                  value={formData.website || ""}
                  onChange={(e) => handleChange("website", e.target.value)}
                  onBlur={(e) => {
                    const err = validateSingleField("website", e.target.value);
                    setFieldErrors((prev) => ({ ...prev, website: err || "" }));
                  }}
                  error={fieldErrors["website"]}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Industry Type</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 shadow-2xs"
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
                  id="gstNumber"
                  label="GST Number"
                  placeholder="29AAAAA0000A1Z5"
                  value={formData.gstNumber || ""}
                  onChange={(e) => handleChange("gstNumber", e.target.value.toUpperCase())}
                  onBlur={(e) => {
                    const err = validateSingleField("gstNumber", e.target.value);
                    setFieldErrors((prev) => ({ ...prev, gstNumber: err || "" }));
                  }}
                  error={fieldErrors["gstNumber"]}
                />

                <Input
                  id="panNumber"
                  label="PAN Number"
                  placeholder="AAAAA0000A"
                  value={formData.panNumber || ""}
                  onChange={(e) => handleChange("panNumber", e.target.value.toUpperCase())}
                  onBlur={(e) => {
                    const err = validateSingleField("panNumber", e.target.value);
                    setFieldErrors((prev) => ({ ...prev, panNumber: err || "" }));
                  }}
                  error={fieldErrors["panNumber"]}
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
                  id="superAdmin_firstName"
                  label="First Name *"
                  placeholder="e.g. Varsha"
                  value={formData.superAdmin.firstName}
                  onChange={(e) => handleSuperAdminChange("firstName", e.target.value)}
                  onBlur={(e) => {
                    const err = validateSingleField("superAdmin_firstName", e.target.value);
                    setFieldErrors((prev) => ({ ...prev, superAdmin_firstName: err || "" }));
                  }}
                  error={fieldErrors["superAdmin_firstName"]}
                  required
                />

                <Input
                  id="superAdmin_lastName"
                  label="Last Name"
                  placeholder="e.g. Sharma"
                  value={formData.superAdmin.lastName || ""}
                  onChange={(e) => handleSuperAdminChange("lastName", e.target.value)}
                  onBlur={(e) => {
                    const err = validateSingleField("superAdmin_lastName", e.target.value);
                    setFieldErrors((prev) => ({ ...prev, superAdmin_lastName: err || "" }));
                  }}
                  error={fieldErrors["superAdmin_lastName"]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="superAdmin_email"
                  label="Superadmin Login Email *"
                  type="email"
                  placeholder="admin@company.com"
                  value={formData.superAdmin.email}
                  onChange={(e) => handleSuperAdminChange("email", e.target.value)}
                  onBlur={(e) => {
                    const err = validateSingleField("superAdmin_email", e.target.value);
                    setFieldErrors((prev) => ({ ...prev, superAdmin_email: err || "" }));
                  }}
                  error={fieldErrors["superAdmin_email"]}
                  required
                />

                <div className="relative flex flex-col">
                  <Input
                    id="superAdmin_password"
                    label="Superadmin Login Password *"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.superAdmin.password || ""}
                    onChange={(e) => handleSuperAdminChange("password", e.target.value)}
                    onBlur={(e) => {
                      const err = validateSingleField("superAdmin_password", e.target.value);
                      setFieldErrors((prev) => ({ ...prev, superAdmin_password: err || "" }));
                    }}
                    error={fieldErrors["superAdmin_password"]}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-[29px] text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
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
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : editCompany ? (
                  "Update Company Details"
                ) : (
                  "Submit & Register Company"
                )}
              </button>
            )}
          </div>

        </form>
      </div>
    </>
  );
}
