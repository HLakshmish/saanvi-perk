"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CompanyRegistrationForm } from "@/features/company/components/company-registration-form";
import { getAllCompanies, deleteCompany, getCompanyById } from "@/features/company/api/company.api";
import { Company } from "@/features/company/types/company.types";
import {
  Building2,
  Plus,
  Globe,
  Mail,
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
  ArrowLeft,
  List,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OwnerDashboardPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_name");
      localStorage.removeItem("company_id");
      localStorage.removeItem("company_name");
      localStorage.removeItem("company_logo");
    }
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        .sidebar-header-bg { background-color: var(--brand-primary); }
        .brand-purple-bg { background-color: var(--brand-primary); color: var(--brand-btn-text); }
        .brand-purple-text { color: var(--brand-primary); }
        .brand-purple-border { border-color: var(--brand-primary); }
        .brand-btn-primary { 
          background-color: var(--brand-primary); 
          color: var(--brand-btn-text); 
          font-weight: 700;
        }
        .brand-btn-primary:hover { 
          background-color: var(--brand-primary-hover); 
          box-shadow: 0 4px 14px rgba(1, 62, 55, 0.35);
        }
        .brand-badge { 
          background-color: var(--brand-primary-light); 
          color: var(--brand-primary); 
        }
      `}</style>

      <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
        {/* ─── Top Header Bar ─── */}
        <header className="sidebar-header-bg border-b border-[#012d28] sticky top-0 z-40 shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 h-16">
            <div className="flex items-center gap-3">
              {showRegistrationForm && (
                <button
                  onClick={() => {
                    setShowRegistrationForm(false);
                    setEditingCompany(null);
                  }}
                  className="p-2 rounded-xl text-brand-btn-text hover:text-white hover:bg-white/10 transition-colors cursor-pointer mr-1"
                  title="Back to Companies List"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <Image
                src="/icon1.png"
                alt="Nexus Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain rounded-xl shadow-md shadow-[#013e37]/30"
              />
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-brand-btn-text text-base sm:text-lg tracking-tight">
                  Nexus
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-brand-btn-text hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-[#012d28]"
            >
              <LogOut className="w-4 h-4 text-brand-btn-text" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* ─── Main Content Container ─── */}
        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
          {/* Page Header & Actions */}
          {!showRegistrationForm && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 brand-purple-text" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-primary tracking-tight">
                    Company Management
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Register and manage multi-tenant companies on Saanvi Nexus.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-2xs mr-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-brand-primary text-brand-btn-text" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-brand-primary text-brand-btn-text" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Registered Companies Count Badge */}
                <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-center flex items-center gap-2 hidden sm:flex">
                  <span className="text-xs text-slate-500 font-semibold">Total Companies:</span>
                  <span className="text-base font-extrabold brand-purple-text">
                    {companies.length}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setShowRegistrationForm(true);
                    setEditingCompany(null);
                    setSelectedCompany(null);
                  }}
                  className="brand-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <Plus className="w-4 h-4 text-brand-btn-text" />
                  <span className="hidden sm:inline">Register New Company</span>
                  <span className="sm:hidden">New</span>
                </button>
              </div>
            </div>
          )}

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 rounded-xl" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <div className="space-y-2 py-2 border-y border-slate-100">
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-3 w-36" />
                        <Skeleton className="h-3 w-44" />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <Skeleton className="h-3 w-20" />
                        <div className="flex gap-1.5">
                          <Skeleton className="w-7 h-7 rounded-lg" />
                          <Skeleton className="w-7 h-7 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : companies.length === 0 ? (
                /* ── Empty State ── */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 sm:p-20 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-10 h-10 brand-purple-text" />
                  </div>
                  <h2 className="text-xl font-bold text-brand-primary mb-2">
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
                    className="brand-btn-primary px-6 py-3 rounded-xl text-sm font-bold shadow-2xs inline-flex items-center gap-2 cursor-pointer transition-all hover:shadow-xs"
                  >
                    <Plus className="w-4 h-4 text-brand-btn-text" />
                    Register Your First Company
                  </button>
                </div>
              ) : (
                /* ── Companies Grid/List ── */
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-4"}>
                  {companies.map((company) => (
                    <div
                      key={company.companyId}
                      className={`bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-brand-primary/40 transition-all p-6 group ${viewMode === "list" ? "flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6" : "flex flex-col justify-between"
                        }`}
                    >
                      <div className={viewMode === "list" ? "flex-1 flex flex-col md:flex-row items-start md:items-center gap-6 w-full" : ""}>
                        {/* Company Header */}
                        <div className={`flex items-start justify-between mb-4 ${viewMode === "list" ? "md:mb-0 md:min-w-[250px]" : ""}`}>
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl brand-purple-bg flex items-center justify-center text-brand-btn-text text-lg font-extrabold shrink-0 shadow-xs">
                              {company.companyName?.charAt(0)?.toUpperCase() || "C"}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-base leading-tight">
                                {company.companyName}
                              </h3>
                              <span className="brand-badge text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mt-1">
                                CODE: {company.companyCode}
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Company Details (Clean, no date field) */}
                        <div className={`space-y-2 text-xs text-slate-600 mb-5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 ${viewMode === "list" ? "mb-0 md:flex-1 w-full md:w-auto" : ""}`}>
                          <div className="flex items-center gap-2.5">
                            <Mail className="w-3.5 h-3.5 text-brand-primary" />
                            <span className="font-medium text-slate-700">{company.companyEmail}</span>
                          </div>
                          {company.website && (
                            <div className="flex items-center gap-2.5">
                              <Globe className="w-3.5 h-3.5 text-brand-primary" />
                              <span className="font-medium text-slate-700">{company.website}</span>
                            </div>
                          )}
                        </div>

                        {/* SuperAdmin Info */}
                        {company.superAdmin && (
                          <div className={`bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-3 flex items-center gap-3 mb-4 ${viewMode === "list" ? "mb-0 md:min-w-[200px]" : ""}`}>
                            <div className="w-8 h-8 rounded-full brand-purple-bg flex items-center justify-center text-brand-btn-text">
                              <Users className="w-4 h-4 text-brand-btn-text" />
                            </div>
                            <div className="text-xs">
                              <span className="font-bold text-slate-900">
                                {company.superAdmin.firstName}{" "}
                                {company.superAdmin.lastName || ""}
                              </span>
                              <span className="text-brand-primary ml-1.5 text-[10px] font-extrabold uppercase">
                                • SuperAdmin
                              </span>
                              <p className="text-[11px] text-slate-500">{company.superAdmin.email}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Actions: View, Edit, Delete */}
                      <div className={`pt-4 border-t border-slate-100 flex items-center justify-end gap-2 ${viewMode === "list" ? "pt-0 border-t-0 lg:w-auto w-full" : ""}`}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewCompany(company.companyId)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5 text-brand-primary" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleEditCompany(company)}
                            className="px-3 py-1.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-brand-primary/30"
                          >
                            <Pencil className="w-3.5 h-3.5 text-brand-primary" />
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

          {/* ─── VIEW COMPANY DETAILS MODAL ─── */}
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
                  <div className="w-14 h-14 rounded-xl brand-purple-bg flex items-center justify-center text-brand-btn-text font-extrabold text-xl shadow-md">
                    {selectedCompany.companyName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-brand-primary leading-tight">
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
                    <div className="font-bold text-brand-primary flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-brand-primary" />
                      <span>Contact & Profile Information</span>
                    </div>
                    <div className="text-slate-600">Email: <span className="text-slate-900 font-semibold">{selectedCompany.companyEmail}</span></div>
                    {selectedCompany.companyPhone && (
                      <div className="text-slate-600 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone: <span className="text-slate-900 font-semibold ml-1">{selectedCompany.companyPhone}</span>
                      </div>
                    )}
                    {selectedCompany.website && (
                      <div className="text-slate-600">Website: <span className="text-brand-primary font-semibold">{selectedCompany.website}</span></div>
                    )}
                    {selectedCompany.industryType && (
                      <div className="text-slate-600">Industry: <span className="text-slate-900 font-semibold">{selectedCompany.industryType}</span></div>
                    )}
                  </div>

                  {/* Tax & Compliance */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="font-bold text-brand-primary flex items-center gap-2 mb-1">
                      <FileCheck2 className="w-4 h-4 text-brand-primary" />
                      <span>Tax & Compliance</span>
                    </div>
                    <div className="text-slate-600">GST Number: <span className="text-slate-900 font-semibold font-mono">{selectedCompany.gstNumber || "N/A"}</span></div>
                    <div className="text-slate-600">PAN Number: <span className="text-slate-900 font-semibold font-mono">{selectedCompany.panNumber || "N/A"}</span></div>
                  </div>

                  {/* Superadmin Info */}
                  {selectedCompany.superAdmin && (
                    <div className="p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/25 space-y-1.5">
                      <div className="font-bold text-brand-primary flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-brand-primary" />
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
                    className="px-4 py-2 bg-brand-primary text-brand-btn-text font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs hover:bg-brand-primary-hover transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-brand-btn-text" />
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
