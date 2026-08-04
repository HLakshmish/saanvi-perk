"use client";

import React, { useState, useEffect } from "react";
import { CompanyRegistrationForm } from "@/features/company/components/company-registration-form";
import { getAllCompanies, deleteCompany, getCompanyById } from "@/features/company/api/company.api";
import { Company } from "@/features/company/types/company.types";
import {
  Building2,
  Plus,
  Globe,
  Mail,
  Calendar,
  Users,
  LogOut,
  Eye,
  Trash2,
  X,
  MapPin,
  Clock,
  FileCheck2,
  LayoutGrid,
  Phone,
  Pencil,
} from "lucide-react";

export default function OwnerDashboardPage() {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const result = await getAllCompanies();
      if (result.success && result.data) {
        setCompanies(result.data);
      }
    } catch (err) {
      console.warn("Could not fetch companies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCompany = async (companyId: number) => {
    try {
      const res = await getCompanyById(companyId);
      if (res.success && res.data) {
        setSelectedCompany(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch company details:", err);
    }
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(null);
    setEditingCompany(company);
    setShowRegistrationForm(true);
  };

  const handleDeleteCompany = async (companyId: number, companyName: string) => {
    if (confirm(`Are you sure you want to delete "${companyName}"? This action cannot be undone.`)) {
      const res = await deleteCompany(companyId);
      if (res.success) {
        setCompanies((prev) => prev.filter((c) => c.companyId !== companyId));
        if (selectedCompany?.companyId === companyId) {
          setSelectedCompany(null);
        }
      }
    }
  };

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; max-age=0;";
    document.cookie = "user_role=; path=/; max-age=0;";
    document.cookie = "company_id=; path=/; max-age=0;";
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        .owner-header-bg { background-color: #003e6b; }
        .brand-orange-bg { background-color: #f99d5e; }
        .brand-orange-text { color: #f99d5e; }
        .brand-orange-border { border-color: #f99d5e; }
        .brand-bg-white { background-color: #fff9f5; }
        .brand-btn-primary { 
          background-color: #f99d5e; 
          color: #003e6b; 
          font-weight: 700;
        }
        .brand-btn-primary:hover { 
          background-color: #f88a42; 
          box-shadow: 0 4px 14px rgba(249, 157, 94, 0.35);
        }
        .brand-badge { 
          background-color: rgba(249, 157, 94, 0.12); 
          color: #e8783a; 
        }
      `}</style>

      <div className="min-h-screen brand-bg-white font-sans text-slate-800">
        {/* ─── Top Header Bar (Deep Blue + Brand Orange Logo) ─── */}
        <header className="owner-header-bg border-b border-[#f99d5e]/10 sticky top-0 z-40 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl brand-orange-bg flex items-center justify-center text-[#003e6b] text-lg font-extrabold shadow-sm">
                S
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                  Saanvi Perk
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white/70 hover:text-[#f99d5e] hover:bg-white/5 rounded-xl transition-all cursor-pointer border border-transparent"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* ─── Main Content Container (Crisp White / Light Theme) ─── */}
        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
          {/* Page Header & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 brand-orange-text" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Company Management
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Register and manage multi-tenant companies on Saanvi Perk.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Registered Companies Count Badge */}
              {!showRegistrationForm && (
                <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-center flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">Total Companies:</span>
                  <span className="text-base font-extrabold brand-orange-text">
                    {companies.length}
                  </span>
                </div>
              )}

              <button
                onClick={() => {
                  setShowRegistrationForm(!showRegistrationForm);
                  setEditingCompany(null);
                  setSelectedCompany(null);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm ${
                  showRegistrationForm
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    : "brand-btn-primary shadow-[#f99d5e]/20"
                }`}
              >
                {showRegistrationForm ? (
                  <>
                    <X className="w-4 h-4" />
                    Back to Companies List
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Register New Company
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ─── CONDITIONAL VIEW ─── */}
          {showRegistrationForm ? (
            <CompanyRegistrationForm
              editCompany={editingCompany}
              onSuccess={() => {
                setShowRegistrationForm(false);
                setEditingCompany(null);
                fetchCompanies();
              }}
            />
          ) : (
            <>
              {isLoading ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-[#f99d5e] rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium text-slate-500">Loading registered companies...</p>
                </div>
              ) : companies.length === 0 ? (
                /* ── Empty State ── */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 sm:p-20 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-[#f99d5e]/10 border border-[#f99d5e]/20 flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-10 h-10 brand-orange-text" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    No Companies Registered Yet
                  </h2>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
                    Get started by registering your first company. Each company gets its own SuperAdmin, employees, and attendance settings.
                  </p>
                  <button
                    onClick={() => {
                      setEditingCompany(null);
                      setShowRegistrationForm(true);
                    }}
                    className="brand-btn-primary px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-[#f99d5e]/20 inline-flex items-center gap-2 cursor-pointer transition-all hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Register Your First Company
                  </button>
                </div>
              ) : (
                /* ── Companies Grid (Clean White Cards) ── */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {companies.map((company) => (
                    <div
                      key={company.companyId}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#f99d5e]/40 transition-all p-6 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Company Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl brand-orange-bg flex items-center justify-center text-[#0c111a] text-lg font-extrabold shrink-0 shadow-sm">
                              {company.companyName?.charAt(0)?.toUpperCase() || "C"}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-base leading-tight">
                                {company.companyName}
                              </h3>
                              <span className="brand-badge text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mt-1">
                                Code: {company.companyCode}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              company.status
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {company.status ? "Active" : "Inactive"}
                          </div>
                        </div>

                        {/* Company Details */}
                        <div className="space-y-2 text-xs text-slate-600 mb-5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <Mail className="w-3.5 h-3.5 text-[#f99d5e]" />
                            <span className="font-medium text-slate-700">{company.companyEmail}</span>
                          </div>
                          {company.website && (
                            <div className="flex items-center gap-2.5">
                              <Globe className="w-3.5 h-3.5 text-[#f99d5e]" />
                              <span className="font-medium text-slate-700">{company.website}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2.5">
                            <Calendar className="w-3.5 h-3.5 text-[#f99d5e]" />
                            <span className="text-slate-500">
                              Registered:{" "}
                              <strong className="text-slate-700 font-semibold">
                                {new Date(company.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* SuperAdmin Info */}
                        {company.superAdmin && (
                          <div className="bg-[#f99d5e]/10 border border-[#f99d5e]/20 rounded-xl p-3 flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full brand-orange-bg flex items-center justify-center text-[#0c111a]">
                              <Users className="w-4 h-4" />
                            </div>
                            <div className="text-xs">
                              <span className="font-bold text-slate-900">
                                {company.superAdmin.firstName}{" "}
                                {company.superAdmin.lastName || ""}
                              </span>
                              <span className="text-[#e8783a] ml-1.5 text-[10px] font-extrabold uppercase">
                                • SuperAdmin
                              </span>
                              <p className="text-[11px] text-slate-500">{company.superAdmin.email}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Actions: View, Edit (PUT), Delete */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewCompany(company.companyId)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#e8783a]" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleEditCompany(company)}
                            className="px-3 py-1.5 rounded-xl bg-[#f99d5e]/15 hover:bg-[#f99d5e]/25 text-[#e8783a] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-[#f99d5e]/30"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteCompany(company.companyId, company.companyName)}
                          className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ─── VIEW COMPANY DETAILS MODAL (With Edit Button) ─── */}
          {selectedCompany && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Header */}
                <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-xl brand-orange-bg flex items-center justify-center text-[#0c111a] font-extrabold text-xl shadow-md">
                    {selectedCompany.companyName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">
                      {selectedCompany.companyName}
                    </h2>
                    <span className="brand-badge text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mt-1">
                      Code: {selectedCompany.companyCode}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Contact Info */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 brand-orange-text" />
                      <span>Contact Information</span>
                    </div>
                    <div className="text-slate-600">Email: <span className="text-slate-900 font-semibold">{selectedCompany.companyEmail}</span></div>
                    {selectedCompany.companyPhone && (
                      <div className="text-slate-600 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone: <span className="text-slate-900 font-semibold ml-1">{selectedCompany.companyPhone}</span>
                      </div>
                    )}
                    {selectedCompany.website && (
                      <div className="text-slate-600">Website: <span className="brand-orange-text font-semibold">{selectedCompany.website}</span></div>
                    )}
                  </div>

                  {/* Workplace & Hours */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 brand-orange-text" />
                      <span>Workplace Schedule & Geo-Fence</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="bg-white rounded-lg p-2.5 text-center border border-slate-200 shadow-2xs">
                        <span className="text-lg font-extrabold brand-orange-text block">{selectedCompany.workingHoursPerDay || 8}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Hrs / Day</span>
                      </div>
                      <div className="bg-white rounded-lg p-2.5 text-center border border-slate-200 shadow-2xs">
                        <span className="text-lg font-extrabold brand-orange-text block">{selectedCompany.workingDaysPerWeek || 5}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Days / Week</span>
                      </div>
                    </div>
                    {selectedCompany.officeStartTime && (
                      <div className="text-slate-600">Office Hours: <span className="text-slate-900 font-semibold">{selectedCompany.officeStartTime} – {selectedCompany.officeEndTime}</span></div>
                    )}
                    {selectedCompany.allowedRadius && (
                      <div className="flex items-center gap-1.5 text-slate-600 mt-1">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>Geo-Fence Radius: <strong className="text-slate-900">{selectedCompany.allowedRadius} meters</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Tax & Compliance */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-2 mb-1">
                      <FileCheck2 className="w-4 h-4 brand-orange-text" />
                      <span>Tax & Compliance</span>
                    </div>
                    <div className="text-slate-600">GST: <span className="text-slate-900 font-semibold font-mono">{selectedCompany.gstNumber || "N/A"}</span></div>
                    <div className="text-slate-600">PAN: <span className="text-slate-900 font-semibold font-mono">{selectedCompany.panNumber || "N/A"}</span></div>
                  </div>

                  {/* Superadmin Info */}
                  {selectedCompany.superAdmin && (
                    <div className="p-4 rounded-xl bg-[#f99d5e]/10 border border-[#f99d5e]/25 space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 brand-orange-text" />
                        <span>Assigned SuperAdmin</span>
                      </div>
                      <div className="text-slate-600">Name: <span className="text-slate-900 font-bold">{selectedCompany.superAdmin.firstName} {selectedCompany.superAdmin.lastName || ""}</span></div>
                      <div className="text-slate-600">Email: <span className="text-slate-900 font-semibold">{selectedCompany.superAdmin.email}</span></div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleEditCompany(selectedCompany)}
                    className="px-4 py-2 bg-[#f99d5e] text-[#0c111a] font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:bg-[#f88a42] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Company Details</span>
                  </button>

                  <button
                    onClick={() => setSelectedCompany(null)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
