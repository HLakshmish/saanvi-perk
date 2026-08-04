import React from "react";
import { Metadata } from "next";
import { CompanyRegistrationForm } from "@/features/company/components/company-registration-form";

export const metadata: Metadata = {
  title: "Company Setup & Onboarding | Saanvi Perk",
  description: "Register a new company and configure workplace settings in Saanvi Perk HRMS.",
};

export default function CompanySetupPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Company Registration & Setup
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete your organization profile, superadmin account, and attendance geo-fencing configuration.
        </p>
      </div>

      <CompanyRegistrationForm />
    </div>
  );
}
