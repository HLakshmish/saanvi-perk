"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getRoles,
  getDepartments,
  getEmployees,
  createEmployee,
  createPersonalInfo,
  createParentInfo,
  createAddressInfo,
  createBankDetails,
  createPFDetail,
  createESIDetail,
  createInsuranceDetail,
  uploadEmployeeDocument,
  getDesignations,
  getOfficeLocations,
} from "../api/employees.api";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MapPin,
  Users,
  ShieldAlert,
  FileText,
  DollarSign,
  Undo2,
  Trash2,
  UploadCloud,
  Check,
  User as UserIcon,
} from "lucide-react";

interface AddEmployeeWizardProps {
  onCancel: () => void;
  onSuccess: () => void;
  currentRole: string;
}

const DRAFT_KEY = "saanvi_add_employee_draft";

export const AddEmployeeWizard: React.FC<AddEmployeeWizardProps> = ({
  onCancel,
  onSuccess,
  currentRole,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "address" | "family" | "statutory">("profile");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Master Data State
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  const filteredAdmins = useMemo(() => {
    return managers.filter((m) => m.designation.toLowerCase() === "admin");
  }, [managers]);

  // Wizard Data State
  const [formData, setFormData] = useState({
    // Step 1.1: Profile
    title: "Mr.",
    firstName: "",
    lastName: "",
    gender: "Male",
    maritalStatus: "Single",
    dateOfBirth: "",
    bloodGroup: "O+",
    nationality: "Indian",
    religion: "",
    motherTongue: "",
    profilePhoto: "",
    personalEmail: "",

    // Step 1.2: Address
    currentAddress: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
    },
    permanentAddress: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
    },
    isSameAddress: false,

    // Step 1.3: Family Info
    fatherName: "",
    fatherMobile: "",
    fatherOccupation: "",
    motherName: "",
    motherMobile: "",
    motherOccupation: "",
    guardianName: "",
    guardianMobile: "",
    guardianRelationship: "",

    // Step 1.4: Statutory Details
    aadhaarNumber: "",
    panNumber: "",
    passportNumber: "",
    passportExpiryDate: "",
    bankName: "",
    bankAccountNo: "",
    ifscCode: "",
    bankBranch: "",
    accountType: "Savings",
    uanNumber: "",
    esiNumber: "",
    insuranceProvider: "",
    insuranceType: "HEALTH",
    policyNumber: "",
    insuranceExpiryDate: "",
    accountHolderName: "",
    upiId: "",
    salaryAccount: true,

    // Step 2: User Creation
    employeeCode: "",
    officialEmail: "",
    password: "",
    roleId: "",
    roleIds: [] as number[],
    departmentId: "",
    designationId: "",
    employmentType: "FULL_TIME",
    joiningDate: "",
    probationEndDate: "",
    reportingToId: "",
    status: "ACTIVE",
    locationId: "",

    // Step 3: CTC
    annualCtc: "",
    basicSalary: "",
    hra: "",
    specialAllowance: "",
    professionalTax: "200",
    employerPf: "",
    employeePf: "",

    // Step 5: Documents
    docType: "Aadhaar",
    docNumber: "",
    docExpiryDate: "",
    docFile: null as File | null,
    docFileName: "",
    uploadedDocs: [] as Array<{
      type: string;
      number: string;
      fileName: string;
      expiry: string;
      file?: File | null;
    }>,

    // Step 6: Others
    emergencyName: "",
    emergencyMobile: "",
    remarks: "",
  });

  const filteredDesignations = useMemo(() => {
    if (!formData.departmentId) return designations;
    return designations.filter((d) => Number(d.departmentId) === Number(formData.departmentId));
  }, [designations, formData.departmentId]);

  // Load Master Data and Draft
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [rData, dData, mData, desData, locData] = await Promise.all([
          getRoles(),
          getDepartments(),
          getEmployees(),
          getDesignations(),
          getOfficeLocations(),
        ]);
        setRoles(rData);
        setDepartments(dData);
        setManagers(mData);
        setDesignations(desData);
        setLocations(locData);
      } catch (err) {
        console.warn("Failed to load master metadata", err);
      }
    };
    loadMasters();

    // Restore draft if exists
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.warn("Could not load form draft details", e);
        }
      }
    }
  }, []);

  // Save Draft on changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (
    type: "current" | "permanent",
    field: string,
    value: string
  ) => {
    setFormData((prev) => {
      const updatedAddress = {
        ...prev[type === "current" ? "currentAddress" : "permanentAddress"],
        [field]: value,
      };

      let permAddress = prev.permanentAddress;
      if (type === "current" && prev.isSameAddress) {
        permAddress = {
          ...updatedAddress,
        };
      }

      return {
        ...prev,
        currentAddress: type === "current" ? updatedAddress : prev.currentAddress,
        permanentAddress: type === "permanent" ? updatedAddress : permAddress,
      };
    });
  };

  const handleSameAddressToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isSameAddress: checked,
      permanentAddress: checked ? { ...prev.currentAddress } : prev.permanentAddress,
    }));
  };

  // Field validations
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\+?[0-9\s-]{10,15}$/.test(phone);
  const validatePAN = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
  const validateAadhaar = (aadhaar: string) => /^\d{12}$/.test(aadhaar);
  const validateIFSC = (ifsc: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());

  const validateStep = (step: number): boolean => {
    setErrorMsg(null);

    if (step === 1) {
      if (activeSubTab === "profile") {
        if (!formData.firstName) {
          setErrorMsg("First Name is required.");
          return false;
        }
        if (!formData.lastName) {
          setErrorMsg("Last Name is required.");
          return false;
        }
        if (formData.personalEmail && !validateEmail(formData.personalEmail)) {
          setErrorMsg("Personal Email address format is invalid.");
          return false;
        }
      } else if (activeSubTab === "address") {
        const cur = formData.currentAddress;
        if (!cur.addressLine1 || !cur.city || !cur.state || !cur.postalCode) {
          setErrorMsg("Current Address details (Line 1, City, State, and Pincode) are required.");
          return false;
        }
        if (!formData.isSameAddress) {
          const perm = formData.permanentAddress;
          if (!perm.addressLine1 || !perm.city || !perm.state || !perm.postalCode) {
            setErrorMsg("Permanent Address details are required unless same as current.");
            return false;
          }
        }
      } else if (activeSubTab === "family") {
        if (formData.fatherMobile && !validatePhone(formData.fatherMobile)) {
          setErrorMsg("Father's mobile number format is invalid.");
          return false;
        }
        if (formData.motherMobile && !validatePhone(formData.motherMobile)) {
          setErrorMsg("Mother's mobile number format is invalid.");
          return false;
        }
        if (formData.guardianMobile && !validatePhone(formData.guardianMobile)) {
          setErrorMsg("Guardian's mobile number format is invalid.");
          return false;
        }
      } else if (activeSubTab === "statutory") {
        if (formData.aadhaarNumber && !validateAadhaar(formData.aadhaarNumber)) {
          setErrorMsg("Aadhaar Number must be exactly 12 digits.");
          return false;
        }
        if (formData.panNumber && !validatePAN(formData.panNumber)) {
          setErrorMsg("PAN Number format is invalid (Format: ABCDE1234F).");
          return false;
        }
        if (!formData.bankName) {
          setErrorMsg("Bank Name is required.");
          return false;
        }
        if (!formData.bankAccountNo) {
          setErrorMsg("Bank Account Number is required.");
          return false;
        }
        if (!formData.ifscCode) {
          setErrorMsg("IFSC Code is required.");
          return false;
        }
        if (!validateIFSC(formData.ifscCode)) {
          setErrorMsg("IFSC Code format is invalid (e.g. SBIN0001234).");
          return false;
        }
        if (!formData.bankBranch) {
          setErrorMsg("Bank Branch is required.");
          return false;
        }
      }
    } else if (step === 2) {
      if (!formData.employeeCode) {
        setErrorMsg("Employee Code is required.");
        return false;
      }
      if (!formData.officialEmail) {
        setErrorMsg("Official Email is required.");
        return false;
      }
      if (!validateEmail(formData.officialEmail)) {
        setErrorMsg("Official Email format is invalid.");
        return false;
      }
      if (!formData.password || formData.password.length < 6) {
        setErrorMsg("Login Password is required and must be at least 6 characters.");
        return false;
      }
      if (!formData.roleIds || formData.roleIds.length === 0) {
        if (!formData.roleId) {
          setErrorMsg("At least one User Role assignment is required.");
          return false;
        }
      }

      if (!formData.joiningDate) {
        setErrorMsg("Joining Date is required.");
        return false;
      }
    } else if (step === 3) {
      // Documents section can proceed without strict uploads unless added.
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 1) {
      if (activeSubTab === "profile") {
        setActiveSubTab("address");
      } else if (activeSubTab === "address") {
        setActiveSubTab("family");
      } else if (activeSubTab === "family") {
        setActiveSubTab("statutory");
      } else {
        setCurrentStep(2);
      }
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (activeSubTab === "statutory") {
        setActiveSubTab("family");
      } else if (activeSubTab === "family") {
        setActiveSubTab("address");
      } else if (activeSubTab === "address") {
        setActiveSubTab("profile");
      }
    } else if (currentStep === 2) {
      setCurrentStep(1);
      setActiveSubTab("statutory");
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleDocumentAdd = () => {
    if (!formData.docNumber) {
      setErrorMsg("Please enter the document identifier number.");
      return;
    }
    const newDoc = {
      type: formData.docType,
      number: formData.docNumber,
      fileName: formData.docFileName || `${formData.docType.toLowerCase()}_copy.pdf`,
      expiry: formData.docExpiryDate,
      file: formData.docFile,
    };
    setFormData((prev) => ({
      ...prev,
      uploadedDocs: [...prev.uploadedDocs, newDoc],
      docNumber: "",
      docExpiryDate: "",
      docFile: null,
      docFileName: "",
    }));
    setSuccessMsg("Document attached successfully!");
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const handleRemoveDoc = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      uploadedDocs: prev.uploadedDocs.filter((_, i) => i !== index),
    }));
  };

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DRAFT_KEY);
    }
    onCancel();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 4) {
      nextStep();
      return;
    }

    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Create Base User Profile
      const baseUserData = {
        employeeCode: formData.employeeCode,
        roleIds: formData.roleIds.length > 0 ? formData.roleIds : (formData.roleId ? [Number(formData.roleId)] : []),
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        designationId: formData.designationId ? Number(formData.designationId) : null,
        firstName: formData.firstName,
        lastName: formData.lastName,
        officialEmail: formData.officialEmail,
        phoneNumber: formData.fatherMobile || null,
        password: formData.password,
        employmentType: formData.employmentType,
        joiningDate: new Date(formData.joiningDate).toISOString(),
        probationEndDate: formData.probationEndDate ? new Date(formData.probationEndDate).toISOString() : null,
        reportingToId: formData.reportingToId ? Number(formData.reportingToId) : null,
        status: formData.status || "ACTIVE",
        locationId: formData.locationId ? Number(formData.locationId) : null,
      };

      const userRes = await createEmployee(baseUserData);

      if (!userRes.success || !userRes.data) {
        throw new Error(userRes.error || "Failed to register corporate user account.");
      }

      const createdUserId = userRes.data.userId;

      // 2. Create Personal Information Record (if any personal field is provided)
      try {
        const personalData = {
          userId: createdUserId,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
          gender: formData.gender || null,
          maritalStatus: formData.maritalStatus || null,
          bloodGroup: formData.bloodGroup || null,
          nationality: formData.nationality || null,
          religion: formData.religion || null,
          motherTongue: formData.motherTongue || null,
          aadhaarNumber: formData.aadhaarNumber || null,
          panNumber: formData.panNumber || null,
          passportNumber: formData.passportNumber || null,
          profilePhoto: formData.profilePhoto || null,
          personalEmail: formData.personalEmail || null,
          officialEmail: formData.officialEmail || null,
        };
        await createPersonalInfo(personalData);
      } catch (err) {
        console.warn("Could not save secondary personal info:", err);
      }

      // 3. Create Parent Info Record (if any parent field is provided)
      if (formData.fatherName || formData.motherName || formData.guardianName) {
        try {
          const parentData = {
            userId: createdUserId,
            fatherName: formData.fatherName || null,
            fatherMobile: formData.fatherMobile || null,
            fatherOccupation: formData.fatherOccupation || null,
            motherName: formData.motherName || null,
            motherMobile: formData.motherMobile || null,
            motherOccupation: formData.motherOccupation || null,
            guardianName: formData.guardianName || null,
            guardianMobile: formData.guardianMobile || null,
            relationship: formData.guardianRelationship || null,
          };
          await createParentInfo(parentData);
        } catch (err) {
          console.warn("Could not save secondary parent info:", err);
        }
      }

      // 4. Create Address Records (if address is provided)
      if (formData.currentAddress?.addressLine1 && formData.currentAddress?.city) {
        try {
          const currentAddressData = {
            userId: createdUserId,
            addressType: "CURRENT",
            addressLine1: formData.currentAddress.addressLine1,
            addressLine2: formData.currentAddress.addressLine2 || null,
            city: formData.currentAddress.city,
            state: formData.currentAddress.state || "State",
            country: formData.currentAddress.country || "India",
            postalCode: formData.currentAddress.postalCode || "000000",
          };
          await createAddressInfo(currentAddressData);

          if (!formData.isSameAddress && formData.permanentAddress?.addressLine1) {
            const permanentAddressData = {
              userId: createdUserId,
              addressType: "PERMANENT",
              addressLine1: formData.permanentAddress.addressLine1,
              addressLine2: formData.permanentAddress.addressLine2 || null,
              city: formData.permanentAddress.city || formData.currentAddress.city,
              state: formData.permanentAddress.state || "State",
              country: formData.permanentAddress.country || "India",
              postalCode: formData.permanentAddress.postalCode || "000000",
            };
            await createAddressInfo(permanentAddressData);
          }
        } catch (err) {
          console.warn("Could not save address info:", err);
        }
      }

      // 5. Create Bank Details Record (only if bank details are provided)
      if (formData.bankName?.trim() && formData.bankAccountNo?.trim()) {
        try {
          const bankDetailsData = {
            userId: createdUserId,
            accountHolderName: (formData.accountHolderName || `${formData.firstName} ${formData.lastName}`).trim(),
            bankName: formData.bankName.trim(),
            branchName: formData.bankBranch?.trim() || "Main Branch",
            accountNumber: formData.bankAccountNo.trim(),
            ifscCode: formData.ifscCode?.trim() || "BANK0000000",
            accountType: formData.accountType || "Savings",
            upiId: formData.upiId || null,
            salaryAccount: formData.salaryAccount,
          };
          await createBankDetails(bankDetailsData);
        } catch (err) {
          console.warn("Could not save bank details:", err);
        }
      }

      // 6. Create PF Details Record (if uanNumber is provided)
      if (formData.uanNumber?.trim()) {
        try {
          const pfData = {
            userId: createdUserId,
            uanNumber: formData.uanNumber.trim(),
            isInternationalWorker: false,
            educationLevel: null,
            pfNumber: null,
            pfJoiningDate: null,
            pfLeavingDate: null,
            documentNumber: null,
            documentType: null,
            documentExpiryDate: null,
            reasonForLeaving: null,
            phcCategory: null,
          };
          await createPFDetail(pfData);
        } catch (err) {
          console.warn("Could not save PF details:", err);
        }
      }

      // 7. Create ESI Details Record (if esiNumber is provided)
      if (formData.esiNumber?.trim()) {
        try {
          const esiData = {
            userId: createdUserId,
            esiNumber: formData.esiNumber.trim(),
            esiJoiningDate: null,
            esiLeavingDate: null,
            reasonForLeaving: null,
          };
          await createESIDetail(esiData);
        } catch (err) {
          console.warn("Could not save ESI details:", err);
        }
      }

      // 8. Create Insurance Details Record (if policyNumber or insuranceProvider is provided)
      if (formData.insuranceProvider?.trim() || formData.policyNumber?.trim()) {
        try {
          const insuranceData = {
            userId: createdUserId,
            insuranceProvider: formData.insuranceProvider || null,
            insuranceType: (formData.insuranceType || "HEALTH") as any,
            policyNumber: formData.policyNumber || null,
            insuranceExpiryDate: formData.insuranceExpiryDate ? new Date(formData.insuranceExpiryDate).toISOString() : null,
          };
          await createInsuranceDetail(insuranceData);
        } catch (err) {
          console.warn("Could not save insurance details:", err);
        }
      }

      // 9. Upload Documents (if any documents are attached)
      if (formData.uploadedDocs && formData.uploadedDocs.length > 0) {
        for (const doc of formData.uploadedDocs) {
          if (doc.file) {
            try {
              let documentType = "OTHER";
              const normType = doc.type.toLowerCase();
              if (normType.includes("aadhaar")) documentType = "AADHAAR";
              else if (normType.includes("pan")) documentType = "PAN";
              else if (normType.includes("passport")) documentType = "PASSPORT";
              else if (normType.includes("degree")) documentType = "DEGREE_CERTIFICATE";
              else if (normType.includes("relieving")) documentType = "RELIEVING_LETTER";
              
              await uploadEmployeeDocument(createdUserId, documentType, doc.file);
            } catch (err) {
              console.warn("Could not upload document:", err);
            }
          }
        }
      }



      // Clear draft
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_KEY);
      }

      setSuccessMsg("Employee added successfully!");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during submission.");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Profile Info", icon: UserIcon },
    { number: 2, title: "User Account", icon: Briefcase },
    { number: 3, title: "Documents", icon: FileText },
    { number: 4, title: "Others", icon: Users },
  ];

  return (
    <>
      <style>{`
        .wizard-theme input,
        .wizard-theme select,
        .wizard-theme textarea {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-color: #cbd5e1 !important;
        }
        .wizard-theme input::placeholder {
          color: #94a3b8 !important;
        }
        .wizard-theme input:hover {
          border-color: #94a3b8 !important;
        }
        .wizard-theme input:focus,
        .wizard-theme input:focus-visible,
        .wizard-theme select:focus,
        .wizard-theme select:focus-visible {
          border-color: #013e37 !important;
          box-shadow: 0 0 0 3px rgba(1, 62, 55, 0.15) !important;
          outline: none !important;
        }
        .wizard-theme label {
          color: #374151 !important;
        }
      `}</style>

      <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden p-6 sm:p-8 wizard-theme text-slate-800 animate-in fade-in duration-200">
        
        {/* Wizard Header Banner */}
        <div className="mb-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-slate-50 text-slate-500 hover:text-[#013e37] border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Return to Directory"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-[#013e37] leading-tight">
                Add New Employee
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Enter details to add an employee to your organization.
              </p>
            </div>
          </div>
          <button
            onClick={clearDraft}
            className="text-xs font-bold text-rose-500 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-xl px-3 py-1.5 self-start sm:self-center flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Draft</span>
          </button>
        </div>

        {/* Wizard Progress Timeline */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 overflow-x-auto">
          {steps.map((step, idx) => {
            const isActive = currentStep === step.number;
            const isDone = currentStep > step.number;

            return (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? "bg-[#013e37] text-[#ffefb3]"
                        : isActive
                        ? "bg-[#013e37] text-[#ffefb3] ring-4 ring-[#013e37]/20"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-[#ffefb3]" /> : step.number}
                  </div>
                  <span
                    className={`text-xs font-bold hidden sm:inline ${
                      isActive ? "text-[#013e37]" : isDone ? "text-[#013e37]" : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className={`h-0.5 w-6 sm:w-10 mx-2 ${currentStep > step.number ? "bg-emerald-500" : "bg-slate-200"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Alerts */}
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

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* STEP 1: PROFILE AND SUB-TABS */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Nested Sub-Tab Navigation */}
              <div className="flex border-b border-slate-200/80 gap-1 overflow-x-auto pb-0.5">
                {[
                  { id: "profile", label: "Profile" },
                  { id: "address", label: "Address" },
                  { id: "family", label: "Family Info" },
                  { id: "statutory", label: "Statutory Details" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSubTab(tab.id as any)}
                    className={`px-4 py-2 text-xs font-bold border-b-2 transition-all transition-colors duration-150 cursor-pointer ${
                      activeSubTab === tab.id
                        ? "border-[#013e37] text-[#013e37] font-extrabold"
                        : "border-transparent text-slate-500 hover:text-[#013e37]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sub-Tab 1: Profile Details */}
              {activeSubTab === "profile" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-150">
                  {/* Photo Section */}
                  <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl gap-3">
                    <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden relative shadow-2xs">
                      {formData.profilePhoto ? (
                        <img
                          src={formData.profilePhoto}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-10 h-10" />
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <label className="cursor-pointer bg-white hover:bg-slate-50 text-indigo-600 border border-slate-300 shadow-2xs rounded-lg px-3 py-1.5 text-xs font-bold transition-all">
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handleChange("profilePhoto", reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 1MB</span>
                    </div>
                  </div>

                  {/* Profile Fields */}
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Title *</label>
                      <select
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                        value={formData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="None">None</option>
                      </select>
                    </div>

                    <Input
                      label="First Name *"
                      placeholder="e.g. Chinmaya"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      required
                    />

                    <Input
                      label="Last Name *"
                      placeholder="e.g. Bairy"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      required
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Gender *</label>
                      <select
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                        value={formData.gender}
                        onChange={(e) => handleChange("gender", e.target.value)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <Input
                      label="Date of Birth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Marital Status</label>
                      <select
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                        value={formData.maritalStatus}
                        onChange={(e) => handleChange("maritalStatus", e.target.value)}
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Blood Group</label>
                      <select
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                        value={formData.bloodGroup}
                        onChange={(e) => handleChange("bloodGroup", e.target.value)}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <Input
                      label="Personal Email"
                      type="email"
                      placeholder="name@email.com"
                      value={formData.personalEmail}
                      onChange={(e) => handleChange("personalEmail", e.target.value)}
                    />

                    <Input
                      label="Nationality"
                      value={formData.nationality}
                      onChange={(e) => handleChange("nationality", e.target.value)}
                    />

                    <Input
                      label="Religion"
                      placeholder="e.g. Hindu"
                      value={formData.religion}
                      onChange={(e) => handleChange("religion", e.target.value)}
                    />

                    <Input
                      label="Mother Tongue"
                      placeholder="e.g. Kannada"
                      value={formData.motherTongue}
                      onChange={(e) => handleChange("motherTongue", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Address */}
              {activeSubTab === "address" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Current Address */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Current Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Input
                          label="Address Line 1 *"
                          placeholder="House No, Building, Street Name"
                          value={formData.currentAddress.addressLine1}
                          onChange={(e) => handleAddressChange("current", "addressLine1", e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          label="Address Line 2"
                          placeholder="Locality, Sector, Landmark"
                          value={formData.currentAddress.addressLine2}
                          onChange={(e) => handleAddressChange("current", "addressLine2", e.target.value)}
                        />
                      </div>
                      <Input
                        label="City *"
                        placeholder="Bengaluru"
                        value={formData.currentAddress.city}
                        onChange={(e) => handleAddressChange("current", "city", e.target.value)}
                      />
                      <Input
                        label="State *"
                        placeholder="Karnataka"
                        value={formData.currentAddress.state}
                        onChange={(e) => handleAddressChange("current", "state", e.target.value)}
                      />
                      <Input
                        label="Pincode *"
                        placeholder="560001"
                        value={formData.currentAddress.postalCode}
                        onChange={(e) => handleAddressChange("current", "postalCode", e.target.value)}
                      />
                      <Input
                        label="Country"
                        value={formData.currentAddress.country}
                        onChange={(e) => handleAddressChange("current", "country", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Checkbox same as current */}
                  <div className="flex items-center gap-2 py-2 border-t border-slate-100">
                    <input
                      type="checkbox"
                      id="isSameAddress"
                      checked={formData.isSameAddress}
                      onChange={(e) => handleSameAddressToggle(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="isSameAddress" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                      Permanent Address is same as Current Address
                    </label>
                  </div>

                  {/* Permanent Address */}
                  {!formData.isSameAddress && (
                    <div className="space-y-4 pt-2 border-t border-slate-100 animate-in slide-in-from-top-2 duration-150">
                      <h3 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Permanent Address</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Input
                            label="Address Line 1 *"
                            placeholder="House No, Building, Street Name"
                            value={formData.permanentAddress.addressLine1}
                            onChange={(e) => handleAddressChange("permanent", "addressLine1", e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Input
                            label="Address Line 2"
                            placeholder="Locality, Sector, Landmark"
                            value={formData.permanentAddress.addressLine2}
                            onChange={(e) => handleAddressChange("permanent", "addressLine2", e.target.value)}
                          />
                        </div>
                        <Input
                          label="City *"
                          placeholder="Bengaluru"
                          value={formData.permanentAddress.city}
                          onChange={(e) => handleAddressChange("permanent", "city", e.target.value)}
                        />
                        <Input
                          label="State *"
                          placeholder="Karnataka"
                          value={formData.permanentAddress.state}
                          onChange={(e) => handleAddressChange("permanent", "state", e.target.value)}
                        />
                        <Input
                          label="Pincode *"
                          placeholder="560001"
                          value={formData.permanentAddress.postalCode}
                          onChange={(e) => handleAddressChange("permanent", "postalCode", e.target.value)}
                        />
                        <Input
                          label="Country"
                          value={formData.permanentAddress.country}
                          onChange={(e) => handleAddressChange("permanent", "country", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 3: Family Info */}
              {activeSubTab === "family" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Father's Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Father's Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Father Name"
                        placeholder="Enter name"
                        value={formData.fatherName}
                        onChange={(e) => handleChange("fatherName", e.target.value)}
                      />
                      <Input
                        label="Father Mobile"
                        placeholder="e.g. +91 9876543210"
                        value={formData.fatherMobile}
                        onChange={(e) => handleChange("fatherMobile", e.target.value)}
                      />
                      <Input
                        label="Father Occupation"
                        placeholder="e.g. Businessman"
                        value={formData.fatherOccupation}
                        onChange={(e) => handleChange("fatherOccupation", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Mother's Info */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Mother's Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Mother Name"
                        placeholder="Enter name"
                        value={formData.motherName}
                        onChange={(e) => handleChange("motherName", e.target.value)}
                      />
                      <Input
                        label="Mother Mobile"
                        placeholder="e.g. +91 9876543210"
                        value={formData.motherMobile}
                        onChange={(e) => handleChange("motherMobile", e.target.value)}
                      />
                      <Input
                        label="Mother Occupation"
                        placeholder="e.g. Homemaker"
                        value={formData.motherOccupation}
                        onChange={(e) => handleChange("motherOccupation", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Guardian's Info */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Guardian's Details (Optional)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Input
                        label="Guardian Name"
                        placeholder="Enter name"
                        value={formData.guardianName}
                        onChange={(e) => handleChange("guardianName", e.target.value)}
                      />
                      <Input
                        label="Guardian Mobile"
                        placeholder="e.g. +91 9876543210"
                        value={formData.guardianMobile}
                        onChange={(e) => handleChange("guardianMobile", e.target.value)}
                      />
                      <Input
                        label="Relationship"
                        placeholder="e.g. Uncle"
                        value={formData.guardianRelationship}
                        onChange={(e) => handleChange("guardianRelationship", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 4: Statutory Details */}
              {activeSubTab === "statutory" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Identity & Bank Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Identity and Bank Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Aadhaar No"
                        placeholder="12 digits number (e.g. 123456789012)"
                        value={formData.aadhaarNumber}
                        onChange={(e) => handleChange("aadhaarNumber", e.target.value)}
                      />

                      <Input
                        label="PAN No"
                        placeholder="PAN identifier (e.g. ABCDE1234F)"
                        value={formData.panNumber}
                        onChange={(e) => handleChange("panNumber", e.target.value.toUpperCase())}
                      />

                      <Input
                        label="Bank Name"
                        placeholder="e.g. State Bank of India"
                        value={formData.bankName}
                        onChange={(e) => handleChange("bankName", e.target.value)}
                      />

                      <Input
                        label="Bank Account No"
                        placeholder="Account identifier number"
                        value={formData.bankAccountNo}
                        onChange={(e) => handleChange("bankAccountNo", e.target.value)}
                      />

                      <Input
                        label="IFSC/BIN Code"
                        placeholder="11 alphanumeric code (e.g. SBIN0001234)"
                        value={formData.ifscCode}
                        onChange={(e) => handleChange("ifscCode", e.target.value.toUpperCase())}
                      />

                      <Input
                        label="Branch"
                        placeholder="e.g. Saligrama Branch"
                        value={formData.bankBranch}
                        onChange={(e) => handleChange("bankBranch", e.target.value)}
                      />

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Account Type *</label>
                        <select
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                          value={formData.accountType}
                          onChange={(e) => handleChange("accountType", e.target.value)}
                        >
                          <option value="Savings">Savings</option>
                          <option value="Current">Current</option>
                        </select>
                      </div>

                      <Input
                        label="Account Holder Name"
                        placeholder="Prefills with full name if left blank"
                        value={formData.accountHolderName}
                        onChange={(e) => handleChange("accountHolderName", e.target.value)}
                      />

                      <Input
                        label="UPI ID"
                        placeholder="e.g. employee@upi"
                        value={formData.upiId}
                        onChange={(e) => handleChange("upiId", e.target.value)}
                      />

                      <div className="flex items-center gap-2 py-2 sm:col-span-2">
                        <input
                          type="checkbox"
                          id="salaryAccount"
                          checked={formData.salaryAccount}
                          onChange={(e) => handleChange("salaryAccount", e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <label htmlFor="salaryAccount" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                          Is this a Salary Account?
                        </label>
                      </div>

                      <Input
                        label="Passport Number"
                        placeholder="Passport ID"
                        value={formData.passportNumber}
                        onChange={(e) => handleChange("passportNumber", e.target.value)}
                      />

                      <Input
                        label="Passport Expiry Date"
                        type="date"
                        value={formData.passportExpiryDate}
                        onChange={(e) => handleChange("passportExpiryDate", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* PF Details */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">PF Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="UAN No"
                        placeholder="PF Universal Account Number"
                        value={formData.uanNumber}
                        onChange={(e) => handleChange("uanNumber", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* ESI Details */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">ESI Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="ESI Number"
                        placeholder="ESI Account Number"
                        value={formData.esiNumber}
                        onChange={(e) => handleChange("esiNumber", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Insurance Details */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Insurance Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Insurance Provider"
                        placeholder="e.g. LIC / HDFC Ergo"
                        value={formData.insuranceProvider}
                        onChange={(e) => handleChange("insuranceProvider", e.target.value)}
                      />
                      
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-semibold">Insurance Type</label>
                        <select
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                          value={formData.insuranceType}
                          onChange={(e) => handleChange("insuranceType", e.target.value)}
                        >
                          <option value="HEALTH">Health Insurance</option>
                          <option value="LIFE">Life Insurance</option>
                          <option value="ACCIDENT">Accident Insurance</option>
                          <option value="GROUP_MEDICAL">Group Medical</option>
                          <option value="GROUP_LIFE">Group Life</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <Input
                        label="Policy Number"
                        placeholder="Insurance Policy ID"
                        value={formData.policyNumber}
                        onChange={(e) => handleChange("policyNumber", e.target.value)}
                      />

                      <Input
                        label="Insurance Expiry Date"
                        type="date"
                        value={formData.insuranceExpiryDate}
                        onChange={(e) => handleChange("insuranceExpiryDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: USER CREATION / ACCOUNT DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>Step 2: User Account & Login Credentials</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Employee Code *"
                  placeholder="e.g. ST00057"
                  value={formData.employeeCode}
                  onChange={(e) => handleChange("employeeCode", e.target.value.toUpperCase())}
                  required
                />

                <Input
                  label="Official Login Email *"
                  type="email"
                  placeholder="employee@saanvi.com"
                  value={formData.officialEmail}
                  onChange={(e) => handleChange("officialEmail", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left w-full relative">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Login Password *
                  </label>
                  <div className="relative w-full">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      required
                      className="flex w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-2xs transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-left sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Assigned Roles <span className="text-rose-500">*</span>{" "}
                    <span className="text-[10px] text-slate-400 font-normal lowercase">(select one or more)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 border border-slate-300 rounded-xl bg-slate-50/50 min-h-[48px] items-center">
                    {roles.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No roles configured</span>
                    ) : (
                      roles.map((r) => {
                        const currentList = formData.roleIds || (formData.roleId ? [Number(formData.roleId)] : []);
                        const isSelected = currentList.includes(r.roleId);
                        return (
                          <button
                            key={r.roleId}
                            type="button"
                            onClick={() => {
                              const updated = isSelected
                                ? currentList.filter((id) => id !== r.roleId)
                                : [...currentList, r.roleId];
                              
                              const isAdm = roles.some((role) => updated.includes(role.roleId) && role.roleName.toLowerCase() === "admin");

                              setFormData((prev) => ({
                                ...prev,
                                roleIds: updated,
                                roleId: updated.length > 0 ? String(updated[0]) : "",
                                reportingToId: isAdm ? "" : prev.reportingToId,
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                              isSelected
                                ? "bg-[#013e37] text-[#ffefb3] border-[#013e37] shadow-2xs"
                                : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                                isSelected ? "border-[#ffefb3] bg-[#ffefb3] text-[#013e37] font-extrabold" : "border-slate-400"
                              }`}
                            >
                              {isSelected && "✓"}
                            </span>
                            <span>{r.roleName}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                  {(!formData.roleIds || formData.roleIds.length === 0) && (
                    <p className="text-[10px] text-slate-400 font-semibold">Select at least one role to grant system access.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Department</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                    value={formData.departmentId}
                    onChange={(e) => handleChange("departmentId", e.target.value)}
                  >
                    <option value="">-- Choose Department --</option>
                    {departments.map((d) => (
                      <option key={d.departmentId} value={d.departmentId}>
                        {d.departmentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Employment Type</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                    value={formData.employmentType}
                    onChange={(e) => handleChange("employmentType", e.target.value)}
                  >
                    <option value="FULL_TIME">Full-Time</option>
                    <option value="PART_TIME">Part-Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Designation</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                    value={formData.designationId}
                    onChange={(e) => handleChange("designationId", e.target.value)}
                  >
                    <option value="">-- Choose Designation --</option>
                    {filteredDesignations.map((des) => (
                      <option key={des.designationId} value={des.designationId}>
                        {des.designationName} ({des.designationCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Office Location</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                    value={formData.locationId}
                    onChange={(e) => handleChange("locationId", e.target.value)}
                  >
                    <option value="">-- Choose Location --</option>
                    {locations.map((loc) => (
                      <option key={loc.officeLocationId} value={loc.officeLocationId}>
                        {loc.locationName} ({loc.city || "N/A"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Status</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="RESIGNED">Resigned</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Joining Date *"
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => handleChange("joiningDate", e.target.value)}
                  required
                />

                <Input
                  label="Probation End Date"
                  type="date"
                  value={formData.probationEndDate}
                  onChange={(e) => handleChange("probationEndDate", e.target.value)}
                />

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Reporting Manager</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    value={formData.reportingToId}
                    onChange={(e) => handleChange("reportingToId", e.target.value)}
                    disabled={roles.find((r) => String(r.roleId) === String(formData.roleId))?.roleName.toLowerCase() === "admin"}
                  >
                    {roles.find((r) => String(r.roleId) === String(formData.roleId))?.roleName.toLowerCase() === "admin" ? (
                      <option value="">-- Reports to SuperAdmin --</option>
                    ) : (
                      <>
                        <option value="">-- Select Admin Manager --</option>
                        {filteredAdmins.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.employeeCode})
                          </option>
                        ))}
                        {filteredAdmins.length === 0 && (
                          <option value="" disabled>-- No Admins Available. Please onboard an Admin first --</option>
                        )}
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DOCUMENTS UPLOADS */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Step 3: KYC Verification & Document Vault</span>
              </h3>

              {/* Upload Input form */}
              <div className="space-y-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Document Type</label>
                    <select
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                      value={formData.docType}
                      onChange={(e) => handleChange("docType", e.target.value)}
                    >
                      <option value="Aadhaar">Aadhaar Card</option>
                      <option value="PAN">PAN Card</option>
                      <option value="Passport">Passport Details</option>
                      <option value="Degree Certificate">Graduation Degree</option>
                      <option value="Relieving Letter">Relieving Letter</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Document Code/Number *"
                      placeholder="Enter document identifier"
                      value={formData.docNumber}
                      onChange={(e) => handleChange("docNumber", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="sm:col-span-2 flex flex-col gap-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Upload File (Optional)</label>
                    <div className="relative flex items-center justify-between border border-slate-300 bg-white rounded-xl px-3 h-11 hover:border-slate-400 transition-colors">
                      <span className="text-xs text-slate-500 truncate max-w-[200px]">
                        {formData.docFileName || "No file selected"}
                      </span>
                      <input
                        type="file"
                        id="wizardDocFile"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFormData((p) => ({
                            ...p,
                            docFile: file,
                            docFileName: file ? file.name : "",
                          }));
                        }}
                        className="hidden"
                      />
                      <label 
                        htmlFor="wizardDocFile"
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-2.5 py-1.5 cursor-pointer select-none"
                      >
                        Choose File
                      </label>
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleDocumentAdd}
                      className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Attach Document</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-2 mt-4">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Attached Files</h4>
                {formData.uploadedDocs.length === 0 ? (
                  <div className="text-center p-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    No documents attached. You can proceed without uploading files.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {formData.uploadedDocs.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold">
                            PDF
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800">{doc.type}</span>
                            <span className="text-[10px] text-slate-400 block">{doc.fileName} • ID: {doc.number}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(index)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: OTHERS / REMARKS */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Step 4: Additional Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Emergency Contact Name"
                  placeholder="e.g. Veena Sharma"
                  value={formData.emergencyName}
                  onChange={(e) => handleChange("emergencyName", e.target.value)}
                />

                <Input
                  label="Emergency Contact Mobile"
                  placeholder="e.g. +91 9876543210"
                  value={formData.emergencyMobile}
                  onChange={(e) => handleChange("emergencyMobile", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Remarks / Comments</label>
                <textarea
                  placeholder="Any additional remarks regarding background check or onboarding notes..."
                  value={formData.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                  className="w-full min-h-24 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              className={`px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentStep === 1 && activeSubTab === "profile" ? "invisible" : ""
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep < 4 || (currentStep === 1 && activeSubTab !== "statutory") ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2.5 rounded-xl bg-[#013e37] hover:bg-[#012d28] text-[#ffefb3] text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer active:scale-[0.98]"
              >
                Next
                <ChevronRight className="w-4 h-4 text-[#ffefb3]" />
              </button>
            ) : (
              <Button
                type="submit"
                isLoading={isLoading}
                variant="primary"
                size="md"
                className="px-6 active:scale-[0.98]"
              >
                Submit & Add Employee
              </Button>
            )}
          </div>

        </form>
      </div>
    </>
  );
};
