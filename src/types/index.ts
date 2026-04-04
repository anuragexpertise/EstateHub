import type { LucideIcon } from "lucide-react";

export type UserRole = 'Admin' | 'Apartment' | 'Contractor' | 'Security';

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarId: string;
  details?: {
    unit?: string;
    sqft?: number;
    service?: string;
    shift?: string;
  };
};

export type Payment = {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  date: Date;
  status: 'Paid' | 'Due' | 'Overdue' | 'Pending Verification' | 'Rejected';
  description: string;
};

export type Expense = {
  id: string;
  accountId: string;
  userId?: string;
  amount: number;
  date: Date;
  status: 'Pending' | 'Paid' | 'Rejected';
  description: string;
};

export type Event = {
  id: string;
  name: string;
  description: string;
  dateTime: Date;
  audience: UserRole[];
  status: 'Draft' | 'Sent' | 'Rejected';
};

export type Transaction = {
  id: string;
  date: Date;
  amount: number;
  method: 'Card' | 'Online' | 'Cash' | 'Bank Transfer';
  user: string;
};

export type Shift = {
    id: string;
    personnel: string;
    shift: string;
    status: 'Active' | 'Inactive';
}

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
};

export type Account = {
  id: string;
  name: string;
  description?: string;
  type: 'Debit' | 'Credit';
  subAccountOf?: UserRole[];
  balanceForward: number;
  depreciationRate?: number;
};
