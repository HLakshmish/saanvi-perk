"use client";

import React from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface RequestDetailsProps {
  requestId: string;
  onBack: () => void;
}

export const RequestDetails: React.FC<RequestDetailsProps> = ({
  requestId,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      {/* Back Button and Section Title */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-gray-200 text-brand-primary"
            title="Back to History"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-bold text-brand-primary">
            Pending Approval Details - Karthik-{requestId}
          </h2>
        </div>

        {/* 2-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Request Details */}
          <div className="border border-gray-200 rounded-xl p-5 sm:p-6 bg-white space-y-6">
            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider border-b border-gray-100 pb-2">
              Request Details
            </h3>

            {/* Attendance Request Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-brand-primary">
                Attendance Request Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-medium">Code</span>
                  <p className="text-gray-900 font-semibold mt-1">ST00095</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Name</span>
                  <p className="text-gray-900 font-semibold mt-1">Karthik</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Department</span>
                  <p className="text-gray-900 font-semibold mt-1">
                    Development and Production
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Designation</span>
                  <p className="text-gray-900 font-semibold mt-1">
                    Junior Software Engineer
                  </p>
                </div>
              </div>
            </div>

            {/* General Request Details */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-800">
                Request Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 text-xs">
                <div>
                  <span className="text-gray-400 font-medium">Shift Date</span>
                  <p className="text-gray-900 font-semibold mt-1">2026-07-21</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Remarks</span>
                  <p className="text-gray-900 font-semibold mt-1">
                    Technical issues in app
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Check-In</span>
                  <p className="text-gray-900 font-semibold mt-1">
                    09:25:10 am
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Check-Out</span>
                  <p className="text-gray-900 font-semibold mt-1">
                    09:25:10 am
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">
                    User Check-In
                  </span>
                  <p className="text-gray-900 font-semibold mt-1">
                    09:25:00 am
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">
                    User Check-Out
                  </span>
                  <p className="text-gray-900 font-semibold mt-1">
                    06:30:00 pm
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Approval Timeline */}
          <div className="border border-gray-200 rounded-xl p-5 sm:p-6 bg-white space-y-6">
            {/* Timeline Item */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-bold text-gray-800">
                    Stage 1: CHINMAYA BAIRY
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-semibold">
                  23 Jul 2026
                </span>
              </div>

              {/* Comments box */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-1.5">
                <span className="text-xs text-gray-400 font-semibold block">
                  Comments
                </span>
                <p className="text-sm font-semibold text-gray-700">-</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
