import React, { useState } from "react";
import {
  Megaphone,
  FileCheck,
  Receipt,
  Users,
  ListPlus,
  FileText,
  Smartphone,
  CalendarClock,
  UserCheck,
  Link,
  ShieldCheck,
  Trash2,
  Lock,
  CloudUpload,
} from "lucide-react";
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
      id: "news",
      title: "NEWS / Announcement",
      description: "Share updates, NEWS and announcements across Organization.",
      icon: Megaphone,
    },
    {
      id: "approval-rules",
      title: "Approval Rules",
      description: "Define approval workflows for attendance, reimbursement, etc.",
      icon: FileCheck,
    },
    {
      id: "reimbursement-policy",
      title: "Reimbursement Policy",
      description: "Create reimbursement policies with amount limits, required fields.",
      icon: Receipt,
    },
    {
      id: "teams",
      title: "Teams",
      description: "Create and edit teams in your Organization.",
      icon: Users,
    },
    {
      id: "additional-fields",
      title: "Additional Fields",
      description: "Add other required fields related to Employees.",
      icon: ListPlus,
    },
    {
      id: "tax-profiles",
      title: "Tax Profiles*",
      description: "Set up your Organisation's profile for ESI, PF, TDS and PT.",
      icon: FileText,
    },
    {
      id: "app-registration",
      title: "App Registration",
      description: "Register mobile app on employees' mobiles or on attendance device and configure settings.",
      icon: Smartphone,
    },
    {
      id: "schedule-tasks",
      title: "Schedule Tasks",
      description: "Schedule your reports and Time card processes.",
      icon: CalendarClock,
    },
    {
      id: "face-enrolment",
      title: "Face Enrolment",
      description: "Upload images of Employees for facial recognition.",
      icon: UserCheck,
    },
    {
      id: "quick-links",
      title: "Quick Links",
      description: "Add links to pages that your employees can quickly access from their Dashboard.",
      icon: Link,
    },
    {
      id: "user-roles",
      title: "User Roles",
      description: "Create custom roles and add permissions.",
      icon: ShieldCheck,
      highlight: true,
    },
    {
      id: "delete-leave-accumulation",
      title: "Delete Leave Accumulation",
      description: "Delete Leave accumulation records in bulk.",
      icon: Trash2,
    },
    {
      id: "data-authorisation",
      title: "Data Authorisation",
      description: "Set Restrictions on users access to data.",
      icon: Lock,
    },
    {
      id: "hr-policy",
      title: "HR Policy",
      description: "Select document and upload HR Policies, manage their active / inactive states.",
      icon: CloudUpload,
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
            <h2 className="text-xl font-bold text-[#013e37] tracking-tight">
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
                    card.highlight ? "hover:border-[#013e37] ring-2 ring-[#013e37]/10" : "hover:border-[#013e37]/40"
                  }`}
                >
                  {/* Icon Box */}
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-all ${
                      card.highlight
                        ? "bg-[#013e37]/10 border-[#013e37]/20 text-[#013e37] group-hover:bg-[#013e37] group-hover:text-[#ffefb3]"
                        : "bg-slate-50 border-slate-200/80 text-[#013e37] group-hover:bg-[#013e37] group-hover:text-[#ffefb3] group-hover:border-[#013e37]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Card Description */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#013e37] transition-colors">
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
