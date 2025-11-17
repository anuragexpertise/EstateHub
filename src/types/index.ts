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
  amount: number;
  date: Date;
  status: 'Paid' | 'Due' | 'Overdue' | 'Pending Verification';
  description: string;
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
