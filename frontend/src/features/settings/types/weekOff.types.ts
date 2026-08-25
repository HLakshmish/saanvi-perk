export interface WeekOffRuleInput {
  frequency: "Every" | "First" | "Second" | "Third" | "Fourth" | "Fifth";
  dayOfWeek: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  duration: "All day" | "First half" | "Second half";
}

export interface WeekOffRecord {
  weekOffId: number;
  companyId: number;
  code: string;
  name: string;
  createdBy?: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
  rules: Array<{
    ruleId?: number;
    weekOffId?: number;
    frequency: string;
    dayOfWeek: string;
    duration: string;
  }>;
}

export interface WeekOffAssignRecord {
  weekOffAssignId: number;
  companyId: number;
  userId: number;
  weekOffId: number;
  startDate: string;
  endDate?: string | null;
  status: boolean;
  user?: {
    firstName: string;
    lastName?: string;
    employeeCode?: string;
  };
  weekOff?: WeekOffRecord;
}

export interface CreateWeekOffInput {
  code: string;
  name: string;
  rules: WeekOffRuleInput[];
}

export interface AssignWeekOffInput {
  weekOffId: number;
  userIds: number[];
  startDate: string;
  endDate?: string | null;
}
