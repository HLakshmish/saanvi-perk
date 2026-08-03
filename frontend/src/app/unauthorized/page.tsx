"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-sm text-gray-600 mb-6">
          You do not have permission to view this route. Please contact your system administrator if you believe this is an error.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/admin/dashboard"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Admin Dashboard
          </Link>

          <Link
            href="/login"
            className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg text-sm transition-colors"
          >
            Switch User Login
          </Link>
        </div>
      </div>
    </div>
  );
}
