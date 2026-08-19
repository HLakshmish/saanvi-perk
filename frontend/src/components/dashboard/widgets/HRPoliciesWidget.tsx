"use client";

import React from "react";
import { FileText, ChevronRight, Shield, BookOpen, Users } from "lucide-react";

const policies = [
  { id: "1", title: "Leave Policy", icon: BookOpen, updated: "Updated: Jul 2026" },
  { id: "2", title: "Code of Conduct", icon: Shield, updated: "Updated: Jun 2026" },
  { id: "3", title: "Remote Work Policy", icon: Users, updated: "Updated: May 2026" },
];

export const HRPoliciesWidget: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-brand-primary/15 shadow-2xs flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-brand-primary" />
        </div>
        <h3 className="font-bold text-brand-primary text-sm">HR Policies</h3>
      </div>

      <div className="space-y-2.5">
        {policies.map((policy) => {
          const Icon = policy.icon;
          return (
            <button
              key={policy.id}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all duration-200 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 group-hover:bg-brand-primary group-hover:text-brand-btn-text transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 group-hover:text-brand-primary truncate transition-colors">{policy.title}</p>
                <p className="text-[10px] text-slate-400 font-medium">{policy.updated}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
