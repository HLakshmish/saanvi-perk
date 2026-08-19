"use client";

import React from "react";
import { FileText, Shield, BookOpen, Users, Download } from "lucide-react";

const policies = [
  { id: "1", title: "Leave & Attendance Policy", icon: BookOpen, updated: "Updated Jul 2026" },
  { id: "2", title: "Code of Conduct & Ethics", icon: Shield, updated: "Updated Jun 2026" },
  { id: "3", title: "Remote Work & Hybrid Guidelines", icon: Users, updated: "Updated May 2026" },
];

export const HRPoliciesWidget: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold shadow-2xs">
              <FileText className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Company Policies</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Compliance</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {policies.map((policy) => {
            const Icon = policy.icon;
            return (
              <button
                key={policy.id}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 hover:border-brand-primary/40 hover:bg-brand-primary-light/30 transition-all duration-200 group text-left cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-btn-text flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-brand-primary truncate transition-colors">
                    {policy.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">{policy.updated}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-brand-primary/30 shrink-0">
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-primary transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
