import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { RoleItem } from "../types/settings.types";
import { RolesList, INITIAL_ROLES } from "./RolesList";
import { RoleDetail } from "./RoleDetail";
import { RoleForm } from "./RoleForm";

export const OthersTab: React.FC = () => {
  const [othersViewMode, setOthersViewMode] = useState<
    "grid" | "roles-list" | "role-detail" | "role-form"
  >("grid");

  const [rolesList, setRolesList] = useState<RoleItem[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);

  const otherCards = [
    {
      id: "user-roles",
      title: "User Roles",
      description: "Create custom roles and add permissions.",
      icon: ShieldCheck,
      highlight: true,
    },
  ];

  const handleCardClick = (cardId: string) => {
    if (cardId === "user-roles") {
      setOthersViewMode("roles-list");
    }
  };

  const handleViewRoleDetail = (role: RoleItem) => {
    setSelectedRole(role);
    setOthersViewMode("role-detail");
  };

  const handleAddNewRole = () => {
    setSelectedRole(null);
    setOthersViewMode("role-form");
  };

  const handleEditRole = (role: RoleItem) => {
    setSelectedRole(role);
    setOthersViewMode("role-form");
  };

  const handleSaveRoleSuccess = (updatedRole: RoleItem) => {
    setRolesList((prev) => {
      const exists = prev.some((r) => r.id === updatedRole.id);
      if (exists) {
        return prev.map((r) => (r.id === updatedRole.id ? updatedRole : r));
      }
      return [...prev, updatedRole];
    });
    setOthersViewMode("roles-list");
  };

  return (
    <div className="space-y-6">
      {/* Sub View: Roles List */}
      {othersViewMode === "roles-list" && (
        <RolesList
          onAddNewRole={handleAddNewRole}
          onViewRole={handleViewRoleDetail}
          rolesList={rolesList}
          setRolesList={setRolesList}
        />
      )}

      {/* Sub View: Role Detail */}
      {othersViewMode === "role-detail" && selectedRole && (
        <RoleDetail
          role={selectedRole}
          onBackToRolesList={() => setOthersViewMode("roles-list")}
          onEditRole={handleEditRole}
        />
      )}

      {/* Sub View: Role Form (Add / Edit) */}
      {othersViewMode === "role-form" && (
        <RoleForm
          initialRole={selectedRole}
          onBackToRolesList={() => setOthersViewMode("roles-list")}
          onSaveSuccess={handleSaveRoleSuccess}
        />
      )}

      {/* Sub View: Grid of 14 Configuration Cards */}
      {othersViewMode === "grid" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div>
            <h2 className="text-xl font-bold text-brand-primary tracking-tight">
              Other
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              You can manage your company accounts info, activity, security options here.
            </p>
          </div>

          {/* Grid Cards Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {otherCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex items-start gap-4 ${
                    card.highlight ? "hover:border-brand-primary ring-2 ring-[#013e37]/10" : "hover:border-brand-primary/40"
                  }`}
                >
                  {/* Icon Box */}
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-all ${
                      card.highlight
                        ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-btn-text"
                        : "bg-slate-50 border-slate-200/80 text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-btn-text group-hover:border-brand-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Card Description */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
