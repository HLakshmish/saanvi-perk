import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getUserById,
  getPersonalInfoByUserId,
  getParentInfoByUserId,
  getAddressInfoByUserId,
  getBankDetailsByUserId,
  getPFDetailsByUserId,
  getESIDetailsByUserId,
  getInsuranceDetailsByUserId,
  getRoles,
  getDepartments,
  getEmployees,
  updateUser,
  createPersonalInfo,
  updatePersonalInfo,
  createParentInfo,
  updateParentInfo,
  createAddressInfo,
  updateAddressInfo,
  createBankDetails,
  updateBankDetails,
  createPFDetail,
  updatePFDetail,
  createESIDetail,
  updateESIDetail,
  createInsuranceDetail,
  updateInsuranceDetail,
  getDesignations,
  getOfficeLocations,
} from "../api/employees.api";

interface EmployeeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeId: number; // This is the userId
  employeeName: string;
}

type TabType = "account" | "personal" | "address" | "statutory";

export const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employeeId,
  employeeName,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("account");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Master Data
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  const filteredAdmins = useMemo(() => {
    return managers.filter((m) => m.designation.toLowerCase() === "admin");
  }, [managers]);

  // Existing Record IDs (to decide between POST and PUT)
  const [personalInfoId, setPersonalInfoId] = useState<number | null>(null);
  const [parentInfoExists, setParentInfoExists] = useState<boolean>(false);
  const [currentAddressExists, setCurrentAddressExists] = useState<boolean>(false);
  const [permanentAddressExists, setPermanentAddressExists] = useState<boolean>(false);
  const [bankId, setBankId] = useState<number | null>(null);
  const [pfDetailId, setPfDetailId] = useState<number | null>(null);
  const [esiDetailId, setEsiDetailId] = useState<number | null>(null);
  const [insuranceId, setInsuranceId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // User Profile
    employeeCode: "",
    officialEmail: "",
    password: "", // Optional
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

    // Personal Info
    dateOfBirth: "",
    gender: "Male",
    maritalStatus: "Single",
    bloodGroup: "O+",
    nationality: "Indian",
    personalEmail: "",
    profilePhoto: "",
    aadhaarNumber: "",
    panNumber: "",
    passportNumber: "",
    passportExpiryDate: "",

    // Parents Info
    fatherName: "",
    fatherMobile: "",
    fatherOccupation: "",
    motherName: "",
    motherMobile: "",
    motherOccupation: "",
    guardianName: "",
    guardianMobile: "",
    guardianRelationship: "",

    // Addresses
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

    // Bank details
    bankName: "",
    bankAccountNo: "",
    ifscCode: "",
    bankBranch: "",
    accountType: "Savings",
    accountHolderName: "",
    upiId: "",
    salaryAccount: true,

    // Statutory Details
    uanNumber: "",
    esiNumber: "",
    insuranceProvider: "",
    insuranceType: "HEALTH",
    policyNumber: "",
    insuranceExpiryDate: "",
  });

  const filteredDesignations = useMemo(() => {
    if (!formData.departmentId) return designations;
    return designations.filter((d) => Number(d.departmentId) === Number(formData.departmentId));
  }, [designations, formData.departmentId]);

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
        permAddress = { ...updatedAddress };
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

  // Load masters and user details
  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch Masters
      const [rData, dData, mData, desData, locData] = await Promise.all([
        getRoles(),
        getDepartments(),
        getEmployees(),
        getDesignations(),
        getOfficeLocations(),
      ]);
      setRoles(rData || []);
      setDepartments(dData || []);
      setManagers(mData || []);
      setDesignations(desData || []);
      setLocations(locData || []);

      // 2. Fetch Employee Details
      const [
        userRes,
        personalRes,
        parentRes,
        addressRes,
        bankRes,
        pfRes,
        esiRes,
        insRes,
      ] = await Promise.all([
        getUserById(employeeId),
        getPersonalInfoByUserId(employeeId),
        getParentInfoByUserId(employeeId),
        getAddressInfoByUserId(employeeId),
        getBankDetailsByUserId(employeeId),
        getPFDetailsByUserId(employeeId),
        getESIDetailsByUserId(employeeId),
        getInsuranceDetailsByUserId(employeeId),
      ]);

      if (!userRes.success) throw new Error(userRes.error || "Failed to load user profile");

      const u = userRes.data;
      const pi = personalRes.success && personalRes.data && personalRes.data.length > 0 ? personalRes.data[0] : null;
      const pa = parentRes.success ? parentRes.data : null;
      const addrList = addressRes.success ? addressRes.data || [] : [];
      const bk = bankRes.success && bankRes.data && bankRes.data.length > 0 ? bankRes.data[0] : null;
      const pf = pfRes.success && pfRes.data && pfRes.data.length > 0 ? pfRes.data[0] : null;
      const esi = esiRes.success && esiRes.data && esiRes.data.length > 0 ? esiRes.data[0] : null;
      const ins = insRes.success && insRes.data && insRes.data.length > 0 ? insRes.data[0] : null;

      // Track Database IDs
      if (pi) setPersonalInfoId(pi.personalInfoId);
      if (pa) setParentInfoExists(true);
      if (bk) setBankId(bk.bankId);
      if (pf) setPfDetailId(pf.pfDetailId);
      if (esi) setEsiDetailId(esi.esiDetailId);
      if (ins) setInsuranceId(ins.insuranceId);

      const curAddr = addrList.find((a: any) => a.addressType === "CURRENT");
      const permAddr = addrList.find((a: any) => a.addressType === "PERMANENT");
      if (curAddr) setCurrentAddressExists(true);
      if (permAddr) setPermanentAddressExists(true);

      const assignedRoleIds = Array.isArray(u.userRoles) && u.userRoles.length > 0
        ? u.userRoles.map((ur: any) => Number(ur.roleId || ur.role?.roleId)).filter(Boolean)
        : (u.roleId ? [Number(u.roleId)] : []);

      // Populate Form State
      setFormData({
        employeeCode: u.employeeCode || "",
        officialEmail: u.officialEmail || "",
        password: "", // Keep blank, will only update if filled
        roleId: assignedRoleIds.length > 0 ? String(assignedRoleIds[0]) : "",
        roleIds: assignedRoleIds,
        departmentId: u.departmentId ? String(u.departmentId) : "",
        designationId: u.designationId ? String(u.designationId) : "",
        employmentType: u.employmentType || "FULL_TIME",
        joiningDate: u.joiningDate ? u.joiningDate.split("T")[0] : "",
        probationEndDate: u.probationEndDate ? u.probationEndDate.split("T")[0] : "",
        reportingToId: u.reportingToId ? String(u.reportingToId) : "",
        status: u.status || "ACTIVE",
        locationId: u.locationId ? String(u.locationId) : "",

        dateOfBirth: pi?.dateOfBirth ? pi.dateOfBirth.split("T")[0] : "",
        gender: pi?.gender || "Male",
        maritalStatus: pi?.maritalStatus || "Single",
        bloodGroup: pi?.bloodGroup || "O+",
        nationality: pi?.nationality || "Indian",
        personalEmail: pi?.personalEmail || "",
        profilePhoto: pi?.profilePhoto || "",
        aadhaarNumber: pi?.aadhaarNumber || "",
        panNumber: pi?.panNumber || "",
        passportNumber: pi?.passportNumber || "",
        passportExpiryDate: pi?.passportExpiryDate ? pi.passportExpiryDate.split("T")[0] : "",

        fatherName: pa?.fatherName || "",
        fatherMobile: pa?.fatherMobile || "",
        fatherOccupation: pa?.fatherOccupation || "",
        motherName: pa?.motherName || "",
        motherMobile: pa?.motherMobile || "",
        motherOccupation: pa?.motherOccupation || "",
        guardianName: pa?.guardianName || "",
        guardianMobile: pa?.guardianMobile || "",
        guardianRelationship: pa?.relationship || "",

        currentAddress: {
          addressLine1: curAddr?.addressLine1 || "",
          addressLine2: curAddr?.addressLine2 || "",
          city: curAddr?.city || "",
          state: curAddr?.state || "",
          country: curAddr?.country || "India",
          postalCode: curAddr?.postalCode || "",
        },
        permanentAddress: {
          addressLine1: permAddr?.addressLine1 || "",
          addressLine2: permAddr?.addressLine2 || "",
          city: permAddr?.city || "",
          state: permAddr?.state || "",
          country: permAddr?.country || "India",
          postalCode: permAddr?.postalCode || "",
        },
        isSameAddress: addrList.length === 1 || (curAddr && permAddr && curAddr.addressLine1 === permAddr.addressLine1 && curAddr.postalCode === permAddr.postalCode),

        bankName: bk?.bankName || "",
        bankAccountNo: bk?.accountNumber || "",
        ifscCode: bk?.ifscCode || "",
        bankBranch: bk?.branchName || "",
        accountType: bk?.accountType || "Savings",
        accountHolderName: bk?.accountHolderName || "",
        upiId: bk?.upiId || "",
        salaryAccount: bk?.salaryAccount ?? true,

        uanNumber: pf?.uanNumber || "",
        esiNumber: esi?.esiNumber || "",
        insuranceProvider: ins?.insuranceProvider || "",
        insuranceType: ins?.insuranceType || "HEALTH",
        policyNumber: ins?.policyNumber || "",
        insuranceExpiryDate: ins?.insuranceExpiryDate ? ins.insuranceExpiryDate.split("T")[0] : "",
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load employee profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && employeeId) {
      loadData();
      setActiveTab("account");
    }
  }, [isOpen, employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const selectedRole = roles.find((r) => String(r.roleId) === String(formData.roleId));
      const isRoleAdmin = selectedRole?.roleName.toLowerCase() === "admin";
      const isRoleEmployee = selectedRole?.roleName.toLowerCase() === "employee" || selectedRole?.roleName.toLowerCase() === "staff";

      const userPayload: any = {
        employeeCode: formData.employeeCode,
        roleIds: formData.roleIds.length > 0 ? formData.roleIds : (formData.roleId ? [Number(formData.roleId)] : []),
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        designationId: formData.designationId ? Number(formData.designationId) : null,
        officialEmail: formData.officialEmail,
        phoneNumber: formData.fatherMobile || null,
        employmentType: formData.employmentType,
        joiningDate: new Date(formData.joiningDate).toISOString(),
        probationEndDate: formData.probationEndDate ? new Date(formData.probationEndDate).toISOString() : null,
        reportingToId: formData.reportingToId ? Number(formData.reportingToId) : null,
        status: formData.status,
        locationId: formData.locationId ? Number(formData.locationId) : null,
      };
      if (formData.password) {
        userPayload.password = formData.password;
      }

      const userRes = await updateUser(employeeId, userPayload);
      if (!userRes.success) throw new Error(userRes.error || "Failed to update corporate user details.");

      // 2. Personal Info (POST if personalInfoId is null, PUT otherwise)
      const personalPayload = {
        userId: employeeId,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        bloodGroup: formData.bloodGroup,
        nationality: formData.nationality,
        personalEmail: formData.personalEmail || null,
        profilePhoto: formData.profilePhoto || null,
        aadhaarNumber: formData.aadhaarNumber || null,
        panNumber: formData.panNumber || null,
        passportNumber: formData.passportNumber || null,
      };

      if (personalInfoId) {
        const piRes = await updatePersonalInfo(personalInfoId, personalPayload);
        if (!piRes.success) throw new Error(piRes.error || "Failed to update personal details.");
      } else {
        const piRes = await createPersonalInfo(personalPayload);
        if (!piRes.success) throw new Error(piRes.error || "Failed to create personal details.");
      }

      // 3. Parents Info (POST if parentInfoExists is false, PUT otherwise)
      const parentPayload = {
        userId: employeeId,
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

      if (parentInfoExists) {
        const prRes = await updateParentInfo(employeeId, parentPayload);
        if (!prRes.success) throw new Error(prRes.error || "Failed to update parent details.");
      } else {
        const prRes = await createParentInfo(parentPayload);
        if (!prRes.success) throw new Error(prRes.error || "Failed to create parent details.");
      }

      // 4. Addresses
      const curAddrPayload = {
        userId: employeeId,
        addressType: "CURRENT",
        addressLine1: formData.currentAddress.addressLine1,
        addressLine2: formData.currentAddress.addressLine2 || null,
        city: formData.currentAddress.city,
        state: formData.currentAddress.state,
        country: formData.currentAddress.country,
        postalCode: formData.currentAddress.postalCode,
      };

      if (currentAddressExists) {
        const caRes = await updateAddressInfo(employeeId, "CURRENT", curAddrPayload);
        if (!caRes.success) throw new Error(caRes.error || "Failed to update current address details.");
      } else {
        const caRes = await createAddressInfo(curAddrPayload);
        if (!caRes.success) throw new Error(caRes.error || "Failed to create current address details.");
      }

      if (!formData.isSameAddress) {
        const permAddrPayload = {
          userId: employeeId,
          addressType: "PERMANENT",
          addressLine1: formData.permanentAddress.addressLine1,
          addressLine2: formData.permanentAddress.addressLine2 || null,
          city: formData.permanentAddress.city,
          state: formData.permanentAddress.state,
          country: formData.permanentAddress.country,
          postalCode: formData.permanentAddress.postalCode,
        };

        if (permanentAddressExists) {
          const paRes = await updateAddressInfo(employeeId, "PERMANENT", permAddrPayload);
          if (!paRes.success) throw new Error(paRes.error || "Failed to update permanent address details.");
        } else {
          const paRes = await createAddressInfo(permAddrPayload);
          if (!paRes.success) throw new Error(paRes.error || "Failed to create permanent address details.");
        }
      }

      // 5. Bank details (POST if bankId is null, PUT otherwise)
      const bankPayload = {
        userId: employeeId,
        accountHolderName: (formData.accountHolderName || employeeName).trim(),
        bankName: formData.bankName,
        branchName: formData.bankBranch,
        accountNumber: formData.bankAccountNo,
        ifscCode: formData.ifscCode,
        accountType: formData.accountType,
        upiId: formData.upiId || null,
        salaryAccount: formData.salaryAccount,
      };

      if (bankId) {
        const bkRes = await updateBankDetails(bankId, bankPayload);
        if (!bkRes.success) throw new Error(bkRes.error || "Failed to update bank details.");
      } else if (formData.bankName) {
        const bkRes = await createBankDetails(bankPayload);
        if (!bkRes.success) throw new Error(bkRes.error || "Failed to save bank details.");
      }

      // 6. PF Details (POST if pfDetailId is null, PUT otherwise)
      if (formData.uanNumber) {
        const pfPayload = {
          userId: employeeId,
          uanNumber: formData.uanNumber,
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

        if (pfDetailId) {
          const pfRes = await updatePFDetail(pfDetailId, pfPayload);
          if (!pfRes.success) throw new Error(pfRes.error || "Failed to update PF details.");
        } else {
          const pfRes = await createPFDetail(pfPayload);
          if (!pfRes.success) throw new Error(pfRes.error || "Failed to create PF details.");
        }
      }

      // 7. ESI Details (POST if esiDetailId is null, PUT otherwise)
      if (formData.esiNumber) {
        const esiPayload = {
          userId: employeeId,
          esiNumber: formData.esiNumber,
          esiJoiningDate: null,
          esiLeavingDate: null,
          reasonForLeaving: null,
        };

        if (esiDetailId) {
          const esiRes = await updateESIDetail(esiDetailId, esiPayload);
          if (!esiRes.success) throw new Error(esiRes.error || "Failed to update ESI details.");
        } else {
          const esiRes = await createESIDetail(esiPayload);
          if (!esiRes.success) throw new Error(esiRes.error || "Failed to create ESI details.");
        }
      }

      // 8. Insurance Details (POST if insuranceId is null, PUT otherwise)
      if (formData.insuranceProvider || formData.policyNumber) {
        const insPayload = {
          userId: employeeId,
          insuranceProvider: formData.insuranceProvider || null,
          insuranceType: (formData.insuranceType || "HEALTH") as any,
          policyNumber: formData.policyNumber || null,
          insuranceExpiryDate: formData.insuranceExpiryDate ? new Date(formData.insuranceExpiryDate).toISOString() : null,
        };

        if (insuranceId) {
          const insRes = await updateInsuranceDetail(insuranceId, insPayload);
          if (!insRes.success) throw new Error(insRes.error || "Failed to update insurance details.");
        } else {
          const insRes = await createInsuranceDetail(insPayload);
          if (!insRes.success) throw new Error(insRes.error || "Failed to create insurance details.");
        }
      }

      setSuccessMsg("Employee updated successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during save.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-[850px] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200 max-h-[90vh] force-light">
        <style>{`
          .force-light input,
          .force-light select,
          .force-light textarea {
            background-color: #ffffff !important;
            color: #0f172a !important;
            border-color: #cbd5e1 !important;
          }
          .force-light button.border-slate-300 {
            color: #334155 !important;
            background-color: #ffffff !important;
            border-color: #cbd5e1 !important;
          }
          .force-light button.border-slate-300:hover {
            background-color: #f8fafc !important;
            border-color: #94a3b8 !important;
          }
        `}</style>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Edit Employee Profile
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Modify onboarding credentials, addresses, bank accounts, or statutory details.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-6 gap-2 bg-slate-50/50">
          {[
            { id: "account", label: "Account Profile" },
            { id: "personal", label: "Personal & Family" },
            { id: "address", label: "Addresses & Bank" },
            { id: "statutory", label: "Statutory" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[350px]">
          {isLoading ? (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="text-slate-500 text-xs font-semibold">Loading profile information...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TAB 1: ACCOUNT PROFILE */}
              {activeTab === "account" && (
                <div className="space-y-4">
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
                    <Input
                      label="Change Password (leave blank to keep current)"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                    />

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
                        <p className="text-[10px] text-slate-400 font-semibold">Select at least one role for this employee.</p>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                      label="Joining Date *"
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => handleChange("joiningDate", e.target.value)}
                      required
                    />

                    <Input
                      label="Probation End"
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
                </div>
              )}

              {/* TAB 2: PERSONAL & FAMILY */}
              {activeTab === "personal" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Personal Profile</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Date of Birth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                      />

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Gender</label>
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        label="Nationality"
                        value={formData.nationality}
                        onChange={(e) => handleChange("nationality", e.target.value)}
                      />

                      <Input
                        label="Personal Email"
                        type="email"
                        placeholder="name@email.com"
                        value={formData.personalEmail}
                        onChange={(e) => handleChange("personalEmail", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Parents Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Father Name"
                        value={formData.fatherName}
                        onChange={(e) => handleChange("fatherName", e.target.value)}
                      />
                      <Input
                        label="Father Mobile"
                        value={formData.fatherMobile}
                        onChange={(e) => handleChange("fatherMobile", e.target.value)}
                      />
                      <Input
                        label="Father Occupation"
                        value={formData.fatherOccupation}
                        onChange={(e) => handleChange("fatherOccupation", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Mother Name"
                        value={formData.motherName}
                        onChange={(e) => handleChange("motherName", e.target.value)}
                      />
                      <Input
                        label="Mother Mobile"
                        value={formData.motherMobile}
                        onChange={(e) => handleChange("motherMobile", e.target.value)}
                      />
                      <Input
                        label="Mother Occupation"
                        value={formData.motherOccupation}
                        onChange={(e) => handleChange("motherOccupation", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Guardian Name"
                        value={formData.guardianName}
                        onChange={(e) => handleChange("guardianName", e.target.value)}
                      />
                      <Input
                        label="Guardian Mobile"
                        value={formData.guardianMobile}
                        onChange={(e) => handleChange("guardianMobile", e.target.value)}
                      />
                      <Input
                        label="Guardian Relationship"
                        value={formData.guardianRelationship}
                        onChange={(e) => handleChange("guardianRelationship", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ADDRESSES & BANK */}
              {activeTab === "address" && (
                <div className="space-y-6">
                  {/* Current Address */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Current Address</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Input
                          label="Address Line 1 *"
                          value={formData.currentAddress.addressLine1}
                          onChange={(e) => handleAddressChange("current", "addressLine1", e.target.value)}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          label="Address Line 2"
                          value={formData.currentAddress.addressLine2}
                          onChange={(e) => handleAddressChange("current", "addressLine2", e.target.value)}
                        />
                      </div>
                      <Input
                        label="City *"
                        value={formData.currentAddress.city}
                        onChange={(e) => handleAddressChange("current", "city", e.target.value)}
                        required
                      />
                      <Input
                        label="State *"
                        value={formData.currentAddress.state}
                        onChange={(e) => handleAddressChange("current", "state", e.target.value)}
                        required
                      />
                      <Input
                        label="Pincode *"
                        value={formData.currentAddress.postalCode}
                        onChange={(e) => handleAddressChange("current", "postalCode", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-2 border-t border-slate-100">
                    <input
                      type="checkbox"
                      id="editIsSameAddress"
                      checked={formData.isSameAddress}
                      onChange={(e) => handleSameAddressToggle(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="editIsSameAddress" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                      Permanent Address is same as Current Address
                    </label>
                  </div>

                  {/* Permanent Address */}
                  {!formData.isSameAddress && (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Permanent Address</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Input
                            label="Address Line 1 *"
                            value={formData.permanentAddress.addressLine1}
                            onChange={(e) => handleAddressChange("permanent", "addressLine1", e.target.value)}
                            required
                          />
                        </div>
                        <Input
                          label="City *"
                          value={formData.permanentAddress.city}
                          onChange={(e) => handleAddressChange("permanent", "city", e.target.value)}
                          required
                        />
                        <Input
                          label="State *"
                          value={formData.permanentAddress.state}
                          onChange={(e) => handleAddressChange("permanent", "state", e.target.value)}
                          required
                        />
                        <Input
                          label="Pincode *"
                          value={formData.permanentAddress.postalCode}
                          onChange={(e) => handleAddressChange("permanent", "postalCode", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Bank Details */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Bank details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Bank Name"
                        value={formData.bankName}
                        onChange={(e) => handleChange("bankName", e.target.value)}
                      />
                      <Input
                        label="Account Number"
                        value={formData.bankAccountNo}
                        onChange={(e) => handleChange("bankAccountNo", e.target.value)}
                      />
                      <Input
                        label="IFSC Code"
                        value={formData.ifscCode}
                        onChange={(e) => handleChange("ifscCode", e.target.value.toUpperCase())}
                      />
                      <Input
                        label="Branch"
                        value={formData.bankBranch}
                        onChange={(e) => handleChange("bankBranch", e.target.value)}
                      />
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-semibold">Account Type</label>
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
                        value={formData.accountHolderName}
                        onChange={(e) => handleChange("accountHolderName", e.target.value)}
                      />
                      <Input
                        label="UPI ID"
                        value={formData.upiId}
                        onChange={(e) => handleChange("upiId", e.target.value)}
                      />
                      <div className="flex items-center gap-2 py-2 sm:col-span-2">
                        <input
                          type="checkbox"
                          id="editSalaryAccount"
                          checked={formData.salaryAccount}
                          onChange={(e) => handleChange("salaryAccount", e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <label htmlFor="editSalaryAccount" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                          Is this a Salary Account?
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: STATUTORY */}
              {activeTab === "statutory" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Statutory IDs</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Aadhaar No"
                        value={formData.aadhaarNumber}
                        onChange={(e) => handleChange("aadhaarNumber", e.target.value)}
                      />
                      <Input
                        label="PAN No"
                        value={formData.panNumber}
                        onChange={(e) => handleChange("panNumber", e.target.value.toUpperCase())}
                      />
                      <Input
                        label="Passport Number"
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                    {/* PF */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">PF details</h5>
                      <Input
                        label="UAN Number"
                        value={formData.uanNumber}
                        onChange={(e) => handleChange("uanNumber", e.target.value)}
                      />
                    </div>

                    {/* ESI */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">ESI details</h5>
                      <Input
                        label="ESI Account Number"
                        value={formData.esiNumber}
                        onChange={(e) => handleChange("esiNumber", e.target.value)}
                      />
                    </div>

                    {/* Insurance */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Insurance details</h5>
                      <Input
                        label="Insurance Provider"
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

              {/* Form Controls */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting} className="cursor-pointer">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isSubmitting} className="px-6 cursor-pointer">
                  Save Changes
                </Button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
