
import type { User, Payment, Transaction, Shift, UserRole, NavItem, Account, Event, Expense } from '@/types';
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  ScanLine,
  Brush,
  UserCog,
  Building2,
  Wrench,
  Shield,
  Receipt,
  Book,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Users,
  type LucideIcon,
} from 'lucide-react';

export const users: User[] = [
  { id: 'user-admin-01', name: 'Admin User', email: 'admin@estatehub.com', phone: '+1-202-555-0104', role: 'Admin', avatarId: 'avatar-admin' },
  { id: 'user-apt-101', name: 'John Doe', email: 'john.doe@email.com', phone: '+1-202-555-0162', role: 'Apartment', details: { unit: '101', sqft: 1200 }, avatarId: 'avatar-apartment' },
  { id: 'user-apt-204', name: 'Jane Smith', email: 'jane.smith@email.com', phone: '+1-202-555-0183', role: 'Apartment', details: { unit: '204', sqft: 950 }, avatarId: 'avatar-apartment' },
  { id: 'user-con-elec', name: 'Sparky Electricians', email: 'contact@sparky.com', phone: '+1-202-555-0149', role: 'Contractor', details: { service: 'Electrical' }, avatarId: 'avatar-contractor' },
  { id: 'user-con-plumb', name: 'Flow Plumbing', email: 'service@flowplumbing.com', phone: '+1-202-555-0128', role: 'Contractor', details: { service: 'Plumbing' }, avatarId: 'avatar-contractor' },
  { id: 'user-sec-01', name: 'Mike Guard', email: 'm.guard@estatehub.com', phone: '+1-202-555-0199', role: 'Security', details: { shift: 'Day' }, avatarId: 'avatar-security' },
  { id: 'user-sec-02', name: 'Susan Watch', email: 's.watch@estatehub.com', phone: '+1-202-555-0176', role: 'Security', details: { shift: 'Night' }, avatarId: 'avatar-security' },
];

const now = new Date();

export const payments: Payment[] = [
  // John Doe's Payments (user-apt-101)
  { id: 'pay-001', userId: 'user-apt-101', accountId: 'acc-01', amount: 1200, date: new Date(now.getFullYear(), now.getMonth() - 2, 5), status: 'Paid', description: '1-Month Maintenance' },
  { id: 'pay-002', userId: 'user-apt-101', accountId: 'acc-01', amount: 1200, date: new Date(now.getFullYear(), now.getMonth(), 10), status: 'Pending Verification', description: '1-Month Maintenance' },
  
  // Jane Smith's Payments (user-apt-204)
  { id: 'pay-003', userId: 'user-apt-204', accountId: 'acc-01', amount: 950, date: new Date(now.getFullYear(), now.getMonth() - 1, 15), status: 'Paid', description: '1-Month Maintenance' },
  { id: 'pay-004', userId: 'user-apt-204', accountId: 'acc-01', amount: 950, date: new Date(now.getFullYear(), now.getMonth(), 1), status: 'Due', description: '1-Month Maintenance' },

  // Other payments
  { id: 'pay-005', userId: 'user-con-elec', accountId: 'acc-05', amount: 500, date: new Date(now.getFullYear(), now.getMonth() - 2, 20), status: 'Paid', description: 'Vendor Pass' },
  { id: 'pay-006', userId: 'user-sec-01', accountId: 'acc-02', amount: 2500, date: new Date(now.getFullYear(), now.getMonth(), 5), status: 'Paid', description: 'Salary Advance' },
];

export const expenses: Expense[] = [
  { id: 'exp-001', accountId: 'acc-02', amount: 5000, date: new Date(now.getFullYear(), now.getMonth(), 5), status: 'Paid', description: 'Monthly salary for security staff' },
  { id: 'exp-002', accountId: 'acc-03', amount: 15000, date: new Date(now.getFullYear(), now.getMonth() -1, 20), status: 'Paid', description: 'New lobby furniture' },
  { id: 'exp-003', accountId: 'acc-06', amount: 2200, date: new Date(now.getFullYear(), now.getMonth(), 10), status: 'Pending', description: 'Electricity bill for common areas' },
];

export const events: Event[] = [
    { id: 'evt-001', name: 'Annual General Body Meeting', description: 'Discussing the financials of the last year and plans for the next.', dateTime: new Date(now.getFullYear(), now.getMonth() + 1, 15, 11, 0), audience: ['Admin', 'Apartment'], status: 'Sent' },
    { id: 'evt-002', name: 'Diwali Celebration', description: 'Join us for a grand Diwali celebration in the community hall.', dateTime: new Date(now.getFullYear(), 10, 5, 18, 30), audience: ['Admin', 'Apartment', 'Contractor', 'Security'], status: 'Sent' },
    { id: 'evt-003', name: 'Water Supply Disruption', description: 'Water supply will be unavailable on the 25th from 10 AM to 2 PM for maintenance.', dateTime: new Date(now.getFullYear(), now.getMonth(), 25, 10, 0), audience: ['Apartment'], status: 'Sent' },
    { id: 'evt-004', name: 'Security Drill', description: 'A mandatory security drill is scheduled for all security personnel.', dateTime: new Date(now.getFullYear(), now.getMonth(), 28, 15, 0), audience: ['Security'], status: 'Draft' },
];


