import React, { useState, useEffect } from "react";
import { X, FileText, Loader2, Download, Trash2, UploadCloud, ShieldAlert, Users, MapPin, Briefcase, User as UserIcon } from "lucide-react";
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

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number; // This is the userId
  employeeName: string;
}

type TabType = "overview" | "personal" | "address" | "statutory" | "documents";

export const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
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
    if (isOpen && employeeId) {
      loadAllData();
      setActiveTab("overview");
    }
  }, [isOpen, employeeId]);

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

  const handleDeleteDoc = async (docId: number, typeName: string) => {
    if (!confirm(`Are you sure you want to delete the ${typeName} document?`)) return;

    try {
      const res = await deleteEmployeeDocument(docId);
      if (res.success) {
        alert("Document deleted successfully.");
        // Reload documents list
        const docRes = await getEmployeeDocumentsByUserId(employeeId);
        if (docRes.success) setDocuments(docRes.data || []);
      } else {
        alert(res.error || "Failed to delete document.");
      }
    } catch (err) {
      alert("Failed to delete document.");
    }
  };

  const handleDownloadDoc = async (docId: number) => {
    await downloadEmployeeDocument(docId);
  };

  if (!isOpen) return null;

  return (
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
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {employeeName}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Employee details dashboard & document vault.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-6 gap-2 bg-slate-50/50">
          {[
            { id: "overview", label: "Overview", icon: Briefcase },
            { id: "personal", label: "Personal & Family", icon: Users },
            { id: "address", label: "Addresses & Bank", icon: MapPin },
            { id: "statutory", label: "Statutory", icon: ShieldAlert },
            { id: "documents", label: "KYC Documents", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Container */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[350px]">
          {isLoading ? (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="text-slate-500 text-xs font-semibold">Loading profile information...</span>
            </div>
          ) : errorMsg ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <div className="space-y-6 text-slate-800 text-sm">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Corporate Details</h4>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 border border-slate-100 bg-slate-50/50 p-4 rounded-2xl">
                      <span className="text-xs font-bold text-slate-500">Employee Code</span>
                      <span className="font-mono text-xs font-bold text-slate-900">{userProfile?.employeeCode || "N/A"}</span>
                      
                      <span className="text-xs font-bold text-slate-500">Assigned Role</span>
                      <span className="font-semibold text-slate-900">{userProfile?.role?.roleName || "Staff"}</span>
                      
                      <span className="text-xs font-bold text-slate-500">Department</span>
                      <span className="font-semibold text-slate-900">{userProfile?.department?.departmentName || "General"}</span>

                      <span className="text-xs font-bold text-slate-500">Designation</span>
                      <span className="font-semibold text-slate-900">
                        {designations.find((d) => d.designationId === userProfile?.designationId)?.designationName || userProfile?.role?.roleName || "Staff"}
                      </span>

                      <span className="text-xs font-bold text-slate-500">Employment Type</span>
                      <span className="font-semibold text-slate-900">{(userProfile?.employmentType || "FULL_TIME").replace("_", "-")}</span>

                      <span className="text-xs font-bold text-slate-500">Joining Date</span>
                      <span className="font-semibold text-slate-900">{userProfile?.joiningDate ? new Date(userProfile.joiningDate).toLocaleDateString() : "N/A"}</span>

                      <span className="text-xs font-bold text-slate-500">Status</span>
                      <span className="font-semibold text-slate-900">{userProfile?.status || "ACTIVE"}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Account Profile</h4>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 border border-slate-100 bg-slate-50/50 p-4 rounded-2xl">
                      <span className="text-xs font-bold text-slate-500">Official Email</span>
                      <span className="font-semibold text-slate-900 break-all">{userProfile?.officialEmail || "N/A"}</span>

                      <span className="text-xs font-bold text-slate-500">Phone Number</span>
                      <span className="font-semibold text-slate-900">{userProfile?.phoneNumber || "N/A"}</span>

                      <span className="text-xs font-bold text-slate-500">Reporting To</span>
                      <span className="font-semibold text-slate-900">
                        {userProfile?.manager ? `${userProfile.manager.firstName} ${userProfile.manager.lastName || ""}`.trim() : "None"}
                      </span>

                      <span className="text-xs font-bold text-slate-500">Probation End</span>
                      <span className="font-semibold text-slate-900">{userProfile?.probationEndDate ? new Date(userProfile.probationEndDate).toLocaleDateString() : "None"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PERSONAL & FAMILY */}
              {activeTab === "personal" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Personal Profile</h4>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 border border-slate-100 bg-slate-50/50 p-4 rounded-2xl">
                        <span className="text-xs font-bold text-slate-500">Date of Birth</span>
                        <span className="font-semibold text-slate-900">{personalInfo?.dateOfBirth ? new Date(personalInfo.dateOfBirth).toLocaleDateString() : "N/A"}</span>
                        
                        <span className="text-xs font-bold text-slate-500">Gender</span>
                        <span className="font-semibold text-slate-900">{personalInfo?.gender || "N/A"}</span>

                        <span className="text-xs font-bold text-slate-500">Marital Status</span>
                        <span className="font-semibold text-slate-900">{personalInfo?.maritalStatus || "N/A"}</span>

                        <span className="text-xs font-bold text-slate-500">Blood Group</span>
                        <span className="font-semibold text-slate-900">{personalInfo?.bloodGroup || "N/A"}</span>

                        <span className="text-xs font-bold text-slate-500">Nationality</span>
                        <span className="font-semibold text-slate-900">{personalInfo?.nationality || "N/A"}</span>

                        <span className="text-xs font-bold text-slate-500">Personal Email</span>
                        <span className="font-semibold text-slate-900 break-all">{personalInfo?.personalEmail || "N/A"}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Identity Numbers</h4>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 border border-slate-100 bg-slate-50/50 p-4 rounded-2xl">
                        <span className="text-xs font-bold text-slate-500">Aadhaar Card No</span>
                        <span className="font-mono text-xs font-bold text-slate-900">{personalInfo?.aadhaarNumber || "N/A"}</span>

                        <span className="text-xs font-bold text-slate-500">PAN Number</span>
                        <span className="font-mono text-xs font-bold text-slate-900">{personalInfo?.panNumber || "N/A"}</span>

                        <span className="text-xs font-bold text-slate-500">Passport Number</span>
                        <span className="font-mono text-xs font-bold text-slate-900">{personalInfo?.passportNumber || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Parent / Family Info</h4>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-500 block mb-1">Father's Details</span>
                        <span className="font-bold text-slate-900 block">{parentInfo?.fatherName || "N/A"}</span>
                        <span className="text-xs text-slate-500 block">{parentInfo?.fatherMobile || "No Mobile"}</span>
                        <span className="text-xs text-slate-400 block">{parentInfo?.fatherOccupation || "No Occupation"}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-500 block mb-1">Mother's Details</span>
                        <span className="font-bold text-slate-900 block">{parentInfo?.motherName || "N/A"}</span>
                        <span className="text-xs text-slate-500 block">{parentInfo?.motherMobile || "No Mobile"}</span>
                        <span className="text-xs text-slate-400 block">{parentInfo?.motherOccupation || "No Occupation"}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-500 block mb-1">Guardian's Details</span>
                        <span className="font-bold text-slate-900 block">{parentInfo?.guardianName || "N/A"}</span>
                        <span className="text-xs text-slate-500 block">{parentInfo?.guardianMobile || "No Mobile"}</span>
                        <span className="text-xs text-slate-400 block">Rel: {parentInfo?.relationship || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ADDRESSES & BANK */}
              {activeTab === "address" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Address Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["CURRENT", "PERMANENT"].map((type) => {
                        const addr = addresses.find((a) => a.addressType === type);
                        return (
                          <div key={type} className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl">
                            <span className="text-xs font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">{type} Address</span>
                            {addr ? (
                              <p className="text-xs leading-relaxed text-slate-800">
                                {addr.addressLine1}
                                {addr.addressLine2 && `, ${addr.addressLine2}`}
                                <br />
                                {addr.city}, {addr.state}
                                <br />
                                {addr.country} - {addr.postalCode}
                              </p>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No Address info saved</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Bank Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-100 bg-slate-50/50 p-4 rounded-2xl">
                      <div className="grid grid-cols-2 gap-y-2">
                        <span className="text-xs font-bold text-slate-500">Bank Name</span>
                        <span className="font-semibold text-slate-900">{bankDetails?.bankName || "N/A"}</span>

                        <span className="text-xs font-bold text-slate-500">Account Number</span>
                        <span className="font-mono text-xs font-bold text-slate-900">{bankDetails?.accountNumber || "N/A"}</span>

                        <span className="text-xs font-bold text-slate-500">IFSC Code</span>
                        <span className="font-mono text-xs font-bold text-slate-900">{bankDetails?.ifscCode || "N/A"}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2">
                        <span className="text-xs font-bold text-slate-500">Branch Name</span>
                        <span className="font-semibold text-slate-900">{bankDetails?.branchName || "N/A"}</span>

                        <span className="text-xs font-bold text-slate-500">Account Type</span>
                        <span className="font-semibold text-slate-900">{bankDetails?.accountType || "N/A"}</span>

                        <span className="text-xs font-bold text-slate-500">UPI ID</span>
                        <span className="font-semibold text-slate-900">{bankDetails?.upiId || "None"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: STATUTORY */}
              {activeTab === "statutory" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* PF Details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">PF Details</h4>
                    <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-500 block">UAN Number</span>
                        <span className="font-mono text-xs font-bold text-slate-900">{pfDetail?.uanNumber || "Not Provided"}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-500 block">PF Number</span>
                        <span className="font-mono text-xs font-bold text-slate-900">{pfDetail?.pfNumber || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* ESI Details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">ESI Details</h4>
                    <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-500 block">ESI Account No</span>
                        <span className="font-mono text-xs font-bold text-slate-900">{esiDetail?.esiNumber || "Not Provided"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Insurance Details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Insurance Details</h4>
                    <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-500 block">Provider</span>
                        <span className="font-semibold text-slate-900">{insuranceDetail?.insuranceProvider || "Not Provided"}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-500 block">Policy Number</span>
                        <span className="font-mono text-xs font-bold text-slate-900">{insuranceDetail?.policyNumber || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-500 block">Expiry Date</span>
                        <span className="font-semibold text-slate-900">
                          {insuranceDetail?.insuranceExpiryDate ? new Date(insuranceDetail.insuranceExpiryDate).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DOCUMENTS VAULT */}
              {activeTab === "documents" && (
                <div className="space-y-6">
                  {/* Upload new doc form */}
                  <form onSubmit={handleUploadDoc} className="p-4 border border-slate-200 bg-slate-50/50 rounded-2xl space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Upload New KYC Document</h4>
                    
                    {uploadError && (
                      <div className="p-3 text-xs bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
                        {uploadError}
                      </div>
                    )}
                    {uploadSuccess && (
                      <div className="p-3 text-xs bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
                        {uploadSuccess}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-semibold">Doc Type</label>
                        <select
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
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

                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-semibold">Choose File</label>
                        <div className="relative flex items-center justify-between border border-slate-300 bg-white rounded-xl px-3 h-11 hover:border-slate-400 transition-colors">
                          <span className="text-xs text-slate-500 truncate max-w-[150px]">
                            {uploadFileName || "No file chosen"}
                          </span>
                          <input
                            type="file"
                            id="detailDocFile"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setUploadFile(file);
                              setUploadFileName(file ? file.name : "");
                            }}
                            className="hidden"
                          />
                          <label 
                            htmlFor="detailDocFile"
                            className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-2 py-1.5 cursor-pointer select-none"
                          >
                            Browse
                          </label>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        isLoading={isUploading}
                        variant="primary"
                        className="h-11 cursor-pointer"
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
                      <div className="text-center p-8 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                        No KYC documents uploaded for this employee user.
                      </div>
                    ) : (
                      <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
                        <table className="w-full text-left text-xs text-slate-700 border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-800">
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
                                      className="p-1 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
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
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="px-5 cursor-pointer">
            Close Panel
          </Button>
        </div>
      </div>
    </div>
  );
};
