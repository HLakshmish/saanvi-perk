export type LeaveTab = "summary" | "request" | "holiday" | "calendar";

export interface LeaveBalance {
  accumulated: number;
  availed: number;
  balance: number;
  compOff: number;
  earnedLeave: number;
  lossOfPay: number;
  sickCasualLeave: number;
}

export interface LeaveRequest {
  id: string;
  requestDate: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  remarks: string;
  status: "Approved" | "Pending" | "Rejected" | "Cancelled";
  employeeName?: string;
  rawLeaveType?: string;
}

export interface Holiday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  numberOfHolidays: number;
  type: string;
}

export interface ApplyLeaveInput {
  leaveTypeId: number;
  isHalfDay: boolean;
  fromDate: string;
  toDate: string;
  reason: string;
  userId?: number;
}

export interface CompOffInput {
  compensateDate: string;
  reason: string;
}
