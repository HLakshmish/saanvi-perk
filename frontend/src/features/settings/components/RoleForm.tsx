import React, { useState, useEffect } from "react";
import { ChevronLeft, Loader2, Check } from "lucide-react";
import { RoleItem } from "../types/settings.types";
import { fetchPermissions, createRoleApi, updateRoleApi } from "../api/settings.api";

interface RoleFormProps {
  initialRole?: RoleItem | null;
  onBackToRolesList: () => void;
  onSaveSuccess: (updatedRole: RoleItem) => void;
}

interface PermissionObject {
  permissionId: number;
  permissionName: string;
  permissionCode: string;
  module: string;
  description?: string;
}

export const RoleForm: React.FC<RoleFormProps> = ({
  initialRole,
  onBackToRolesList,
  onSaveSuccess,
}) => {
  const isEditMode = !!initialRole;

  const [roleCode, setRoleCode] = useState(initialRole?.code || "");
  const [roleName, setRoleName] = useState(initialRole?.name || "");
  const [remarks, setRemarks] = useState(initialRole?.remarks || "");
  const [permissionsList, setPermissionsList] = useState<PermissionObject[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadPermissions = async () => {
      setIsLoadingPermissions(true);
      const res = await fetchPermissions();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setPermissionsList(res.data);
        if (initialRole && initialRole.permissions) {
          const preselected = initialRole.permissions.map((p) => p.id);
          setSelectedPermissionIds(preselected);
        } else {
          // Select default permission IDs
          setSelectedPermissionIds(res.data.map((p: PermissionObject) => p.permissionId));
        }
      } else {
        // Fallback default permission objects if backend permissions table is empty
        const defaultPerms: PermissionObject[] = [
          { permissionId: 1, permissionName: "View Company Details", permissionCode: "VIEW_COMPANY", module: "Company Management" },
          { permissionId: 2, permissionName: "Manage Company Details", permissionCode: "MANAGE_COMPANY", module: "Company Management" },
          { permissionId: 3, permissionName: "View Departments", permissionCode: "VIEW_DEPARTMENTS", module: "Department Management" },
          { permissionId: 4, permissionName: "Manage Departments", permissionCode: "MANAGE_DEPARTMENTS", module: "Department Management" },
          { permissionId: 5, permissionName: "View Roles", permissionCode: "VIEW_ROLES", module: "Role Management" },
          { permissionId: 6, permissionName: "Manage Roles", permissionCode: "MANAGE_ROLES", module: "Role Management" },
          { permissionId: 7, permissionName: "View Users", permissionCode: "VIEW_USERS", module: "User Management" },
          { permissionId: 8, permissionName: "Manage Users", permissionCode: "MANAGE_USERS", module: "User Management" },
        ];
        setPermissionsList(defaultPerms);
        setSelectedPermissionIds([1, 2, 3, 4, 5, 6, 7, 8]);
      }
      setIsLoadingPermissions(false);
    };

    loadPermissions();
  }, [initialRole]);

  const togglePermission = (id: number) => {
    if (selectedPermissionIds.includes(id)) {
      setSelectedPermissionIds(selectedPermissionIds.filter((pId) => pId !== id));
    } else {
      setSelectedPermissionIds([...selectedPermissionIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleCode.trim() || !roleName.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    const payload = {
      roleName,
      roleCode,
      description: remarks,
      status: true,
      permissionIds: selectedPermissionIds,
    };

    let resultRole: RoleItem;

    if (isEditMode && initialRole) {
      const res = await updateRoleApi(initialRole.id, payload);
      if (res.success && res.data) {
        resultRole = {
          id: res.data.roleId || initialRole.id,
          code: res.data.roleCode || roleCode,
          name: res.data.roleName || roleName,
          remarks: res.data.description || remarks,
          permissions: selectedPermissionIds.map((id) => {
            const found = permissionsList.find((p) => p.permissionId === id);
            return {
              id,
              code: found?.permissionCode || "PERM",
              name: found?.permissionName || "Permission",
              assigned: true,
            };
          }),
        };
      } else {
        resultRole = {
          ...initialRole,
          code: roleCode,
          name: roleName,
          remarks,
        };
      }
    } else {
      const res = await createRoleApi(payload);
      if (res.success && res.data) {
        resultRole = {
          id: res.data.roleId || String(Date.now()),
          code: res.data.roleCode || roleCode,
          name: res.data.roleName || roleName,
          remarks: res.data.description || remarks,
          permissions: selectedPermissionIds.map((id) => {
            const found = permissionsList.find((p) => p.permissionId === id);
            return {
              id,
              code: found?.permissionCode || "PERM",
              name: found?.permissionName || "Permission",
              assigned: true,
            };
          }),
        };
      } else {
        setErrorMsg(res.error || "Failed to create role");
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
    onSaveSuccess(resultRole);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Row */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-4">
        <button
          onClick={onBackToRolesList}
          className="p-1 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-slate-100 transition-colors cursor-pointer"
          title="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-brand-primary tracking-tight">
          {isEditMode ? "Edit Role" : "New Role"}
        </h2>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold text-xs">
          {errorMsg}
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
        {/* Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Role Code
            </label>
            <input
              type="text"
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
              placeholder="e.g. TEST1"
              required
              className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs transition-all"
            />
          </div>

          {/* Role Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Role Name
            </label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Testing role"
              required
              className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs transition-all"
            />
          </div>

          {/* Remarks */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="this is for testing description"
              className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs transition-all"
            />
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* PERMISSIONS Selector */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Permissions
          </h3>

          {isLoadingPermissions ? (
            <div className="p-6 text-center text-xs font-bold text-brand-primary flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
              <span>Loading Backend Permissions...</span>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/30 max-h-72 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-700 font-semibold">
                {permissionsList.map((perm) => {
                  const isChecked = selectedPermissionIds.includes(perm.permissionId);
                  return (
                    <label
                      key={perm.permissionId}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary shadow-2xs"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(perm.permissionId)}
                        className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20 cursor-pointer mt-0.5"
                      />
                      <div>
                        <span className="block font-bold text-slate-900">{perm.permissionName}</span>
                        <span className="block text-[10px] font-mono text-brand-primary mt-0.5">{perm.permissionCode}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onBackToRolesList}
            className="px-5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold text-xs rounded-xl shadow-2xs transition-all hover:shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-btn-text" />}
            <span>Submit</span>
          </button>
        </div>
      </form>
    </div>
  );
};
