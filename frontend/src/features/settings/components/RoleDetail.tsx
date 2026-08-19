import React, { useState, useEffect } from "react";
import { Edit3, Check, ChevronLeft, Loader2 } from "lucide-react";
import { RoleItem } from "../types/settings.types";
import { fetchRoleById } from "../api/settings.api";

interface RoleDetailProps {
  role: RoleItem;
  onBackToRolesList: () => void;
  onEditRole: (role: RoleItem) => void;
}

export const RoleDetail: React.FC<RoleDetailProps> = ({
  role,
  onBackToRolesList,
  onEditRole,
}) => {
  const [currentRole, setCurrentRole] = useState<RoleItem>(role);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadRoleData = async () => {
      if (!role.id) return;
      setIsLoading(true);
      const res = await fetchRoleById(role.id);
      if (res.success && res.data) {
        const d = res.data;
        const mappedPermissions = d.rolePermissions
          ? d.rolePermissions.map((rp: any) => ({
              id: rp.permissionId || rp.id,
              code: rp.permission?.permissionCode || "PERM",
              name: rp.permission?.permissionName || "Permission",
              assigned: true,
            }))
          : role.permissions;

        setCurrentRole({
          id: d.roleId || role.id,
          code: d.roleCode || role.code,
          name: d.roleName || role.name,
          remarks: d.description || role.remarks,
          permissions: mappedPermissions,
        });
      }
      setIsLoading(false);
    };

    loadRoleData();
  }, [role.id]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Row with Breadcrumb & Edit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToRolesList}
            className="p-1 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back to Roles List"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-brand-primary tracking-tight">
            {currentRole.name}
          </h2>
        </div>

        {/* Edit Details Action Link */}
        <button
          onClick={() => onEditRole(currentRole)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-[#012d28] transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Details</span>
        </button>
      </div>

      {/* Role Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6 relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20 rounded-2xl">
            <div className="flex items-center gap-2 text-brand-primary font-bold text-xs">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading Role Details...</span>
            </div>
          </div>
        )}

        {/* Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Role Code</span>
            <p className="font-mono font-bold text-slate-800 text-sm">{currentRole.code}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Role Name</span>
            <p className="font-bold text-slate-800 text-sm">{currentRole.name}</p>
          </div>

          <div className="space-y-1 md:col-span-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Remarks</span>
            <p className="font-medium text-slate-700">{currentRole.remarks || "-"}</p>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* PERMISSIONS Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Assigned Permissions ({currentRole.permissions?.length || 0})
          </h3>

          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/30 max-h-72 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3.5 gap-x-6 text-xs text-slate-700 font-semibold">
              {currentRole.permissions && currentRole.permissions.length > 0 ? (
                currentRole.permissions.map((perm) => (
                  <div key={perm.id} className="flex items-center gap-2.5 p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3] text-brand-primary" />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-900">{perm.name}</span>
                      <span className="block text-[10px] font-mono text-brand-primary">{perm.code}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-4 text-center text-slate-400 font-medium">
                  No explicit permissions assigned to this role.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
