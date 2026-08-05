import React, { useState } from "react";
import { LeaveTab, LeaveRequest, ApplyLeaveInput, CompOffInput } from "../types/leaves.types";
import { LeavesSummaryTab } from "./LeavesSummaryTab";
import { LeavesRequestTab } from "./LeavesRequestTab";
import { LeavesHolidayTab } from "./LeavesHolidayTab";
import { RequestCompOffModal } from "./RequestCompOffModal";
import { ApplyLeaveModal } from "./ApplyLeaveModal";

const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: "req_01",
    requestDate: "06-07-2026",
    leaveType: "Sick Leave / Casual Leave",
    fromDate: "06-07-2026",
    toDate: "06-07-2026",
    days: 1,
    remarks: "I'm feeling unwell and requesting sick leave.",
    status: "Approved",
  },
  {
    id: "req_02",
    requestDate: "27-05-2026",
    leaveType: "Sick Leave / Casual Leave",
    fromDate: "27-05-2026",
    toDate: "27-05-2026",
    days: 1,
    remarks: "Feeling unwell and requesting sick leave.",
    status: "Approved",
  },
  {
    id: "req_03",
    requestDate: "26-05-2026",
    leaveType: "Sick Leave / Casual Leave",
    fromDate: "15-04-2026",
    toDate: "15-04-2026",
    days: 1,
    remarks: "Personal Reason",
    status: "Approved",
  },
];

export const LeavesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeaveTab>("summary");
  const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false);
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS);

  const handleApplyLeaveSubmit = (data: ApplyLeaveInput) => {
    const newReq: LeaveRequest = {
      id: `req_${Date.now()}`,
      requestDate: new Date().toISOString().slice(0, 10).split("-").reverse().join("-"),
      leaveType: data.leaveType,
      fromDate: data.fromDate,
      toDate: data.toDate,
      days: data.isHalfDay ? 0.5 : 1,
      remarks: data.reason,
      status: "Approved",
    };
    setRequests([newReq, ...requests]);
  };

  const handleCompOffSubmit = (data: CompOffInput) => {
    const newReq: LeaveRequest = {
      id: `req_${Date.now()}`,
      requestDate: new Date().toISOString().slice(0, 10).split("-").reverse().join("-"),
      leaveType: "Comp-Off Balance",
      fromDate: data.compensateDate,
      toDate: data.compensateDate,
      days: 1,
      remarks: data.reason,
      status: "Approved",
    };
    setRequests([newReq, ...requests]);
  };

  return (
    <div className="w-full space-y-6">
      {/* Upper Navigation Header Bar: Summary | Request | Holiday */}
      <div className="flex justify-end border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "summary"
                ? "bg-white text-indigo-600 shadow-2xs border border-slate-200/40"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("request")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "request"
                ? "bg-white text-indigo-600 shadow-2xs border border-slate-200/40"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Request
          </button>
          <button
            onClick={() => setActiveTab("holiday")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "holiday"
                ? "bg-white text-indigo-600 shadow-2xs border border-slate-200/40"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Holiday
          </button>
        </div>
      </div>

      {/* Render Active Tab Content */}
      {activeTab === "summary" && (
        <LeavesSummaryTab
          onOpenCompOffModal={() => setIsCompOffModalOpen(true)}
          onOpenApplyLeaveModal={() => setIsApplyLeaveModalOpen(true)}
          requests={requests}
        />
      )}

      {activeTab === "request" && <LeavesRequestTab requests={requests} />}

      {activeTab === "holiday" && <LeavesHolidayTab />}

      {/* Request Comp-Off Modal */}
      <RequestCompOffModal
        isOpen={isCompOffModalOpen}
        onClose={() => setIsCompOffModalOpen(false)}
        onSubmit={handleCompOffSubmit}
      />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyLeaveModalOpen}
        onClose={() => setIsApplyLeaveModalOpen(false)}
        onSubmit={handleApplyLeaveSubmit}
      />
    </div>
  );
};
