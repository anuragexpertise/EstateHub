'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { users, payments as initialPayments, expenses, events } from "@/lib/data";
import type { User, Payment } from '@/types';
import { ArrowLeft, Building2, Shield, Wrench, FileDown, Check, TrendingUp, TrendingDown, IndianRupee, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfileCard } from '@/components/app/dashboard/user-profile-card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ListFilter = 'all' | 'withDues' | 'noDues' | 'pending' | 'verified' | 'drafts' | 'sent';

export function AdminDashboard() {
    const [view, setView] = useState<'dashboard' | 'userList' | 'paymentList'>('dashboard');
    const [selectedUserList, setSelectedUserList] = useState<User[]>([]);
    const [payments, setPayments] = useState<Payment[]>(initialPayments);
    const [listTitle, setListTitle] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const { toast } = useToast();

    const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // KPI Calculations
    const apartments = users.filter(u => u.role === 'Apartment');
    const apartmentsWithDues = apartments.filter(u => initialPayments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue'))).length;
    
    const contractors = users.filter(u => u.role === 'Contractor');
    const contractorsWithDues = contractors.filter(u => initialPayments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue'))).length;
    
    const security = users.filter(u => u.role === 'Security');
    
    const totalCredits = initialPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const totalDebits = expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
    const balance = totalCredits - totalDebits;
    const pendingCredits = initialPayments.filter(p => p.status === 'Pending Verification').reduce((sum, p) => sum + p.amount, 0);
    const verifiedCredits = totalCredits;
    const pendingDebits = expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);
    const paidDebits = totalDebits;
    
    const upcomingEvents = events.filter(e => e.status === 'Sent' && e.dateTime > new Date()).length;
    const draftEvents = events.filter(e => e.status === 'Draft').length;

    const kpis = [
        { title: "Apartment Owners", icon: Building2, role: 'Apartment', stats: [
            { label: "With Dues", value: apartmentsWithDues, color: "text-destructive", filter: 'withDues' }, 
            { label: "No Dues", value: apartments.length - apartmentsWithDues, color: "text-green-600", filter: 'noDues' }, 
            { label: "Total", value: apartments.length, filter: 'all' }
        ] },
        { title: "Utility Contractors", icon: Wrench, role: 'Contractor', stats: [
            { label: "With Dues", value: contractorsWithDues, color: "text-destructive", filter: 'withDues' }, 
            { label: "No Dues", value: contractors.length - contractorsWithDues, color: "text-green-600", filter: 'noDues' }, 
            { label: "Total", value: contractors.length, filter: 'all' }
        ] },
        { title: "Security Staff", icon: Shield, role: 'Security', stats: [{ label: "Total", value: security.length, filter: 'all' }] },
        { title: "Balance", icon: IndianRupee, role: 'Financials', stats: [
            { label: "Available", value: `₹${balance.toLocaleString()}`, color: balance >= 0 ? "text-green-600" : "text-destructive", filter: 'all' }, 
            { label: "Credits", value: `₹${totalCredits.toLocaleString()}`, color: "text-green-600", filter: 'all' }, 
            { label: "Debits", value: `₹${totalDebits.toLocaleString()}`, color: "text-destructive", filter: 'all' }
        ]},
        { title: "Credits (Receipts)", icon: TrendingUp, role: 'Payments', stats: [
            { label: "Pending", value: `₹${pendingCredits.toLocaleString()}`, color: "text-amber-500", filter: 'pending' }, 
            { label: "Verified", value: `₹${verifiedCredits.toLocaleString()}`, color: "text-green-600", filter: 'verified' }
        ] },
        { title: "Debits (Expenses)", icon: TrendingDown, role: 'Expenses', stats: [
            { label: "Pending", value: `₹${pendingDebits.toLocaleString()}`, color: "text-amber-500", filter: 'pending' }, 
            { label: "Paid", value: `₹${paidDebits.toLocaleString()}`, color: "text-green-600", filter: 'verified' }
        ] },
        { title: "Events", icon: CalendarDays, role: 'Events', stats: [
            { label: "Upcoming", value: upcomingEvents, filter: 'sent' }, 
            { label: "Drafts", value: draftEvents, color: "text-amber-500", filter: 'drafts' }
        ] },
    ];
    
    const handleKpiClick = (role: string, title: string, filter: ListFilter) => {
        let filteredUsers: User[] = [];
        let paymentList: Payment[] = [];
        let newTitle = '';

        const roleUsers = users.filter(u => u.role === role);

        switch (role) {
            case 'Apartment':
            case 'Contractor':
            case 'Security':
                newTitle = `All ${title}`;
                if (filter === 'withDues') {
                    filteredUsers = roleUsers.filter(u => initialPayments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue')));
                    newTitle = `${title} with Dues`;
                } else if (filter === 'noDues') {
                    filteredUsers = roleUsers.filter(u => !initialPayments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue')));
                    newTitle = `${title} with No Dues`;
                } else {
                    filteredUsers = roleUsers;
                }
                setSelectedUserList(filteredUsers);
                setListTitle(newTitle);
                setSelectedUser(null);
                setView('userList');
                break;
            
            case 'Payments':
                newTitle = 'All Receipts';
                if (filter === 'pending') {
                    paymentList = initialPayments.filter(p => p.status === 'Pending Verification');
                    newTitle = 'Pending Receipts';
                } else if (filter === 'verified') {
                    paymentList = initialPayments.filter(p => p.status === 'Paid');
                    newTitle = 'Verified Receipts';
                } else {
                    paymentList = initialPayments;
                }
                setPayments(paymentList);
                setListTitle(newTitle);
                setView('paymentList');
                break;
            
            default:
                toast({ title: 'Info', description: 'This KPI detail view is not yet implemented.' });
                return;
        }
    };
    
    const handleBackToDashboard = () => {
        setView('dashboard');
        setSelectedUserList([]);
        setListTitle('');
        setSelectedUser(null);
        setPayments(initialPayments);
    };
    
    const handleBackToUserList = () => {
        setSelectedUser(null);
    };

    const handleExportCsv = (dataType: 'users' | 'payments') => {
        let headers: string[];
        let csvRows: string[];

        if (dataType === 'users') {
            headers = ['id', 'name', 'email', 'phone', 'role', 'unit', 'sqft', 'service', 'shift'];
            csvRows = [headers.join(',')];

            selectedUserList.forEach(user => {
                const row = [ user.id, user.name, user.email, user.phone || '', user.role, user.details?.unit || '', user.details?.sqft || '', user.details?.service || '', user.details?.shift || '' ];
                csvRows.push(row.join(','));
            });
        } else { 
            headers = ['id', 'userId', 'userName', 'description', 'amount', 'date', 'status'];
            csvRows = [headers.join(',')];
            payments.forEach(payment => {
                const paymentUser = users.find(u => u.id === payment.userId);
                const row = [ payment.id, payment.userId, paymentUser?.name || 'Unknown', payment.description, payment.amount, payment.date.toISOString(), payment.status ];
                csvRows.push(row.join(','));
            })
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${listTitle.toLowerCase().replace(/ /g, '_')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleVerifyPayment = (paymentId: string) => {
        const newPayments = payments.map(p => p.id === paymentId ? { ...p, status: 'Paid' } : p);
        const allNewPayments = initialPayments.map(p => p.id === paymentId ? { ...p, status: 'Paid' } : p);
        setPayments(newPayments);
        initialPayments.length = 0;
        Array.prototype.push.apply(initialPayments, allNewPayments);

        toast({ title: "Receipt Verified", description: "The payment has been marked as paid." });
    };
    
    const userForPayment = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown';

    if (view === 'userList') {
        const isApartmentList = listTitle.includes('Apartment');
        const isContractorList = listTitle.includes('Contractor');
    
        if (selectedUser) {
            return (
                <div>
                    <Button variant="outline" onClick={handleBackToUserList} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to List
                    </Button>
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                        <UserProfileCard user={selectedUser} />
                    </div>
                </div>
            )
        }
        
        return (
          <div>
            <Button variant="outline" onClick={handleBackToDashboard} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{listTitle}</CardTitle>
                <Button variant="outline" size="icon" onClick={() => handleExportCsv('users')}>
                    <FileDown className="h-4 w-4" />
                    <span className="sr-only">Export as CSV</span>
                </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{isApartmentList ? "Apartment ID" : isContractorList ? "Contractor ID" : "Staff ID"}</TableHead>
                                <TableHead>{isApartmentList ? "Resident Name" : isContractorList ? "Contractor Name" : "Staff Name"}</TableHead>
                                {isApartmentList && <TableHead>Size (sqft)</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedUserList.map(u => (
                                <TableRow key={u.id} onClick={() => setSelectedUser(u)} className={"cursor-pointer"}>
                                    <TableCell className="font-medium">{u.id}</TableCell>
                                    <TableCell>{u.name}</TableCell>
                                    {isApartmentList && <TableCell>{u.details?.sqft}</TableCell>}
                                </TableRow>
                            ))}
                            {selectedUserList.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={isApartmentList ? 3 : 2} className="text-center text-muted-foreground">No users found for this filter.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </div>
        );
      }
    
      if (view === 'paymentList') {
        return (
          <div>
            <Button variant="outline" onClick={handleBackToDashboard} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{listTitle}</CardTitle>
                 <Button variant="outline" size="icon" onClick={() => handleExportCsv('payments')}>
                    <FileDown className="h-4 w-4" />
                    <span className="sr-only">Export as CSV</span>
                </Button>
              </CardHeader>
              <CardContent>
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Description</TableHead>
                       <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{userForPayment(payment.userId)}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                         <TableCell>
                            <Badge 
                                variant={payment.status === 'Paid' ? 'secondary' : payment.status === 'Due' ? 'outline' : payment.status === 'Pending Verification' ? 'default' : 'destructive'}
                                className={payment.status === 'Pending Verification' ? 'bg-amber-500 text-white' : ''}
                            >
                                {payment.status}
                            </Badge>
                        </TableCell>
                        <TableCell>{dateFormatter.format(new Date(payment.date)).replace(/ /g, '-')}</TableCell>
                        <TableCell className="text-right">₹{payment.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          {payment.status === 'Pending Verification' && (
                            <Button size="sm" onClick={() => handleVerifyPayment(payment.id)}>
                                <Check className="mr-2 h-4 w-4" />
                                Verify
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {payments.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No receipts found for this filter.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
      }
    
    return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {kpis.map(kpi => (
              <Card key={kpi.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <kpi.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-x-4 gap-y-2 flex-wrap">
                    {kpi.stats.map(stat => (
                      <div key={stat.label} className="hover:bg-muted/50 p-2 -m-2 rounded-md cursor-pointer" onClick={() => handleKpiClick(kpi.role, kpi.title, stat.filter as ListFilter)}>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
}
