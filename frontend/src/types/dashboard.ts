export type UserRole = 'owner' | 'superadmin' | 'admin' | 'employee';

export interface User {
  name: string;
  role: UserRole;
  companyName: string;
  avatarUrl?: string;
}

export interface Holiday {
  id: string;
  date: string;
  month: string;
  day: string;
  title: string;
}

export interface BirthdayPeer {
  id: string;
  name: string;
  date: string;
  wished?: boolean;
}

export interface EmployeeStats {
  headcount: number;
  atWork: number;
  onLeave: number;
  absent: number;
}
