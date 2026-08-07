import React from "react";
import {
  Building2,
  MapPin,
  Network,
  Briefcase,
  Calendar,
} from "lucide-react";

interface OrganizationTabProps {
  onSelectDepartment?: () => void;
}

export const OrganizationTab: React.FC<OrganizationTabProps> = ({
  onSelectDepartment,
}) => {
  const organizationCards = [
    {
      id: "org",
      title: "Organization",
      description: "Enter the Organizations' Name(s) & Code.",
      icon: Building2,
    },
    {
      id: "location",
      title: "Location",
      description: "Add multiple locations & manage details.",
      icon: MapPin,
    },
    {
      id: "department",
      title: "Department",
      description: "Add Departments & manage details.",
      icon: Network,
    },
    {
      id: "designation",
      title: "Designation",
      description: "Add and Manage Designations of your Organization.",
      icon: Briefcase,
    },
    {
      id: "calendar",
      title: "Calendar",
      description: "Create custom office calendars.",
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Organization
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Set up business profile with locations, addresses, branding and other configurations.
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {organizationCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={card.id === "department" ? onSelectDepartment : undefined}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex items-start gap-4"
            >
              {/* Circular Icon Box */}
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 shrink-0 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                <Icon className="w-5 h-5" />
              </div>

              {/* Text info */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
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
  );
};
