"use client";

import React, { useState, useEffect } from "react";
import { UserRole } from "@/types/dashboard";
import { AssetDetails, AssetAssignment, AssetHistory, AssetStatus } from "../types/assets.types";
import {
  getAllAssets,
  deleteAsset,
  getAllAssignments,
  updateAssignment,
  getAllHistory,
} from "../api/assets.api";
import { getEmployees } from "@/features/employees/api/employees.api";
import { Employee } from "@/features/employees/types/employees.types";
import { CreateAssetModal } from "./CreateAssetModal";
import { AssignAssetModal } from "./AssignAssetModal";
import { ReturnAssetModal } from "./ReturnAssetModal";
import { snackbar as toast } from "@/components/ui/snackbar";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Laptop,
  Plus,
  Search,
  Filter,
  UserCheck,
  RotateCcw,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  FileText,
  Loader2,
  Box,
  Layers,
} from "lucide-react";

import { getCurrentUserId } from "@/features/expenses/api/expenses.api";

interface AssetsViewProps {
  currentRole?: UserRole;
}

export const AssetsView: React.FC<AssetsViewProps> = ({ currentRole = "admin" }) => {
  const [activeTab, setActiveTab] = useState<"inventory" | "assignments" | "history">("inventory");
  
  // Data state
  const [assets, setAssets] = useState<AssetDetails[]>([]);
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [historyLogs, setHistoryLogs] = useState<AssetHistory[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<AssetDetails | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assetToAssign, setAssetToAssign] = useState<AssetDetails | null>(null);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [assignmentToReturn, setAssignmentToReturn] = useState<AssetAssignment | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "inventory") {
        const [resAssets, resAssignments, empList] = await Promise.all([
          getAllAssets(),
          getAllAssignments(),
          getEmployees(),
        ]);
        if (resAssets.success && resAssets.data) setAssets(resAssets.data);
        if (resAssignments.success && resAssignments.data) setAssignments(resAssignments.data);
        if (Array.isArray(empList)) setEmployees(empList);
      } else if (activeTab === "assignments") {
        const [resAssets, resAssignments, empList] = await Promise.all([
          getAllAssets(),
          getAllAssignments(),
          getEmployees(),
        ]);
        if (resAssets.success && resAssets.data) setAssets(resAssets.data);
        if (resAssignments.success && resAssignments.data) setAssignments(resAssignments.data);
        if (Array.isArray(empList)) setEmployees(empList);
      } else if (activeTab === "history") {
        const [resAssets, resHistory, empList] = await Promise.all([
          getAllAssets(),
          getAllHistory(),
          getEmployees(),
        ]);
        if (resAssets.success && resAssets.data) setAssets(resAssets.data);
        if (resHistory.success && resHistory.data) setHistoryLogs(resHistory.data);
        if (Array.isArray(empList)) setEmployees(empList);
      }
    } catch (err) {
      console.warn("Could not fetch assets data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAsset = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete asset "${name}"?`)) {
      const res = await deleteAsset(id);
      if (res.success) {
        setAssets((prev) => prev.filter((a) => a.assetId !== id));
        toast.success(`Asset "${name}" deleted successfully!`);
      } else {
        toast.error(res.message || "Failed to delete asset");
      }
    }
  };

  const handleReturnAsset = (assignment: AssetAssignment) => {
    setAssignmentToReturn(assignment);
    setIsReturnModalOpen(true);
  };

  const currentUserId = getCurrentUserId();

  // Helper to check if an asset is assigned to the current employee
  const isAssignedToCurrentEmployee = (asset: AssetDetails) => {
    if (!currentUserId) return false;
    // Check main assignments
    const hasActiveAssignment = assignments.some(
      (a) => a.assetId === asset.assetId && (a.userId === currentUserId || a.user?.userId === currentUserId) && !a.returnedDate
    );
    if (hasActiveAssignment) return true;
    // Check asset nested assignments
    if (asset.assignments && Array.isArray(asset.assignments)) {
      return asset.assignments.some(
        (a) => (a.userId === currentUserId || a.user?.userId === currentUserId) && !a.returnedDate
      );
    }
    return false;
  };

  // Filtered Assets
  const filteredAssets = assets.filter((asset) => {
    if (currentRole === "employee" && !isAssignedToCurrentEmployee(asset)) {
      return false;
    }
    const matchesSearch =
      asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.brand && asset.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || asset.assetStatus === statusFilter;
    const matchesType = typeFilter === "ALL" || asset.assetType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Filtered Assignments
  const filteredAssignments = assignments.filter((assign) => {
    if (currentRole === "employee" && assign.userId !== currentUserId && assign.user?.userId !== currentUserId) {
      return false;
    }
    const assetName = assign.asset?.assetName || "";
    const assetCode = assign.asset?.assetCode || "";
    const userName = `${assign.user?.firstName || ""} ${assign.user?.lastName || ""}`;

    return (
      assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filtered History
  const userAssignedAssetIds = new Set(
    assignments
      .filter((a) => (a.userId === currentUserId || a.user?.userId === currentUserId))
      .map((a) => a.assetId)
  );

  const filteredHistory = historyLogs.filter((log) => {
    if (currentRole === "employee" && log.userId !== currentUserId && !userAssignedAssetIds.has(log.assetId)) {
      return false;
    }
    const assetName = log.asset?.assetName || "";
    const assetCode = log.asset?.assetCode || "";
    const action = log.action || "";

    return (
      assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Summary Metrics
  const totalAssetsCount = assets.length;
  const availableCount = assets.filter((a) => a.assetStatus === "AVAILABLE").length;
  const assignedCount = assets.filter((a) => a.assetStatus === "ASSIGNED").length;
  const otherCount = totalAssetsCount - availableCount - assignedCount;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const datePart = typeof dateStr === "string" ? dateStr.split("T")[0] : "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        const [year, month, day] = datePart.split("-").map(Number);
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const renderStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
            AVAILABLE
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mr-1.5" />
            ASSIGNED
          </span>
        );
      case "UNDER_REPAIR":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
            UNDER REPAIR
          </span>
        );
      case "DAMAGED":
      case "LOST":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white border border-brand-primary/20 shadow-2xs flex items-center justify-center">
            <Laptop className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-primary tracking-tight">
              Asset Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {currentRole === "employee"
                ? "View details and status of hardware equipment assigned to your profile."
                : "Track hardware inventory, employee assignments, returns, and warranty records."}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {currentRole !== "employee" && (
          <button
            onClick={() => {
              setAssetToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-brand-btn-text" />
            <span>Add New Asset</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className={`grid gap-4 ${currentRole === "employee" ? "grid-cols-1 max-w-xs" : "grid-cols-2 lg:grid-cols-4"}`}>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {currentRole === "employee" ? "Your Assigned Assets" : "Total Assets"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {currentRole === "employee" ? filteredAssets.length : totalAssetsCount}
          </p>
        </div>

        {currentRole !== "employee" && (
          <>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">Available</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-emerald-700 mt-2">{availableCount}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-primary">Assigned</span>
                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-brand-primary mt-2">{assignedCount}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700">Repair / Other</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-amber-700 mt-2">{otherCount}</p>
            </div>
          </>
        )}
      </div>

      {/* Subtab Navigation & Filters Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Subtabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "inventory"
                  ? "bg-brand-primary text-brand-btn-text shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Asset Inventory
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "assignments"
                  ? "bg-brand-primary text-brand-btn-text shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Assignments & Returns
            </button>
            {currentRole !== "employee" && (
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "history"
                    ? "bg-brand-primary text-brand-btn-text shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Audit History
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, name, serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        {/* Dropdown Filters (Only for Inventory tab and non-employees) */}
        {activeTab === "inventory" && currentRole !== "employee" && (
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-bold focus:outline-none focus:border-brand-primary cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="UNDER_REPAIR">UNDER REPAIR</option>
                <option value="DAMAGED">DAMAGED</option>
                <option value="LOST">LOST</option>
                <option value="RETIRED">RETIRED</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-bold focus:outline-none focus:border-brand-primary cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="Laptop">Laptop</option>
                <option value="Monitor">Monitor</option>
                <option value="Mobile">Mobile</option>
                <option value="Accessory">Accessory</option>
                <option value="Furniture">Furniture</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <Skeleton className="h-6 w-36 rounded-xl" />
            <Skeleton className="h-6 w-24 rounded-xl" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-none">
              <Skeleton className="h-4 w-24 font-mono" />
              <div className="space-y-1.5 w-48">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24 font-mono" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-16 rounded-xl" />
            </div>
          ))}
        </div>
      ) : activeTab === "inventory" ? (
        /* ─── INVENTORY TABLE ─── */
        <TableContainer className="rounded-2xl border-none shadow-none">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Asset Code</TableHead>
                <TableHead>Name & Specs</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Serial No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                {currentRole !== "employee" && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </tr>
            </TableHeader>
            <TableBody>
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={currentRole === "employee" ? 6 : 7} className="py-12 text-center text-slate-400 font-semibold">
                      {currentRole === "employee"
                        ? "No assets currently assigned to you."
                        : 'No assets found matching criteria. Click "+ Add New Asset" to create one.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map((asset) => {
                    const fallbackAssign = assignments.find((a) => a.assetId === asset.assetId && !a.returnedDate);
                    const activeAssign = (asset.assignments && asset.assignments.length > 0 ? asset.assignments[0] : null) || fallbackAssign;
                    return (
                      <TableRow key={asset.assetId}>
                        {/* Asset Code */}
                        <TableCell className="font-mono font-bold text-slate-900">
                          {asset.assetCode}
                        </TableCell>

                        {/* Name & Specs */}
                        <TableCell>
                          <p className="font-bold text-slate-900 leading-snug">{asset.assetName}</p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {asset.brand || ""} {asset.model || ""}
                          </p>
                        </TableCell>

                        {/* Type */}
                        <TableCell className="font-semibold text-slate-700">
                          {asset.assetType}
                        </TableCell>

                        {/* Serial Number */}
                        <TableCell className="font-mono text-slate-600">
                          {asset.serialNumber || "-"}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {renderStatusBadge(asset.assetStatus)}
                        </TableCell>

                        {/* Assigned To */}
                        <TableCell className="font-semibold text-slate-800">
                          {(() => {
                            const emp = activeAssign?.userId ? employees.find((e) => Number(e.id) === activeAssign.userId) : null;
                            if (emp) {
                              return <span className="text-brand-primary font-bold">{emp.name}</span>;
                            }
                            if (activeAssign?.user) {
                              return (
                                <span className="text-brand-primary font-bold">
                                  {activeAssign.user.firstName} {activeAssign.user.lastName || ""}
                                </span>
                              );
                            }
                            return <span className="text-slate-400 italic font-medium">Unassigned</span>;
                          })()}
                        </TableCell>

                        {/* Actions */}
                        {currentRole !== "employee" && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {asset.assetStatus === "AVAILABLE" && (
                                <button
                                  onClick={() => {
                                    setAssetToAssign(asset);
                                    setIsAssignModalOpen(true);
                                  }}
                                  title="Assign to Employee"
                                  className="px-2.5 py-1 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Assign</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setAssetToEdit(asset);
                                  setIsCreateModalOpen(true);
                                }}
                                title="Edit Asset"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAsset(asset.assetId, asset.assetName)}
                                title="Delete Asset"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
      ) : activeTab === "assignments" ? (
        /* ─── ASSIGNMENTS & RETURNS TABLE ─── */
        <TableContainer className="rounded-2xl border-none shadow-none">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Asset Info</TableHead>
                <TableHead>Assigned Employee</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Expected Return</TableHead>
                <TableHead>Returned Date</TableHead>
                {currentRole !== "employee" && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </tr>
            </TableHeader>
            <TableBody>
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={currentRole === "employee" ? 5 : 6} className="py-12 text-center text-slate-400 font-semibold">
                      No assignment records found.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((assign) => (
                    <TableRow key={assign.assignmentId}>
                      {/* Asset Info */}
                      <TableCell>
                        {(() => {
                          const ast = assign.assetId ? assets.find((a) => a.assetId === assign.assetId) : null;
                          const name = ast?.assetName || assign.asset?.assetName || "Asset";
                          const code = ast?.assetCode || assign.asset?.assetCode || "-";
                          return (
                            <>
                              <p className="font-bold text-slate-900">{name}</p>
                              <p className="text-[11px] text-slate-500 font-mono">{code}</p>
                            </>
                          );
                        })()}
                      </TableCell>

                      {/* Employee */}
                      <TableCell className="font-bold text-brand-primary">
                        {(() => {
                          const emp = assign.userId ? employees.find((e) => Number(e.id) === assign.userId) : null;
                          if (emp) return emp.name;
                          if (assign.user) return `${assign.user.firstName} ${assign.user.lastName || ""}`;
                          return "Unassigned";
                        })()}
                      </TableCell>

                      {/* Assigned Date */}
                      <TableCell className="font-semibold text-slate-700">
                        {formatDate(assign.assignedDate)}
                      </TableCell>

                      {/* Expected Return */}
                      <TableCell className="font-semibold text-slate-700">
                        {formatDate(assign.expectedReturnDate)}
                      </TableCell>

                      {/* Returned Date */}
                      <TableCell>
                        {assign.returnedDate ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {formatDate(assign.returnedDate)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Active Assignment
                          </span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      {currentRole !== "employee" && (
                        <TableCell className="text-right">
                          {!assign.returnedDate && (
                            <button
                              onClick={() => handleReturnAsset(assign)}
                              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ml-auto shadow-2xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Return Asset</span>
                            </button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
      ) : (
        /* ─── AUDIT HISTORY TABLE ─── */
        <TableContainer className="rounded-2xl border-none shadow-none">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Asset</TableHead>
                <TableHead>Action Event</TableHead>
                <TableHead>Status Change</TableHead>
                <TableHead>Action Date</TableHead>
                <TableHead>Remarks</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                      No history audit logs available.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <TableRow key={item.historyId}>
                      <TableCell className="font-extrabold text-slate-900">
                        {(() => {
                          const ast = item.assetId ? assets.find((a) => a.assetId === item.assetId) : null;
                          return ast?.assetName || item.asset?.assetName || `Asset #${item.assetId}`;
                        })()}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-brand-primary uppercase text-[11px] bg-brand-primary-light px-2.5 py-0.5 rounded-md">
                          {item.action}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">
                        {item.newStatus ? (
                          <span>Changed to <span className="font-bold text-slate-900">{item.newStatus}</span></span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-slate-500 font-semibold">
                        {formatDate(item.actionDate || item.createdAt)}
                      </TableCell>
                      <TableCell className="text-slate-600 italic">
                        {item.remarks || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
      )}

      {/* Modals */}
      <CreateAssetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
        assetToEdit={assetToEdit}
        existingAssets={assets}
      />

      <AssignAssetModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={fetchData}
        assetToAssign={assetToAssign}
      />

      <ReturnAssetModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSuccess={fetchData}
        assignmentToReturn={assignmentToReturn}
      />
    </div>
  );
};