export const transactions: Transaction[] = [
  { id: 'txn-001', amount: 1200, date: new Date(now.getFullYear(), now.getMonth() - 1, 15, 9, 5), method: 'Card', user: 'John Doe (user-apt-101)' },
  { id: 'txn-002', amount: 950, date: new Date(now.getFullYear(), now.getMonth() - 1, 15, 11, 23), method: 'Card', user: 'Jane Smith (user-apt-204)' },
  { id: 'txn-003', amount: 950, date: new Date(now.getFullYear(), now.getMonth(), 1, 14, 0), method: 'Online', user: 'Jane Smith (user-apt-204)' },
  { id: 'txn-004', amount: 500, date: new Date(now.getFullYear(), now.getMonth() - 2, 20, 10, 10), method: 'Cash', user: 'Sparky Electricians' },
  { id: 'txn-005', amount: 2500, date: new Date(now.getFullYear(), now.getMonth(), 5, 18, 0), method: 'Bank Transfer', user: 'Mike Guard (user-sec-01)' },
  { id: 'txn-006', amount: 2500, date: new Date(now.getFullYear(), now.getMonth(), 5, 18, 1), method: 'Bank Transfer', user: 'Susan Watch (user-sec-02)' },
];

export const shifts: Shift[] = [
    { id: 'shift-01', personnel: 'Mike Guard', shift: 'Day (6am - 6pm)', status: 'Active' },
    { id: 'shift-02', personnel: 'Susan Watch', shift: 'Night (6pm - 6am)', status: 'Active' },
    { id: 'shift-03', personnel: 'Tom Patrol', shift: 'Day (6am - 6pm)', status: 'Inactive' },
]

export const rates = {
    apartment: {
        '1month': 1.0,
        '3month': 2.8, // 1 month free equiv
        '6month': 5.5, // ~2 weeks free equiv
        '12month': 10.0, // 2 months free
    },
    contractor: {
        '1day': 50,
        '7day': 250,
        '1month': 800,
    },
    fines: {
        latePaymentFee: 500,
        finePercentPerDay: 0.1,
    }
};

export const allNavItems: NavItem[] = [
  // Common
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Apartment', 'Contractor', 'Security'] },
  { href: '/events', label: 'Events', icon: CalendarDays, roles: ['Admin', 'Apartment', 'Contractor', 'Security'] },
  
  // Admin Only
  { href: '/cashbook', label: 'Cashbook', icon: Book, roles: ['Admin'] },
  { href: '/payments', label: 'Receipts', icon: TrendingUp, roles: ['Admin'] },
  { href: '/expenses', label: 'Expenses', icon: TrendingDown, roles: ['Admin'] },
  { href: '/enroll', label: 'Enroll', icon: UserCog, roles: ['Admin'] },
  { href: '/users', label: 'Users', icon: Users, roles: ['Admin'] },
  { href: '/scan', label: 'Evaluate Pass', icon: ScanLine, roles: ['Admin'] },
  { href: '/customize', label: 'Customize', icon: Brush, roles: ['Admin'] },
  
  // Apartment & Contractor
  { href: '/cashbook', label: 'Cashbook', icon: Book, roles: ['Apartment', 'Contractor'] },
  { href: '/payments', label: 'Payments', icon: CreditCard, roles: ['Apartment', 'Contractor'] },
  { href: '/charges', label: 'Charges', icon: TrendingDown, roles: ['Apartment', 'Contractor'] },
  
  // Security
  { href: '/cashbook', label: 'Cashbook', icon: Book, roles: ['Security'] },
  { href: '/payments', label: 'New Receipt', icon: Receipt, roles: ['Security'] },

  // Common
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Apartment', 'Contractor', 'Security'] },
];

export const roleIcons: Record<UserRole, LucideIcon> = {
  Admin: UserCog,
  Apartment: Building2,
  Contractor: Wrench,
  Security: Shield,
};

export const roleDisplayNames: Record<UserRole, string> = {
    Admin: 'Admin',
    Apartment: 'Apartment Owner',
    Contractor: 'Utility Contractor',
    Security: 'Security',
};

export const roleBadgeVariants: Record<UserRole, "admin" | "apartment" | "contractor" | "security"> = {
    Admin: 'admin',
    Apartment: 'apartment',
    Contractor: 'contractor',
    Security: 'security',
};

export const roleTextColors: Record<UserRole, string> = {
    Admin: 'text-blue-500 dark:text-blue-400',
    Apartment: 'text-green-500 dark:text-green-400',
    Contractor: 'text-yellow-500 dark:text-yellow-400',
    Security: 'text-red-500 dark:text-red-400',
};

export const roles: { role: UserRole; icon: React.ElementType, displayName: string }[] = [
  { role: 'Admin', icon: UserCog, displayName: roleDisplayNames['Admin'] },
  { role: 'Apartment', icon: Building2, displayName: roleDisplayNames['Apartment'] },
  { role: 'Contractor', icon: Wrench, displayName: roleDisplayNames['Contractor'] },
  { role: 'Security', icon: Shield, displayName: roleDisplayNames['Security'] },
];


export const findUserByRole = (role: UserRole) => users.find((user) => user.role === role);


export const accounts: Account[] = [
  { id: 'acc-01', name: 'Maintenance Fees', type: 'Credit', balanceForward: 15000.00, description: 'Monthly maintenance collections', subAccountOf: ['Apartment'] },
  { id: 'acc-02', name: 'Security Salaries', type: 'Debit', balanceForward: 5000.00, description: 'Salaries for security personnel' },
  { id: 'acc-03', name: 'Capital Goods', type: 'Debit', balanceForward: 0.00, description: 'Assets and equipment', depreciationRate: 10 },
  { id: 'acc-04', name: 'Fines Collected', type: 'Credit', balanceForward: 2500.00, description: 'Late payment fines', subAccountOf: ['Apartment'] },
  { id: 'acc-05', name: 'Contractor Pass Fees', type: 'Credit', balanceForward: 1000.00, description: 'Fees collected for contractor passes', subAccountOf: ['Contractor'] },
  { id: 'acc-06', name: 'Utilities', type: 'Debit', balanceForward: 800.00, description: 'Common area utilities' },
];
