import React, { useState } from "react";
import { ChevronRight, ChevronDown, Edit3, Upload, Check, X, ShieldAlert } from "lucide-react";
import { CompanyInfoData } from "../types/settings.types";

interface AccountInformationDetailProps {
  onBackToAccountInfo: () => void;
}

const INITIAL_COMPANY_DATA: CompanyInfoData = {
  companyName: "Saanvi Technologies",
  address1: "No 3/68/2, 1st Floor, Anugraha",
  address2: "NH 66, Main Road, Saligrama,",
  city: "Udupi Dist",
  state: "Karnataka",
  country: "India",
  pinCode: "576225",
  fax: "-",
  phone: "9900249822",
  website: "saanvitechin.com",
  subscriptionExpiry: "30-04-2027",
};

export const AccountInformationDetail: React.FC<AccountInformationDetailProps> = ({
  onBackToAccountInfo,
}) => {
  const [activeSubMenu, setActiveSubMenu] = useState<string>("company-info");
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({
    statutory: false,
    mail: false,
    other: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyInfoData>(INITIAL_COMPANY_DATA);
  const [formData, setFormData] = useState<CompanyInfoData>(INITIAL_COMPANY_DATA);

  const toggleAccordion = (key: string) => {
    setExpandedAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyData(formData);
    setIsEditing(false);
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
            className="text-slate-500 hover:text-indigo-600 font-bold transition-colors cursor-pointer"
          >
            Account Info
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Account Information</span>
        </div>

        {/* Expiry Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold shadow-2xs">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>Subscription Expires on {companyData.subscriptionExpiry}</span>
        </div>
      </div>

      {/* Main Split Container: Left Sub-Menu Sidebar + Right Form Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Sub-Sidebar Menu */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs space-y-1">
          {/* Item 1: Company Info */}
          <button
            onClick={() => setActiveSubMenu("company-info")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubMenu === "company-info"
                ? "bg-indigo-50/70 text-indigo-600 border border-indigo-100"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>Company info</span>
            <ChevronRight className={`w-4 h-4 ${activeSubMenu === "company-info" ? "text-indigo-600" : "text-slate-400"}`} />
          </button>

          {/* Item 2: Statutory Info */}
          <div>
            <button
              onClick={() => toggleAccordion("statutory")}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <span>Statutory Info</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedAccordions.statutory ? "rotate-180" : ""}`} />
            </button>
            {expandedAccordions.statutory && (
              <div className="pl-6 pr-3 py-2 space-y-1.5 text-xs text-slate-500 font-medium border-l-2 border-slate-200 ml-4 my-1">
                <div className="hover:text-indigo-600 cursor-pointer py-1">PAN & TAN Details</div>
                <div className="hover:text-indigo-600 cursor-pointer py-1">GST Registration</div>
                <div className="hover:text-indigo-600 cursor-pointer py-1">PF & ESI Setup</div>
              </div>
            )}
          </div>

          {/* Item 3: Mail Configuration */}
          <div>
            <button
              onClick={() => toggleAccordion("mail")}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <span>Mail Configuration</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedAccordions.mail ? "rotate-180" : ""}`} />
            </button>
            {expandedAccordions.mail && (
              <div className="pl-6 pr-3 py-2 space-y-1.5 text-xs text-slate-500 font-medium border-l-2 border-slate-200 ml-4 my-1">
                <div className="hover:text-indigo-600 cursor-pointer py-1">SMTP Server Settings</div>
                <div className="hover:text-indigo-600 cursor-pointer py-1">Sender Email Templates</div>
              </div>
            )}
          </div>

          {/* Item 4: Other Configuration */}
          <div>
            <button
              onClick={() => toggleAccordion("other")}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <span>Other Configuration</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedAccordions.other ? "rotate-180" : ""}`} />
            </button>
            {expandedAccordions.other && (
              <div className="pl-6 pr-3 py-2 space-y-1.5 text-xs text-slate-500 font-medium border-l-2 border-slate-200 ml-4 my-1">
                <div className="hover:text-indigo-600 cursor-pointer py-1">System Preferences</div>
                <div className="hover:text-indigo-600 cursor-pointer py-1">Audit Logs & History</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Main Form Content */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          {/* Card Header & Edit Action */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Company Info
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Detail</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="font-bold text-slate-800 text-sm">{companyData.companyName}</p>
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.address1}</p>
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.address2}</p>
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.city}</p>
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.state}</p>
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.country}</p>
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.pinCode}</p>
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.fax}</p>
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="font-semibold text-slate-800">{companyData.phone}</p>
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="font-semibold text-indigo-600 hover:underline cursor-pointer">{companyData.website}</p>
              )}
            </div>
          </div>

          <hr className="border-slate-100 my-4" />

          {/* Upload Logo Section */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Upload Logo</h4>
              <p className="text-[11px] text-slate-500 font-medium">
                This logo will be displayed on documents such as Payslips, Documents etc...
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
              {/* Logo Preview Box */}
              <div className="w-64 h-20 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-center p-3 shadow-2xs overflow-hidden">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    S
                  </div>
                  <span className="font-bold text-slate-800 text-sm tracking-tight">
                    {companyData.companyName}
                  </span>
                </div>
              </div>

              {/* Upload Controls & Specs */}
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400 font-semibold">
                  Preferred Image Size: 120 x 40 pixels @ 72 DPI, Maximum 100 KB
                </p>

                <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:-translate-y-0.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                  <input type="file" className="hidden" accept=".png,.jpg,.jpeg" />
                </label>

                <p className="text-[10px] text-slate-400 font-medium">
                  Note : Please upload in .png, .jpg formats
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
