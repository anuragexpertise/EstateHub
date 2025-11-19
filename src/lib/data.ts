import type { User, Payment, Transaction, Shift, UserRole, NavItem } from '@/types';
import {
  LayoutDashboard,
  UserPlus,
  Settings,
  CreditCard,
  ScanLine,
  Users,
  Brush,
  UserCog,
  Building2,
  Wrench,
  Shield,
} from 'lucide-react';

export const users: User[] = [
  { id: 'admin-01', name: 'Admin User', email: 'admin@estatehub.com', phone: '+1-202-555-0104', role: 'Admin', avatarId: 'avatar-admin' },
  { id: 'apt-101', name: 'John Doe', email: 'john.doe@email.com', phone: '+1-202-555-0162', role: 'Apartment', details: { unit: '101', sqft: 1200 }, avatarId: 'avatar-apartment' },
  { id: 'apt-204', name: 'Jane Smith', email: 'jane.smith@email.com', phone: '+1-202-555-0183', role: 'Apartment', details: { unit: '204', sqft: 950 }, avatarId: 'avatar-apartment' },
  { id: 'contractor-electric', name: 'Sparky Electricians', email: 'contact@sparky.com', phone: '+1-202-555-0149', role: 'Contractor', details: { service: 'Electrical' }, avatarId: 'avatar-contractor' },
  { id: 'contractor-plumb', name: 'Flow Plumbing', email: 'service@flowplumbing.com', phone: '+1-202-555-0128', role: 'Contractor', details: { service: 'Plumbing' }, avatarId: 'avatar-contractor' },
  { id: 'sec-01', name: 'Mike Guard', email: 'm.guard@estatehub.com', phone: '+1-202-555-0199', role: 'Security', details: { shift: 'Day' }, avatarId: 'avatar-security' },
  { id: 'sec-02', name: 'Susan Watch', email: 's.watch@estatehub.com', phone: '+1-202-555-0176', role: 'Security', details: { shift: 'Night' }, avatarId: 'avatar-security' },
];

const now = new Date();

export const payments: Payment[] = [
  { id: 'pay-001', userId: 'apt-101', amount: 1200, date: new Date(now.getFullYear(), now.getMonth() - 1, 15), status: 'Paid', description: 'Monthly Dues' },
  { id: 'pay-002', userId: 'apt-101', amount: 1200, date: new Date(now.getFullYear(), now.getMonth(), 15), status: 'Due', description: 'Monthly Dues' },
  { id: 'pay-003', userId: 'apt-204', amount: 950, date: new Date(now.getFullYear(), now.getMonth() - 1, 15), status: 'Paid', description: 'Monthly Dues' },
  { id: 'pay-004', userId: 'apt-204', amount: 950, date: new Date(now.getFullYear(), now.getMonth(), 1), status: 'Paid', description: 'Monthly Dues' },
  { id: 'pay-005', userId: 'contractor-electric', amount: 500, date: new Date(now.getFullYear(), now.getMonth() - 2, 20), status: 'Paid', description: 'Vendor Pass' },
  { id: 'pay-006', userId: 'sec-01', amount: 2500, date: new Date(now.getFullYear(), now.getMonth(), 5), status: 'Paid', description: 'Salary' },
  { id: 'pay-007', userId: 'sec-02', amount: 2500, date: new Date(now.getFullYear(), now.getMonth(), 5), status: 'Paid', description: 'Salary' },
];

export const transactions: Transaction[] = [
  { id: 'txn-001', amount: 1200, date: new Date(now.getFullYear(), now.getMonth() - 1, 15, 9, 5), method: 'Card', user: 'John Doe (apt-101)' },
  { id: 'txn-002', amount: 950, date: new Date(now.getFullYear(), now.getMonth() - 1, 15, 11, 23), method: 'Card', user: 'Jane Smith (apt-204)' },
  { id: 'txn-003', amount: 950, date: new Date(now.getFullYear(), now.getMonth(), 1, 14, 0), method: 'Online', user: 'Jane Smith (apt-204)' },
  { id: 'txn-004', amount: 500, date: new Date(now.getFullYear(), now.getMonth() - 2, 20, 10, 10), method: 'Cash', user: 'Sparky Electricians' },
  { id: 'txn-005', amount: 2500, date: new Date(now.getFullYear(), now.getMonth(), 5, 18, 0), method: 'Bank Transfer', user: 'Mike Guard (sec-01)' },
  { id: 'txn-006', amount: 2500, date: new Date(now.getFullYear(), now.getMonth(), 5, 18, 1), method: 'Bank Transfer', user: 'Susan Watch (sec-02)' },
];

export const shifts: Shift[] = [
    { id: 'shift-01', personnel: 'Mike Guard', shift: 'Day (6am - 6pm)', status: 'Active' },
    { id: 'shift-02', personnel: 'Susan Watch', shift: 'Night (6pm - 6am)', status: 'Active' },
    { id: 'shift-03', personnel: 'Tom Patrol', shift: 'Day (6am - 6pm)', status: 'Inactive' },
]

export const rates = {
    '1day': 0.3,
    '7day': 0.5,
    '1month': 1.0,
};

export const allNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Apartment', 'Contractor', 'Security'] },
  { href: '/payments', label: 'Payments', icon: CreditCard, roles: ['Admin', 'Apartment', 'Contractor', 'Security'] },
  { href: '/enroll', label: 'Enroll Entities', icon: UserPlus, roles: [] },
  { href: '/scan', label: 'Evaluate Pass', icon: ScanLine, roles: ['Admin'] },
  { href: '/personnel', label: 'Personnel', icon: Users, roles: [] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Apartment', 'Contractor', 'Security'] },
  { href: '/customize', label: 'Customize', icon: Brush, roles: ['Admin'] },
];

export const roles: { role: UserRole; icon: React.ElementType }[] = [
  { role: 'Admin', icon: UserCog },
  { role: 'Apartment', icon: Building2 },
  { role: 'Contractor', icon: Wrench },
  { role: 'Security', icon: Shield },
];


export const findUserByRole = (role: UserRole) => users.find((user) => user.role === role);
