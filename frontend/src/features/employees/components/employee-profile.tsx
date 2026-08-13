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
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { toast } from "sonner";
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
  getEmployeeDocumentsByUserId,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  downloadEmployeeDocument,
  getDesignations,
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
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        // Reload documents list
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
        // Reload documents list
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

  const handleBack = () => {
    const role = getUserRoleCookie();
    router.push(`/${role}/dashboard?tab=employees`);
  };

  const handleEditSuccess = async () => {
    await loadAllData();
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#013e37] animate-spin" />
        <span className="text-slate-500 text-xs font-semibold">Loading profile details...</span>
      </div>
    );
  }

  if (errorMsg || !userProfile) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm flex items-center gap-2 max-w-2xl mx-auto my-8">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <span>{errorMsg || "Employee profile not found."}</span>
      </div>
    );
  }

  const roleName = userProfile.userRoles?.[0]?.role?.roleName || userProfile.role?.roleName || "Staff";
  const designationName = designations.find((d) => d.designationId === userProfile.designationId)?.designationName || roleName;
  const fullName = `${userProfile.firstName} ${userProfile.lastName || ""}`.trim();

  // Tab configurations
  const tabs = [
    { id: "profile", label: "My Profile", icon: UserIcon },
    { id: "address", label: "Address", icon: MapPin },
    { id: "family", label: "Family Info", icon: Users },
    { id: "statutory", label: "Statutory Details", icon: ShieldAlert },
    { id: "others", label: "Others", icon: ClipboardList },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <div className="w-full space-y-6 text-slate-800 text-sm animate-fade-in force-light">
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

      {/* Header Path Info */}
      <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold pb-2">
        <button
          onClick={handleBack}
          className="hover:text-[#013e37] cursor-pointer transition-colors"
        >
          Employee List
        </button>
        <ChevronRight className="w-3.5 h-3.5 select-none" />
        <span className="text-[#013e37] select-none">{fullName}</span>
      </div>

      {/* Two Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Employee summary card */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center space-y-5">
          <div className="w-24 h-24 rounded-full bg-[#013e37]/5 border border-[#013e37]/10 flex items-center justify-center shadow-inner relative group select-none">
            <span className="text-[#013e37] text-3xl font-extrabold tracking-tight">
              {userProfile.firstName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{fullName}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{designationName}</p>
          </div>

          <div className="w-full h-px bg-slate-100" />

          {/* Core Corporate Details Summary list */}
          <div className="w-full space-y-3.5 text-left text-xs font-medium">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Employee Code</span>
              <span className="font-mono text-slate-950 font-bold select-all">{userProfile.employeeCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Official Email</span>
              <span className="text-slate-950 font-semibold truncate max-w-[180px] select-all" title={userProfile.officialEmail}>
                {userProfile.officialEmail}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Phone Number</span>
              <span className="text-slate-950 font-semibold select-all">{userProfile.phoneNumber || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Department</span>
              <span className="text-slate-950 font-semibold">{userProfile.department?.departmentName || "General"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Joining Date</span>
              <span className="text-slate-950 font-semibold">
                {userProfile.joiningDate ? new Date(userProfile.joiningDate).toLocaleDateString("en-IN") : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Employment Type</span>
              <span className="text-slate-950 font-semibold uppercase">
                {(userProfile.employmentType || "FULL_TIME").replace("_", "-")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                <span className="w-1.2 h-1.2 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                {userProfile.status || "ACTIVE"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Content Container */}
        <div className="lg:col-span-8 flex flex-col space-y-5">
          
          {/* Tab Navigation header */}
          <div className="flex flex-wrap border-b border-slate-200 gap-1 bg-white border border-slate-200/80 rounded-2xl p-1 shadow-2xs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#013e37] text-[#ffefb3] shadow-2xs border border-[#013e37]"
                      : "text-slate-500 hover:text-[#013e37] hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Tab Body Panel */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs min-h-[420px] flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Profile Details header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#013e37] tracking-tight">Profile Details</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Corporate HR & Statutory Records</p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEditClick}
                  className="px-5 border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer font-bold rounded-xl shadow-2xs h-9 text-xs"
                >
                  Edit Details
                </Button>
              </div>

              {/* TAB 1: MY PROFILE */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Profile Overview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3.5 gap-x-6 border border-slate-100 bg-slate-50/50 p-4.5 rounded-2xl">
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-xs font-bold text-slate-400">Date of Birth</span>
                        <span className="font-semibold text-slate-900">
                          {personalInfo?.dateOfBirth ? new Date(personalInfo.dateOfBirth).toLocaleDateString("en-IN") : "N/A"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-xs font-bold text-slate-400">Gender</span>
                        <span className="font-semibold text-slate-900">{personalInfo?.gender || "N/A"}</span>
                      </div>

                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-xs font-bold text-slate-400">Marital Status</span>
                        <span className="font-semibold text-slate-900">{personalInfo?.maritalStatus || "N/A"}</span>
                      </div>

                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-xs font-bold text-slate-400">Blood Group</span>
                        <span className="font-semibold text-slate-900">{personalInfo?.bloodGroup || "N/A"}</span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 col-span-1 md:col-span-2 border-t border-slate-100/60 pt-3 mt-1">
                        <span className="text-xs font-bold text-slate-400">Nationality</span>
                        <span className="font-semibold text-slate-900">{personalInfo?.nationality || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Contact Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3.5 gap-x-6 border border-slate-100 bg-slate-50/50 p-4.5 rounded-2xl">
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-xs font-bold text-slate-400">Personal Email</span>
                        <span className="font-semibold text-slate-900 select-all">{personalInfo?.personalEmail || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-xs font-bold text-slate-400">Official Email</span>
                        <span className="font-semibold text-slate-900 select-all">{userProfile?.officialEmail || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-t border-slate-100/60 pt-3 mt-1 col-span-1 md:col-span-2">
                        <span className="text-xs font-bold text-slate-400">Mobile Phone</span>
                        <span className="font-semibold text-slate-900 select-all">{userProfile?.phoneNumber || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ADDRESS */}
              {activeTab === "address" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {["CURRENT", "PERMANENT"].map((type) => {
                      const addr = addresses.find((a) => a.addressType === type);
                      return (
                        <div key={type} className="border border-slate-200/60 bg-slate-50/30 p-5 rounded-2xl shadow-2xs">
                          <span className="text-[10px] font-bold text-[#013e37] block mb-2 uppercase tracking-widest font-semibold border-b border-[#013e37]/10 pb-1.5">{type} Address</span>
                          {addr ? (
                            <p className="text-xs leading-relaxed text-slate-800 font-medium">
                              {addr.addressLine1}
                              {addr.addressLine2 && `, ${addr.addressLine2}`}
                              <br />
                              {addr.city}, {addr.state}
                              <br />
                              {addr.country} - {addr.postalCode}
                            </p>
                          ) : (
                            <span className="text-xs text-slate-400 italic font-semibold">No address info saved</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: FAMILY INFO */}
              {activeTab === "family" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Parent / Family Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="border border-slate-200/60 bg-slate-50/30 p-4.5 rounded-2xl shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider border-b border-slate-100 pb-1.5">Father's Details</span>
                      <div className="space-y-1.5 text-xs">
                        <span className="font-bold text-slate-900 block">{parentInfo?.fatherName || "N/A"}</span>
                        <span className="text-slate-500 font-medium block">Phone: {parentInfo?.fatherMobile || "N/A"}</span>
                        <span className="text-slate-400 font-semibold block">Job: {parentInfo?.fatherOccupation || "N/A"}</span>
                      </div>
                    </div>
                    
                    <div className="border border-slate-200/60 bg-slate-50/30 p-4.5 rounded-2xl shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider border-b border-slate-100 pb-1.5">Mother's Details</span>
                      <div className="space-y-1.5 text-xs">
                        <span className="font-bold text-slate-900 block">{parentInfo?.motherName || "N/A"}</span>
                        <span className="text-slate-500 font-medium block">Phone: {parentInfo?.motherMobile || "N/A"}</span>
                        <span className="text-slate-400 font-semibold block">Job: {parentInfo?.motherOccupation || "N/A"}</span>
                      </div>
                    </div>

                    <div className="border border-slate-200/60 bg-slate-50/30 p-4.5 rounded-2xl shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider border-b border-slate-100 pb-1.5">Guardian's Details</span>
                      <div className="space-y-1.5 text-xs">
                        <span className="font-bold text-slate-900 block">{parentInfo?.guardianName || "N/A"}</span>
                        <span className="text-slate-500 font-medium block">Phone: {parentInfo?.guardianMobile || "N/A"}</span>
                        <span className="text-slate-400 font-semibold block">Relation: {parentInfo?.relationship || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: STATUTORY DETAILS */}
              {activeTab === "statutory" && (
                <div className="space-y-6">
                  {/* Identity Numbers */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Identity Numbers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="border border-slate-200/60 bg-slate-50/30 p-4.5 rounded-2xl shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Aadhaar Card No</span>
                        <span className="font-mono text-xs font-bold text-slate-900 select-all">{personalInfo?.aadhaarNumber || "N/A"}</span>
                      </div>
                      <div className="border border-slate-200/60 bg-slate-50/30 p-4.5 rounded-2xl shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">PAN Number</span>
                        <span className="font-mono text-xs font-bold text-slate-900 select-all">{personalInfo?.panNumber || "N/A"}</span>
                      </div>
                      <div className="border border-slate-200/60 bg-slate-50/30 p-4.5 rounded-2xl shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Passport Number</span>
                        <span className="font-mono text-xs font-bold text-slate-900 select-all">{personalInfo?.passportNumber || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* PF Details */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">PF Details</h4>
                      <div className="border border-slate-100 bg-slate-50/50 p-4.5 rounded-2xl space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">UAN Number</span>
                          <span className="font-mono text-xs font-bold text-slate-900 select-all">{pfDetail?.uanNumber || "Not Provided"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">PF Number</span>
                          <span className="font-mono text-xs font-bold text-slate-900 select-all">{pfDetail?.pfNumber || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* ESI Details */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">ESI Details</h4>
                      <div className="border border-slate-100 bg-slate-50/50 p-4.5 rounded-2xl space-y-3 min-h-[120px]">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">ESI Account No</span>
                          <span className="font-mono text-xs font-bold text-slate-900 select-all">{esiDetail?.esiNumber || "Not Provided"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Insurance Details */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Insurance</h4>
                      <div className="border border-slate-100 bg-slate-50/50 p-4.5 rounded-2xl space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">Provider</span>
                          <span className="font-semibold text-slate-900">{insuranceDetail?.insuranceProvider || "Not Provided"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">Policy Number</span>
                          <span className="font-mono text-xs font-bold text-slate-900 select-all">{insuranceDetail?.policyNumber || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">Expiry Date</span>
                          <span className="font-semibold text-slate-900">
                            {insuranceDetail?.insuranceExpiryDate ? new Date(insuranceDetail.insuranceExpiryDate).toLocaleDateString("en-IN") : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: OTHERS (Bank account details) */}
              {activeTab === "others" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Bank Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-slate-100 bg-slate-50/50 p-5 rounded-2xl shadow-2xs">
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-400">Bank Name</span>
                        <span className="font-bold text-slate-900">{bankDetails?.bankName || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-400">Account Number</span>
                        <span className="font-mono font-bold text-slate-900 select-all">{bankDetails?.accountNumber || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-400">IFSC Code</span>
                        <span className="font-mono font-bold text-slate-900 select-all">{bankDetails?.ifscCode || "N/A"}</span>
                      </div>
                    </div>
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-400">Branch Name</span>
                        <span className="font-bold text-slate-900">{bankDetails?.branchName || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-400">Account Type</span>
                        <span className="font-bold text-slate-900">{bankDetails?.accountType || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-400">UPI ID</span>
                        <span className="font-bold text-slate-900 select-all">{bankDetails?.upiId || "None"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: DOCUMENTS */}
              {activeTab === "documents" && (
                <div className="space-y-6">
                  {/* Upload document form */}
                  <form onSubmit={handleUploadDoc} className="p-4.5 border border-slate-200 bg-slate-50/30 rounded-2xl space-y-4 shadow-2xs">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Upload New KYC Document</h4>
                    
                    {uploadError && (
                      <div className="p-3 text-xs bg-rose-50 border border-rose-100 text-rose-600 rounded-xl font-semibold">
                        {uploadError}
                      </div>
                    )}
                    {uploadSuccess && (
                      <div className="p-3 text-xs bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl font-semibold">
                        {uploadSuccess}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider font-bold">Doc Type</label>
                        <select
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
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
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider font-bold">Choose File</label>
                        <div className="relative flex items-center justify-between border border-slate-300 bg-white rounded-xl px-3 h-10 hover:border-slate-400 transition-colors">
                          <span className="text-xs text-slate-500 truncate max-w-[150px] font-medium">
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
                            className="text-[10px] font-extrabold text-[#013e37] bg-[#013e37]/5 hover:bg-[#013e37]/10 rounded-lg px-2 py-1.5 cursor-pointer select-none"
                          >
                            Browse
                          </label>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        isLoading={isUploading}
                        variant="primary"
                        className="h-10 cursor-pointer text-xs font-bold rounded-xl"
                      >
                        <UploadCloud className="w-4 h-4 mr-1.5" />
                        <span>Upload</span>
                      </Button>
                    </div>
                  </form>

                  {/* Documents list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Uploaded KYC Vault</h4>
                    {documents.length === 0 ? (
                      <div className="text-center p-8 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-semibold">
                        No KYC documents uploaded for this employee user.
                      </div>
                    ) : (
                      <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
                        <table className="w-full text-left text-xs text-slate-700 border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200/80 font-bold text-slate-800">
                              <th className="py-2.5 px-4 font-bold uppercase tracking-wider">Doc Type</th>
                              <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {documents.map((doc) => (
                              <tr key={doc.documentId} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-4 font-bold text-slate-900">{doc.documentType}</td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => handleDownloadDoc(doc.documentId)}
                                      className="p-1 text-slate-500 hover:bg-[#013e37]/10 hover:text-[#013e37] rounded-lg transition-colors cursor-pointer"
                                      title="Download File"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDoc(doc.documentId, doc.documentType)}
                                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
              )}

            </div>
          </div>
        </div>

      </div>



      {/* Delete Document Confirmation Modal */}
      {isDeleteDocConfirmOpen && docToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 p-6 shadow-xl space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Delete Document</h3>
              <p className="text-sm text-slate-500 font-medium">
                Are you sure you want to delete the <span className="font-semibold text-slate-800">{docToDelete.type}</span> document? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsDeleteDocConfirmOpen(false);
                  setDocToDelete(null);
                }}
                className="px-4.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDoc}
                className="px-4.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-755 rounded-xl shadow-xs transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
