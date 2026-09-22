"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Loader2,
  Download,
  Trash2,
  UploadCloud,
  ShieldAlert,
  Users,
  MapPin,
  Briefcase,
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Calendar,
  Lock,
  ClipboardList,
  Search,
} from "lucide-react";
import { snackbar as toast } from "@/components/ui/snackbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getUserById,
  getPersonalInfoByUserId,
  getParentInfoByUserId,
  getAddressInfoByUserId,
  getBankDetailsByUserId,
  getPFDetailsByUserId,
  getESIDetailsByUserId,
  getInsuranceDetailsByUserId,
  getEmployeeDocumentsByUserId,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  downloadEmployeeDocument,
  getDesignations,
  deleteUser,
} from "../api/employees.api";

interface EmployeeProfileProps {
  employeeId: number; // This is the userId
  onEditClick: () => void;
}

function getUserRoleCookie(): string {
  if (typeof document === "undefined") return "employee";
  const match = document.cookie.match(/(?:^|; )user_role=([^;]*)/);
  return match ? match[1] : "employee";
}

type TabType = "profile" | "address" | "family" | "statutory" | "others" | "documents";

export const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employeeId, onEditClick }) => {
  const router = useRouter();
  const role = getUserRoleCookie();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // States for fetched details
  const [userProfile, setUserProfile] = useState<any>(null);
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [parentInfo, setParentInfo] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [pfDetail, setPfDetail] = useState<any>(null);
  const [esiDetail, setEsiDetail] = useState<any>(null);
  const [insuranceDetail, setInsuranceDetail] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [docToDelete, setDocToDelete] = useState<{ id: number; type: string } | null>(null);
  const [isDeleteDocConfirmOpen, setIsDeleteDocConfirmOpen] = useState(false);
  const [isDeleteEmployeeOpen, setIsDeleteEmployeeOpen] = useState(false);
  const [isDeletingEmployee, setIsDeletingEmployee] = useState(false);

  const handleConfirmDeleteEmployee = async () => {
    setIsDeletingEmployee(true);
    try {
      const res = await deleteUser(Number(employeeId));
      if (res.success) {
        toast.success("Employee deleted successfully.");
        setIsDeleteEmployeeOpen(false);
        router.push(`/${role === "superadmin" ? "superadmin" : "admin"}/dashboard?tab=employees`);
      } else {
        toast.error(res.error || "Failed to delete employee profile.");
        setIsDeletingEmployee(false);
      }
    } catch (err) {
      toast.error("Failed to delete employee profile.");
      setIsDeletingEmployee(false);
    }
  };

  // Document Upload Form State
  const [uploadDocType, setUploadDocType] = useState("AADHAAR");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Fetch all data
  const loadAllData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [
        userRes,
        personalRes,
        parentRes,
        addressRes,
        bankRes,
        pfRes,
        esiRes,
        insRes,
        docRes,
        desData,
      ] = await Promise.all([
        getUserById(employeeId),
        getPersonalInfoByUserId(employeeId),
        getParentInfoByUserId(employeeId),
        getAddressInfoByUserId(employeeId),
        getBankDetailsByUserId(employeeId),
        getPFDetailsByUserId(employeeId),
        getESIDetailsByUserId(employeeId),
        getInsuranceDetailsByUserId(employeeId),
        getEmployeeDocumentsByUserId(employeeId),
        getDesignations(),
      ]);

      if (userRes.success) setUserProfile(userRes.data);
      setDesignations(desData || []);
      if (personalRes.success && personalRes.data && personalRes.data.length > 0) {
        setPersonalInfo(personalRes.data[0]);
      } else {
        setPersonalInfo(null);
      }
      if (parentRes.success) setParentInfo(parentRes.data);
      if (addressRes.success) setAddresses(addressRes.data || []);
      if (bankRes.success && bankRes.data && bankRes.data.length > 0) {
        setBankDetails(bankRes.data[0]);
      } else {
        setBankDetails(null);
      }
      if (pfRes.success && pfRes.data && pfRes.data.length > 0) {
        setPfDetail(pfRes.data[0]);
      } else {
        setPfDetail(null);
      }
      if (esiRes.success && esiRes.data && esiRes.data.length > 0) {
        setEsiDetail(esiRes.data[0]);
      } else {
        setEsiDetail(null);
      }
      if (insRes.success && insRes.data && insRes.data.length > 0) {
        setInsuranceDetail(insRes.data[0]);
      } else {
        setInsuranceDetail(null);
      }
      if (docRes.success) setDocuments(docRes.data || []);
    } catch (err: any) {
      setErrorMsg("Failed to retrieve employee profile data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      loadAllData();
      setActiveTab("profile");
    }
  }, [employeeId]);

  // Document actions
  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please choose a file to upload.");
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await uploadEmployeeDocument(employeeId, uploadDocType, uploadFile);
      if (res.success) {
        setUploadSuccess("Document uploaded successfully!");
        setUploadFile(null);
        setUploadFileName("");
        const docRes = await getEmployeeDocumentsByUserId(employeeId);
        if (docRes.success) setDocuments(docRes.data || []);
      } else {
        setUploadError(res.error || "Failed to upload document.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = (docId: number, typeName: string) => {
    setDocToDelete({ id: docId, type: typeName });
    setIsDeleteDocConfirmOpen(true);
  };

  const confirmDeleteDoc = async () => {
    if (!docToDelete) return;
    const { id, type } = docToDelete;
    setIsDeleteDocConfirmOpen(false);
    setDocToDelete(null);

    try {
      const res = await deleteEmployeeDocument(id);
      if (res.success) {
        toast.success("Document deleted successfully.");
        const docRes = await getEmployeeDocumentsByUserId(employeeId);
        if (docRes.success) setDocuments(docRes.data || []);
      } else {
        toast.error(res.error || "Failed to delete document.");
      }
    } catch (err) {
      toast.error("Failed to delete document.");
    }
  };

  const handleDownloadDoc = async (docId: number) => {
    await downloadEmployeeDocument(docId);
  };

  const formatDateDMY = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "-";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return "-";
    }
  };

  const formatModifiedDate = (dateStr?: string | null) => {
    if (!dateStr) return "20-Apr-2026";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "20-Apr-2026";
      const day = String(d.getDate()).padStart(2, "0");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return "20-Apr-2026";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4 animate-fade-in">
        {/* Top Tab Bar Skeleton */}
        <div className="bg-white border border-slate-200 rounded-sm p-3 flex items-center justify-between">
          <div className="flex gap-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-7 w-48" />
        </div>

        {/* Two Column Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-sm p-6 space-y-4">
            <Skeleton className="w-20 h-20 rounded-full mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-20 mx-auto" />
            <div className="space-y-3 pt-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-9 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-7 w-24" />
            </div>
            <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4">
              <Skeleton className="h-4 w-28" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg || !userProfile) {
    return (
      <div className="p-6 rounded-md bg-rose-50 border border-rose-100 text-rose-700 text-sm flex items-center gap-2 max-w-2xl mx-auto my-8">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <span>{errorMsg || "Employee profile not found."}</span>
      </div>
    );
  }

  const roleName = userProfile.roles?.[0]?.roleName || userProfile.userRoles?.[0]?.role?.roleName || userProfile.role?.roleName || "Staff";
  const designationName = designations.find((d) => d.designationId === userProfile.designationId)?.designationName || roleName;
  const fullName = `${userProfile.firstName} ${userProfile.lastName || ""}`.trim();
  const titlePrefix = personalInfo?.title || (userProfile.gender === "FEMALE" ? "Ms." : "Mr.");

  const primaryAddress = addresses.find((a) => a.addressType === "CURRENT") || addresses[0];
  const permanentAddress = addresses.find((a) => a.addressType === "PERMANENT");
  const employeeLocation = primaryAddress?.city || userProfile?.location || "Saligrama";
  const modifiedByText = userProfile.updatedBy || userProfile.createdByUser?.firstName || "Varsha";
  const modifiedDateText = formatModifiedDate(userProfile.updatedAt);

  // Top Tabs according to HRM reference image
  const tabs: { id: TabType; label: string }[] = [
    { id: "profile", label: "My Profile" },
    { id: "address", label: "Address" },
    { id: "family", label: "Family Info" },
    { id: "statutory", label: "Statutory Details" },
    { id: "others", label: "Others" },
    { id: "documents", label: "Documents" },
  ];

  return (
    <div className="w-full space-y-4 text-slate-800 text-sm animate-fade-in force-light">
      <style jsx global>{`
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

      {/* Top Tab Navigation Bar matching HRM reference */}
      <div className="w-full bg-white border border-slate-200 rounded-sm px-4 sm:px-6 pt-3 pb-0 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Tab list with dividers */}
        <div className="flex items-center flex-wrap gap-1 sm:gap-2">
          {tabs.map((tab, idx) => {
            const isSelected = activeTab === tab.id;
            return (
              <React.Fragment key={tab.id}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs pb-3 transition-colors cursor-pointer px-2 ${
                    isSelected
                      ? "text-sky-600 border-b-2 border-sky-500 font-semibold -mb-[1px]"
                      : "text-slate-600 hover:text-slate-900 font-normal"
                  }`}
                >
                  {tab.label}
                </button>
                {idx < tabs.length - 1 && (
                  <span className="text-slate-300 text-xs select-none -mt-3">|</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Search box on right */}
        <div className="pb-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-2 border border-slate-200 rounded px-2.5 py-1 bg-white focus-within:border-sky-500 transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by name or #code"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent w-full sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout below Tab Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Employee Profile Summary Card */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-sm p-6 shadow-2xs">
          {/* Centered Circular Avatar */}
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-slate-200 text-slate-400 overflow-hidden mb-3">
            {userProfile.profilePic || personalInfo?.profilePhoto ? (
              <img
                src={userProfile.profilePic || personalInfo?.profilePhoto}
                alt={fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <UserIcon className="w-10 h-10 text-slate-500" />
            )}
          </div>

          {/* Centered Name & Designation */}
          <div className="text-center mb-6">
            <div className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              {titlePrefix} {fullName}
            </div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mt-0.5">
              {designationName || "Employee"}
            </div>
          </div>

          {/* Left-Aligned Stacked Metadata */}
          <div className="space-y-3.5 text-left">
            <div>
              <div className="text-[11px] text-slate-500 font-normal">Code</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 select-all">{userProfile.employeeCode || "-"}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 font-normal">Title</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">{titlePrefix}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 font-normal">Name</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 select-all">{fullName.toUpperCase()}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 font-normal">Designation</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">{designationName || "-"}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 font-normal">Department</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">{userProfile.department?.departmentName || "Management"}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 font-normal">Joining Date</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">{formatDateDMY(userProfile.joiningDate)}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 font-normal">Status</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                {userProfile.status ? (userProfile.status.charAt(0).toUpperCase() + userProfile.status.slice(1).toLowerCase()) : "Active"}
              </div>
            </div>

            {userProfile.manager && (
              <div>
                <div className="text-[11px] text-slate-500 font-normal">Reporting Manager</div>
                <div className="text-xs font-bold text-sky-600 mt-0.5 select-all">
                  {`${userProfile.manager.firstName} ${userProfile.manager.lastName || ""}`.trim()}
                </div>
              </div>
            )}
          </div>

          {/* Delete Employee Action for Admin / Superadmin */}
          {role !== "employee" && (
            <div className="pt-5 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteEmployeeOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-rose-600 hover:text-white border border-rose-200 hover:bg-rose-600 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Employee</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Tab Content Container */}
        <div className="lg:col-span-9 space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-4">
              <h3 className="text-sm font-bold text-slate-800">
                {activeTab === "profile" && "Profile Details"}
                {activeTab === "address" && "Address Details"}
                {activeTab === "family" && "Family Details"}
                {activeTab === "statutory" && "Statutory Details"}
                {activeTab === "others" && "Bank & Financial Details"}
                {activeTab === "documents" && "Documents & KYC Vault"}
              </h3>
              <span className="text-[11px] text-slate-400 font-normal">
                Modified by {modifiedByText} on {modifiedDateText}
              </span>
            </div>

            {role !== "employee" && activeTab !== "documents" && (
              <button
                type="button"
                onClick={onEditClick}
                className="border border-sky-500 text-sky-600 hover:bg-sky-50 rounded px-3.5 py-1 text-xs font-medium cursor-pointer transition-colors"
              >
                Edit Details
              </button>
            )}
          </div>

          {/* TAB 1: MY PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              {/* Profile Overview Card */}
              <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-1">Profile Overview</h4>
                <div className="space-y-4">
                  {/* Personal Details Box */}
                  <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                    <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Personal Details
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Date of Birth:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{formatDateDMY(personalInfo?.dateOfBirth)}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Gender:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{personalInfo?.gender || "Male"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Marital Status:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{personalInfo?.maritalStatus || "Married"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Blood Group:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{personalInfo?.bloodGroup || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Nationality:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{personalInfo?.nationality || "Indian"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Location & Identity Box */}
                  <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                    <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Location & Identity
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Father/Spouse Name:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{parentInfo?.fatherName || personalInfo?.spouseName || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Location:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{employeeLocation}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Calendar:</span>
                        <div className="font-bold text-slate-900 mt-0.5">India</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Badge Id:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{userProfile.badgeId || userProfile.employeeCode || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Grade:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{userProfile.grade || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Seat:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{userProfile.seat || "-"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-1">Contact Info</h4>
                <div className="space-y-4">
                  {/* Official Contact Box */}
                  <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                    <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Official Contact
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Official Email:</span>
                        <div className="font-bold text-slate-900 mt-0.5 select-all">{userProfile.officialEmail || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Official Phone:</span>
                        <div className="font-bold text-slate-900 mt-0.5 select-all">{userProfile.officialPhone || userProfile.phoneNumber || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Extension No:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{userProfile.extensionNo || "-"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Contact Box */}
                  <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                    <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Personal Contact
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Personal Email:</span>
                        <div className="font-bold text-slate-900 mt-0.5 select-all">{personalInfo?.personalEmail || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Personal Phone:</span>
                        <div className="font-bold text-slate-900 mt-0.5 select-all">{personalInfo?.personalPhone || userProfile.phoneNumber || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Mobile Phone:</span>
                        <div className="font-bold text-slate-900 mt-0.5 select-all">{userProfile.phoneNumber || "-"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Info Card */}
              <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-1">Employment Info</h4>
                <div className="space-y-4">
                  {/* Organization & Role Box */}
                  <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                    <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Organization & Role
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Organization:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{userProfile.company?.companyName || userProfile.companyName || "Saanvi Technologies"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Department:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{userProfile.department?.departmentName || "General"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Designation:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{designationName || "-"}</div>
                      </div>
                      {userProfile.manager && (
                        <div>
                          <span className="text-[11px] text-slate-500 font-normal">Reporting Manager:</span>
                          <div className="font-bold text-sky-600 mt-0.5 select-all">{`${userProfile.manager.firstName} ${userProfile.manager.lastName || ""}`.trim()}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Classification Box */}
                  <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                    <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Classification
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Category:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{userProfile.category || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Group:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{userProfile.employeeGroup || (userProfile.employmentType ? userProfile.employmentType.replace("_", " ") : "Permanent")}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Sub Group:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{userProfile.subGroup || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Status:</span>
                        <div className="font-bold text-emerald-600 mt-0.5">{userProfile.status || "Active"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADDRESS */}
          {activeTab === "address" && (
            <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4">
              <h4 className="text-xs font-semibold text-slate-700 mb-1">Address Information</h4>

              <div className="space-y-4">
                {/* Current Address Card with Background */}
                <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                  <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Current Address
                  </span>
                  {primaryAddress ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Address Line 1:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{primaryAddress.addressLine1 || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Address Line 2:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{primaryAddress.addressLine2 || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">City:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{primaryAddress.city || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">State:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{primaryAddress.state || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Postal Code:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{primaryAddress.postalCode || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Country:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{primaryAddress.country || "-"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No current address recorded</div>
                  )}
                </div>

                {/* Permanent Address Card with Background (Displayed Below Current Address) */}
                <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                  <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Permanent Address
                  </span>
                  {permanentAddress ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Address Line 1:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{permanentAddress.addressLine1 || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Address Line 2:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{permanentAddress.addressLine2 || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">City:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{permanentAddress.city || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">State:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{permanentAddress.state || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Postal Code:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{permanentAddress.postalCode || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Country:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{permanentAddress.country || "-"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No permanent address recorded</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAMILY INFO */}
          {activeTab === "family" && (
            <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4">
              <h4 className="text-xs font-semibold text-slate-700 mb-1">Parent / Family Info</h4>
              <div className="space-y-4">
                {/* Father's Details Box */}
                <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                  <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Father's Details
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">Name:</span>
                      <div className="font-bold text-slate-900 mt-0.5">{parentInfo?.fatherName || "-"}</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">Phone:</span>
                      <div className="font-bold text-slate-900 mt-0.5 select-all">{parentInfo?.fatherMobile || "-"}</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">Occupation:</span>
                      <div className="font-bold text-slate-900 mt-0.5">{parentInfo?.fatherOccupation || "-"}</div>
                    </div>
                  </div>
                </div>

                {/* Mother's Details Box */}
                <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                  <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Mother's Details
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">Name:</span>
                      <div className="font-bold text-slate-900 mt-0.5">{parentInfo?.motherName || "-"}</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">Phone:</span>
                      <div className="font-bold text-slate-900 mt-0.5 select-all">{parentInfo?.motherMobile || "-"}</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">Occupation:</span>
                      <div className="font-bold text-slate-900 mt-0.5">{parentInfo?.motherOccupation || "-"}</div>
                    </div>
                  </div>
                </div>

                {/* Guardian / Spouse Box */}
                <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                  <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Guardian / Spouse
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">Name:</span>
                      <div className="font-bold text-slate-900 mt-0.5">{parentInfo?.guardianName || personalInfo?.spouseName || "-"}</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">Phone:</span>
                      <div className="font-bold text-slate-900 mt-0.5 select-all">{parentInfo?.guardianMobile || "-"}</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">Relationship:</span>
                      <div className="font-bold text-slate-900 mt-0.5">{parentInfo?.relationship || (personalInfo?.spouseName ? "Spouse" : "-")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STATUTORY DETAILS */}
          {activeTab === "statutory" && (
            <div className="space-y-4">
              {/* Identity Numbers */}
              <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-1">Identity Numbers</h4>
                <div className="space-y-4">
                  {/* Aadhaar Box */}
                  <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                    <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Aadhaar Card
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Aadhaar Card No:</span>
                        <div className="font-mono font-bold text-slate-900 mt-0.5 select-all">{personalInfo?.aadhaarNumber || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Status:</span>
                        <div className="font-bold text-emerald-600 mt-0.5">{personalInfo?.aadhaarNumber ? "Verified" : "Not Provided"}</div>
                      </div>
                    </div>
                  </div>

                  {/* PAN Card Box */}
                  <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                    <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                      PAN Card
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">PAN Number:</span>
                        <div className="font-mono font-bold text-slate-900 mt-0.5 select-all">{personalInfo?.panNumber || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Status:</span>
                        <div className="font-bold text-emerald-600 mt-0.5">{personalInfo?.panNumber ? "Verified" : "Not Provided"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Passport Box */}
                  <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                    <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Passport
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Passport Number:</span>
                        <div className="font-mono font-bold text-slate-900 mt-0.5 select-all">{personalInfo?.passportNumber || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Status:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{personalInfo?.passportNumber ? "Active" : "Not Provided"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statutory Benefits & Insurance */}
              <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-1">Statutory Benefits & Insurance</h4>
                <div className="space-y-4">
                  {/* PF Details Box */}
                  <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                    <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                      PF Details
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">UAN Number:</span>
                        <div className="font-mono font-bold text-slate-900 mt-0.5 select-all">{pfDetail?.uanNumber || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">PF Number:</span>
                        <div className="font-mono font-bold text-slate-900 mt-0.5 select-all">{pfDetail?.pfNumber || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">PF Joining Date:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{formatDateDMY(pfDetail?.pfJoiningDate)}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">PF Leaving Date:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{formatDateDMY(pfDetail?.pfLeavingDate)}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">International Worker:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{pfDetail?.isInternationalWorker ? "Yes" : "No"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Education Level:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{pfDetail?.educationLevel || "-"}</div>
                      </div>
                    </div>
                  </div>

                  {/* ESI Details Box */}
                  <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                    <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                      ESI Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">ESI Account No:</span>
                        <div className="font-mono font-bold text-slate-900 mt-0.5 select-all">{esiDetail?.esiNumber || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">ESI Joining Date:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{formatDateDMY(esiDetail?.esiJoiningDate)}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">ESI Leaving Date:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{formatDateDMY(esiDetail?.esiLeavingDate)}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Reason For Leaving:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{esiDetail?.reasonForLeaving || "-"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Insurance Details Box */}
                  <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                    <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Insurance Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Insurance Provider:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{insuranceDetail?.insuranceProvider || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Policy Number:</span>
                        <div className="font-mono font-bold text-slate-900 mt-0.5 select-all">{insuranceDetail?.policyNumber || "-"}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-normal">Expiry Date:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{formatDateDMY(insuranceDetail?.insuranceExpiryDate)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* TAB 6: OTHERS (BANK DETAILS) */}
          {activeTab === "others" && (
            <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4">
              <h4 className="text-xs font-semibold text-slate-700 mb-1">Bank & Financial Details</h4>
              <div className="space-y-4">
                {/* Primary Bank Account Box */}
                <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                  <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Primary Bank Account
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">Bank Name:</span>
                      <div className="font-bold text-slate-900 mt-0.5">{bankDetails?.bankName || "-"}</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">Account Number:</span>
                      <div className="font-mono font-bold text-slate-900 mt-0.5 select-all">{bankDetails?.accountNumber || "-"}</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">Account Type:</span>
                      <div className="font-bold text-slate-900 mt-0.5">{bankDetails?.accountType || "Savings"}</div>
                    </div>
                  </div>
                </div>

                {/* Branch & Transfer Details Box */}
                <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                  <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Branch & Transfer Details
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">Branch Name:</span>
                      <div className="font-bold text-slate-900 mt-0.5">{bankDetails?.branchName || "-"}</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">IFSC Code:</span>
                      <div className="font-mono font-bold text-slate-900 mt-0.5 select-all">{bankDetails?.ifscCode || "-"}</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-normal">UPI ID:</span>
                      <div className="font-mono font-bold text-slate-900 mt-0.5 select-all">{bankDetails?.upiId || "-"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              {/* Upload Document Form */}
              <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-1">Upload New KYC Document</h4>
                <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                  <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Document Attachment
                  </span>

                  <form onSubmit={handleUploadDoc} className="space-y-4">
                    {uploadError && (
                      <div className="p-3 text-xs bg-rose-50 border border-rose-100 text-rose-600 rounded font-semibold">
                        {uploadError}
                      </div>
                    )}
                    {uploadSuccess && (
                      <div className="p-3 text-xs bg-emerald-50 border border-emerald-100 text-emerald-600 rounded font-semibold">
                        {uploadSuccess}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-slate-600">Doc Type:</label>
                        <select
                          className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-bold"
                          value={uploadDocType}
                          onChange={(e) => setUploadDocType(e.target.value)}
                        >
                          <option value="AADHAAR">Aadhaar Card</option>
                          <option value="PAN">PAN Card</option>
                          <option value="PASSPORT">Passport</option>
                          <option value="DRIVING_LICENSE">Driving License</option>
                          <option value="DEGREE_CERTIFICATE">Graduation Degree</option>
                          <option value="RELIEVING_LETTER">Relieving Letter</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-slate-600">Choose File:</label>
                        <div className="relative flex items-center justify-between border border-slate-300 bg-white rounded px-2.5 h-[34px] hover:border-slate-400 transition-colors">
                          <span className="text-xs text-slate-500 truncate max-w-[140px] font-medium">
                            {uploadFileName || "No file chosen"}
                          </span>
                          <input
                            type="file"
                            id="profileDocFile"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setUploadFile(file);
                              setUploadFileName(file ? file.name : "");
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="profileDocFile"
                            className="text-[10px] font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded px-2 py-1 cursor-pointer select-none"
                          >
                            Browse
                          </label>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        isLoading={isUploading}
                        variant="primary"
                        className="h-[34px] cursor-pointer text-xs font-semibold rounded bg-sky-600 hover:bg-sky-700 text-white"
                      >
                        <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                        <span>Upload</span>
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-2xs space-y-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-1">Uploaded KYC Vault</h4>
                <div className="border border-slate-200 rounded p-4 bg-slate-50/40">
                  <span className="text-[11px] font-bold text-slate-700 block mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Verified KYC Records
                  </span>

                  {documents.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-slate-200 rounded text-slate-400 text-xs font-normal">
                      No KYC documents uploaded for this employee.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded overflow-hidden bg-white">
                      <table className="w-full text-left text-xs text-slate-700 border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                            <th className="py-2.5 px-4 font-semibold">Doc Type</th>
                            <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {documents.map((doc) => (
                            <tr key={doc.documentId} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-4 font-bold text-slate-900">{doc.documentType}</td>
                              <td className="py-2.5 px-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadDoc(doc.documentId)}
                                    className="p-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                                    title="Download File"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDoc(doc.documentId, doc.documentType)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                    title="Delete Document"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Document Confirmation Modal */}
      {isDeleteDocConfirmOpen && docToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded border border-slate-200 p-6 shadow-xl space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">Delete Document</h3>
              <p className="text-xs text-slate-600 font-normal">
                Are you sure you want to delete the <span className="font-semibold text-slate-800">{docToDelete.type}</span> document? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteDocConfirmOpen(false);
                  setDocToDelete(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteDoc}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-xs transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Employee Confirmation Modal */}
      {isDeleteEmployeeOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-md border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">Delete Employee</h3>
              <p className="text-xs text-slate-600 font-normal">
                Are you sure you want to delete employee <span className="font-semibold text-slate-800">{userProfile?.firstName} {userProfile?.lastName || ""} {userProfile?.employeeCode ? `(${userProfile.employeeCode})` : ""}</span>? This will permanently erase their credentials, documents, and company records.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingEmployee}
                onClick={() => setIsDeleteEmployeeOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingEmployee}
                onClick={handleConfirmDeleteEmployee}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingEmployee ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
