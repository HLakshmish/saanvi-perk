import React, { useState } from "react";
import { CheckCircle2, Clock, XCircle, MinusCircle, Search } from "lucide-react";
import { LeaveRequest } from "../types/leaves.types";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface LeavesRequestTabProps {
  requests: LeaveRequest[];
  isAdminOrSuperAdmin?: boolean;
  onStatusUpdate?: (id: string, status: "APPROVED" | "REJECTED") => Promise<boolean>;
  onRowClick?: (id: string) => void;
}

export const LeavesRequestTab: React.FC<LeavesRequestTabProps> = ({
  requests,
  isAdminOrSuperAdmin = false,
  onStatusUpdate,
  onRowClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequests = requests.filter(
    (r) =>
      r.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requestDate.includes(searchTerm)
  );

  const getStatusIcon = (status: "Approved" | "Pending" | "Rejected" | "Cancelled") => {
    switch (status) {
      case "Approved":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />;
      case "Pending":
        return <Clock className="w-4 h-4 text-amber-500 fill-amber-100" />;
      case "Rejected":
        return <XCircle className="w-4 h-4 text-rose-500 fill-rose-100" />;
      case "Cancelled":
        return <MinusCircle className="w-4 h-4 text-slate-400 fill-slate-100" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400 fill-slate-100" />;
    }
  };

  const getStatusStyles = (status: "Approved" | "Pending" | "Rejected" | "Cancelled") => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Cancelled":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Status
          </h2>
          <p className="text-xs text-slate-500 font-semibold">
            Track leave request approvals and status history.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search table items..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs font-medium"
          />
        </div>
      </div>

      {/* Requests Table Container */}
      <TableContainer>
        <Table className="min-w-[750px]">
          <TableHeader>
            <tr>
              <TableHead>Date</TableHead>
              <TableHead>Leave Name</TableHead>
              <TableHead>From-To</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((req) => (
              <TableRow
                key={req.id}
                onClick={() => onRowClick?.(req.id)}
              >
                <TableCell className="font-semibold text-slate-900">{req.requestDate}</TableCell>
                <TableCell className="text-slate-700 font-semibold">{req.leaveType}</TableCell>
                <TableCell className="font-mono text-xs text-slate-600">{req.fromDate} to {req.toDate}</TableCell>
                <TableCell className="font-bold text-slate-900">{req.days}</TableCell>
                <TableCell className="text-slate-600 truncate max-w-[220px]" title={req.remarks}>{req.remarks}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    {getStatusIcon(req.status)}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {isAdminOrSuperAdmin && req.status === "Pending" && onStatusUpdate ? (
                    <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onStatusUpdate(req.id, "APPROVED")}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-2xs cursor-pointer transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onStatusUpdate(req.id, "REJECTED")}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold shadow-2xs cursor-pointer transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyles(req.status)}`}>
                      {req.status}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                  No matching leave requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 text-xs text-slate-500 font-semibold">
          <span>Showing 1 to {filteredRequests.length} of {filteredRequests.length} entries</span>
          <div className="flex items-center gap-1.5">
            <span>Show</span>
            <select className="border border-slate-300 rounded-lg px-2 py-1 bg-white text-xs font-bold text-slate-800 focus:outline-none cursor-pointer">
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries</span>
          </div>
        </div>
      </TableContainer>
    </div>
  );
};
