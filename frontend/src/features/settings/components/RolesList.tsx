import React, { useState, useEffect } from "react";
import { Plus, MinusCircle, ChevronRight, Loader2 } from "lucide-react";
import { RoleItem } from "../types/settings.types";
import { fetchRoles, deleteRoleApi } from "../api/settings.api";

interface RolesListProps {
  onAddNewRole: () => void;
  onViewRole: (role: RoleItem) => void;
  rolesList: RoleItem[];
  setRolesList: React.Dispatch<React.SetStateAction<RoleItem[]>>;
}

export const INITIAL_ROLES: RoleItem[] = [
  {
    id: "1",
    code: "ADM",
    name: "Administrator",
    remarks: "",
    permissions: [
      { id: 1, code: "VIEW_ORG", name: "View Organisation", assigned: true },
      { id: 2, code: "CREATE_ORG", name: "Create Organisation", assigned: true },
      { id: 3, code: "UPDATE_ORG", name: "Update Organisation", assigned: true },
      { id: 4, code: "DELETE_ORG", name: "Delete Organisation", assigned: true },
      { id: 5, code: "VIEW_LOC", name: "View Location", assigned: true },
      { id: 6, code: "CREATE_LOC", name: "Create Location", assigned: true },
      { id: 7, code: "UPDATE_LOC", name: "Update Location", assigned: true },
      { id: 8, code: "DELETE_LOC", name: "Delete Location", assigned: true },
      { id: 9, code: "VIEW_DEPT", name: "View Department", assigned: true },
      { id: 10, code: "CREATE_DEPT", name: "Create Department", assigned: true },
      { id: 11, code: "UPDATE_DEPT", name: "Update Department", assigned: true },
      { id: 12, code: "DELETE_DEPT", name: "Delete Department", assigned: true },
      { id: 13, code: "VIEW_DESG", name: "View Designation", assigned: true },
      { id: 14, code: "CREATE_DESG", name: "Create Designation", assigned: true },
      { id: 15, code: "UPDATE_DESG", name: "Update Designation", assigned: true },
    ],
  },
  {
    id: "2",
    code: "EMP",
    name: "Employee",
    remarks: "",
    permissions: [
      { id: 1, code: "VIEW_ORG", name: "View Organisation", assigned: true },
      { id: 5, code: "VIEW_LOC", name: "View Location", assigned: true },
      { id: 9, code: "VIEW_DEPT", name: "View Department", assigned: true },
    ],
  },
  {
    id: "3",
    code: "ETX",
    name: "Edit Tax",
    remarks: "",
    permissions: [
      { id: 1, code: "VIEW_ORG", name: "View Organisation", assigned: true },
    ],
  },
  {
    id: "4",
    code: "MGR",
    name: "Manager",
    remarks: "",
    permissions: [
      { id: 1, code: "VIEW_ORG", name: "View Organisation", assigned: true },
      { id: 5, code: "VIEW_LOC", name: "View Location", assigned: true },
      { id: 9, code: "VIEW_DEPT", name: "View Department", assigned: true },
      { id: 10, code: "CREATE_DEPT", name: "Create Department", assigned: true },
    ],
  },
];

export const RolesList: React.FC<RolesListProps> = ({
  onAddNewRole,
  onViewRole,
  rolesList,
  setRolesList,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEntries, setShowEntries] = useState(5);

  useEffect(() => {
    const loadBackendRoles = async () => {
      setIsLoading(true);
      const res = await fetchRoles();
      if (res.success && res.data && res.data.length > 0) {
        const mapped: RoleItem[] = res.data.map((r: any, idx: number) => ({
          id: r.roleId || r.id || String(idx + 1),
          code: r.roleCode || `ROLE_${idx}`,
          name: r.roleName || "Custom Role",
          remarks: r.description || "",
          permissions: r.rolePermissions
            ? r.rolePermissions.map((rp: any) => ({
                id: rp.permissionId || rp.id,
                code: rp.permission?.permissionCode || "PERM",
                name: rp.permission?.permissionName || "Permission",
                assigned: true,
              }))
            : INITIAL_ROLES[0].permissions,
        }));
        setRolesList(mapped);
      }
      setIsLoading(false);
    };

    loadBackendRoles();
  }, []);

  const handleDeleteRole = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this role?")) {
      setRolesList((prev) => prev.filter((r) => r.id !== id));
      await deleteRoleApi(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Roles
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Manage custom user roles and permissions across your organization.
          </p>
        </div>

        {/* Add New Role Button */}
        <button
          onClick={onAddNewRole}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Role</span>
        </button>
      </div>

      {/* Roles Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading Roles...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse text-xs sm:text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-6 w-20">S No.</th>
                <th className="py-3.5 px-6">Role Code</th>
                <th className="py-3.5 px-6">Role Name</th>
                <th className="py-3.5 px-6">Remarks</th>
                <th className="py-3.5 px-6 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rolesList.slice(0, showEntries).map((role, index) => (
                <tr
                  key={role.id}
                  onClick={() => onViewRole(role)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6 font-bold text-slate-900">{index + 1}</td>
                  <td className="py-4 px-6 font-mono font-bold text-slate-800">{role.code}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">{role.name}</td>
                  <td className="py-4 px-6 text-slate-500 font-medium">{role.remarks || "-"}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={(e) => handleDeleteRole(e, role.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors p-1 rounded-full"
                        title="Delete Role"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </td>
                </tr>
              ))}
              {rolesList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                    No roles found. Click "+ Add New Role" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 text-xs text-slate-500 font-semibold">
          <span>Showing 1 to {Math.min(rolesList.length, showEntries)} of {rolesList.length} entries</span>
          <div className="flex items-center gap-1.5">
            <span>Show</span>
            <select
              value={showEntries}
              onChange={(e) => setShowEntries(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-2 py-1 bg-white text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <span>entries</span>
          </div>
        </div>
      </div>
    </div>
  );
};
