'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { users, rates, shifts, findUserByRole } from "@/lib/data";
import type { User, UserRole, Payment } from '@/types';
import { ArrowLeft, Building2, Shield, Wrench, FileDown, Check, CreditCard, Mail, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { UserProfileCard } from '@/components/app/dashboard/user-profile-card';
import { useFirebase, useCollection, useMemoFirebase, updateDocumentNonBlocking, useUser } from '@/firebase';
import { collection, doc, Timestamp } from 'firebase/firestore';


type ListFilter = 'all' | 'withDues' | 'noDues' | 'active' | 'inactive' | 'pending' | 'verified';

export function InfoCard() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;
  const currentUser = role ? findUserByRole(role) : null;
  
  const [view, setView] = useState<'dashboard' | 'userList' | 'paymentList'>('dashboard');
  const [selectedUserList, setSelectedUserList] = useState<User[]>([]);
  const [listTitle, setListTitle] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  const { firestore } = useFirebase();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const receiptsQuery = useMemoFirebase(() => authUser ? collection(firestore, 'receipts') : null, [firestore, authUser]);
  const { data: initialPayments, isLoading: paymentsLoading } = useCollection<Payment>(receiptsQuery);

  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (initialPayments) {
        setPayments(initialPayments);
    }
  }, [initialPayments]);

  const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  if (isAuthLoading || paymentsLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Info KPIs</CardTitle>
                <CardDescription>An overview of key metrics across the system.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
        </Card>
    )
  }

  const totalApartments = users.filter(u => u.role === 'Apartment').length;
  const apartmentsWithDues = users.filter(u => u.role === 'Apartment' && payments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue'))).length;
  const apartmentsNoDues = totalApartments - apartmentsWithDues;
  
  const totalContractors = users.filter(u => u.role === 'Contractor').length;
  const contractorsWithDues = users.filter(u => u.role === 'Contractor' && payments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue'))).length;
  const contractorsNoDues = totalContractors - contractorsWithDues;
  
  const securityUsers = users.filter(u => u.role === 'Security');
  const totalSecurity = securityUsers.length;
  const activeSecurity = shifts.filter(s => s.status === 'Active' && securityUsers.some(u => u.name === s.personnel)).length;
  const inactiveSecurity = totalSecurity - activeSecurity;

  const totalPayments = payments.length;
  const pendingPaymentsCount = payments.filter(p => p.status === 'Pending Verification').length;
  const verifiedPaymentsCount = totalPayments - pendingPaymentsCount;

  const kpiData: { title: string; value: { total: number; withDues?: number; noDues?: number; active?: number; inactive?: number; pending?: number; verified?: number; }; icon: React.ElementType; role: UserRole | 'All' | 'Payments' }[] = [
    { title: "Apartment Owners", value: { total: totalApartments, withDues: apartmentsWithDues, noDues: apartmentsNoDues }, icon: Building2, role: 'Apartment' },
    { title: "Utility Contractors", value: { total: totalContractors, withDues: contractorsWithDues, noDues: contractorsNoDues }, icon: Wrench, role: 'Contractor' },
    { title: "Security", value: { total: totalSecurity, active: activeSecurity, inactive: inactiveSecurity }, icon: Shield, role: 'Security' },
    { title: "Payments", value: { total: totalPayments, pending: pendingPaymentsCount, verified: verifiedPaymentsCount }, icon: CreditCard, role: 'Payments' },
  ];
  
  const handleKpiClick = (role: UserRole | 'Payments', title: string, filter: ListFilter) => {
    let filteredUsers: User[] = [];
    let paymentList: Payment[] = [];
    let newTitle = '';

    if (role === 'Payments') {
        if (filter === 'pending') {
            paymentList = payments.filter(p => p.status === 'Pending Verification');
            newTitle = 'Pending Payments';
        } else if (filter === 'verified') {
            paymentList = payments.filter(p => p.status !== 'Pending Verification');
            newTitle = 'Verified Payments';
        } else {
            paymentList = payments;
            newTitle = 'All Payments';
        }
        setPayments(paymentList);
        setListTitle(newTitle);
        setView('paymentList');
        return;
    }

    const roleUsers = users.filter(u => u.role === role);
    switch (filter) {
        case 'withDues':
            filteredUsers = roleUsers.filter(u => payments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue')));
            newTitle = `${title} with Dues`;
            break;
        case 'noDues':
            filteredUsers = roleUsers.filter(u => !payments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue')));
            newTitle = `${title} with No Dues`;
            break;
        case 'active':
            filteredUsers = roleUsers.filter(u => shifts.some(s => s.personnel === u.name && s.status === 'Active'));
            newTitle = `Active ${title}`;
            break;
        case 'inactive':
            filteredUsers = roleUsers.filter(u => !shifts.some(s => s.personnel === u.name && s.status === 'Active'));
            newTitle = `Inactive ${title}`;
            break;
        default:
            filteredUsers = roleUsers;
            newTitle = `All ${title}`;
    }

    setSelectedUserList(filteredUsers);
    setListTitle(newTitle);
    setSelectedUser(null);
    setView('userList');
  }

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedUserList([]);
    setListTitle('');
    setSelectedUser(null);
    if(initialPayments) setPayments(initialPayments);
  }
  
  const handleBackToUserList = () => {
    setSelectedUser(null);
  }

  const handleExportCsv = (dataType: 'users' | 'payments') => {
    let headers: string[];
    let csvRows: string[];

    if (dataType === 'users') {
        headers = ['id', 'name', 'email', 'phone', 'role', 'unit', 'sqft', 'service', 'shift'];
        csvRows = [headers.join(',')];

        selectedUserList.forEach(user => {
            const row = [
                user.id,
                user.name,
                user.email,
                user.phone || '',
                user.role,
                user.details?.unit || '',
                user.details?.sqft || '',
                user.details?.service || '',
                user.details?.shift || ''
            ];
            csvRows.push(row.join(','));
        });
    } else { 
        headers = ['id', 'userId', 'userName', 'description', 'amount', 'date', 'status'];
        csvRows = [headers.join(',')];
        payments.forEach(payment => {
            const paymentUser = users.find(u => u.id === payment.userId);
            const row = [
                payment.id,
                payment.userId,
                paymentUser?.name || 'Unknown',
                payment.description,
                payment.amount,
                (payment.date as Timestamp).toDate().toISOString(),
                payment.status,
            ];
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
    const paymentDoc = doc(firestore, 'receipts', paymentId);
    updateDocumentNonBlocking(paymentDoc, { status: 'Paid' });
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Paid' } : p));
    toast({
        title: "Payment Verified",
        description: "The payment has been marked as paid.",
    });
  }

  const userForPayment = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown';
  
  const checkPassStatus = (userId: string) => {
    const passPayments = payments.filter(p => p.userId === userId && p.description.includes('Pass') && p.status === 'Paid');
    if (passPayments.length === 0) return { active: false, expires: null };

    const sortedPasses = passPayments.sort((a, b) => (b.date as Timestamp).toMillis() - (a.date as Timestamp).toMillis());
    const lastPass = sortedPasses[0];

    const expiryDate = (lastPass.date as Timestamp).toDate();
    if (lastPass.description.includes('1-Day')) expiryDate.setDate(expiryDate.getDate() + 1);
    else if (lastPass.description.includes('7-Day')) expiryDate.setDate(expiryDate.getDate() + 7);
    else if (lastPass.description.includes('1-Month')) expiryDate.setMonth(expiryDate.getMonth() + 1);

    const isActive = expiryDate > new Date();

    return { active: isActive, expires: expiryDate };
  };

  if (view === 'userList') {
    const isApartmentList = listTitle.includes('Apartment');
    const isContractorList = listTitle.includes('Contractor');

    if (selectedUser) {
        return (
            <Card>
                <CardHeader>
                    <Button variant="outline" onClick={handleBackToUserList} className="mb-4 w-fit">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to List
                    </Button>
                </CardHeader>
                <CardContent>
                    <UserProfileCard user={selectedUser} />
                </CardContent>
            </Card>
        )
    }
    
    return (
      <Card>
          <CardHeader>
            <Button variant="outline" onClick={handleBackToDashboard} className="mb-4 w-fit">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Info
            </Button>
            <div className="flex flex-row items-center justify-between">
                <CardTitle>{listTitle}</CardTitle>
                <Button variant="outline" size="icon" onClick={() => handleExportCsv('users')}>
                    <FileDown className="h-4 w-4" />
                    <span className="sr-only">Export as CSV</span>
                </Button>
            </div>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>{isApartmentList ? "Apartment ID" : isContractorList ? "Contractor ID" : "Staff ID"}</TableHead>
                          <TableHead>{isApartmentList ? "Resident Name" : isContractorList ? "Contractor Name" : "Staff Name"}</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          {isApartmentList && <TableHead>Size (sqft)</TableHead>}
                          {isApartmentList && <TableHead>Pass Status</TableHead>}
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {selectedUserList.map(u => {
                          const passStatus = checkPassStatus(u.id);
                          return (
                              <TableRow key={u.id}>
                                  <TableCell className="font-medium cursor-pointer" onClick={() => setSelectedUser(u)}>{u.id}</TableCell>
                                  <TableCell className="cursor-pointer" onClick={() => setSelectedUser(u)}>{u.name}</TableCell>
                                  <TableCell>
                                      <a href={`mailto:${u.email}`} className="flex items-center gap-2 hover:underline text-primary">
                                          <Mail className="h-4 w-4" />
                                          <span>Email</span>
                                      </a>
                                  </TableCell>
                                  <TableCell>
                                      {u.phone ? (
                                          <a href={`tel:${u.phone}`} className="flex items-center gap-2 hover:underline text-primary">
                                              <Phone className="h-4 w-4" />
                                              <span>Call</span>
                                          </a>
                                      ) : (
                                          <span className="text-muted-foreground">N/A</span>
                                      )}
                                  </TableCell>
                                  {isApartmentList && <TableCell className="cursor-pointer" onClick={() => setSelectedUser(u)}>{u.details?.sqft}</TableCell>}
                                  {isApartmentList && <TableCell className="cursor-pointer" onClick={() => setSelectedUser(u)}>
                                      <Badge variant={passStatus.active ? 'secondary' : 'outline'} className={passStatus.active ? 'bg-green-500 text-white' : ''}>
                                          {passStatus.active && passStatus.expires ? `Active (Expires ${dateFormatter.format(passStatus.expires).replace(/ /g, '-')})` : 'Inactive'}
                                      </Badge>
                                  </TableCell>}
                              </TableRow>
                          )
                      })}
                      {selectedUserList.length === 0 && (
                          <TableRow>
                              <TableCell colSpan={isApartmentList ? 6 : 4} className="text-center">No users found for this filter.</TableCell>
                          </TableRow>
                      )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
    );
  }

  if (view === 'paymentList') {
    return (
      <Card>
        <CardHeader>
          <Button variant="outline" onClick={handleBackToDashboard} className="mb-4 w-fit">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Info
          </Button>
          <div className="flex flex-row items-center justify-between">
            <CardTitle>{listTitle}</CardTitle>
             <Button variant="outline" size="icon" onClick={() => handleExportCsv('payments')}>
                <FileDown className="h-4 w-4" />
                <span className="sr-only">Export as CSV</span>
            </Button>
          </div>
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
                          className={payment.status === 'Pending Verification' ? 'bg-amber-500 text-white' : payment.status === 'Paid' ? 'bg-green-700 text-white' : ''}
                      >
                          {payment.status === 'Paid' ? 'Verified' : payment.status}
                      </Badge>
                  </TableCell>
                  <TableCell>{dateFormatter.format((payment.date as Timestamp).toDate()).replace(/ /g, '-')}</TableCell>
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
                          No payments found for this filter.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
        <CardHeader>
            <CardTitle>Info KPIs</CardTitle>
            <CardDescription>An overview of key metrics across the system.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
                {kpiData.map((kpi, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                            <kpi.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                        <div className="flex items-baseline gap-x-4 gap-y-2 flex-wrap">
                            {kpi.role === 'Payments' ? (
                                <>
                                    <div className="hover:bg-muted/50 cursor-pointer p-2 rounded-md" onClick={() => handleKpiClick(kpi.role, kpi.title, 'pending')}>
                                        <p className="text-xs text-red-500">Pending</p>
                                        <div className="text-2xl font-bold text-red-500">{kpi.value.pending}</div>
                                    </div>
                                    <div className="hover:bg-muted/50 cursor-pointer p-2 rounded-md" onClick={() => handleKpiClick(kpi.role, kpi.title, 'verified')}>
                                        <p className="text-xs text-green-700">Verified</p>
                                        <div className="text-2xl font-bold text-green-700">{kpi.value.verified}</div>
                                    </div>
                                </>
                            ) : kpi.role === 'Security' ? (
                                <>
                                    <div className="hover:bg-muted/50 cursor-pointer p-2 rounded-md" onClick={() => handleKpiClick(kpi.role, kpi.title, 'inactive')}>
                                        <p className="text-xs text-red-500">Inactive</p>
                                        <div className="text-2xl font-bold text-red-500">{kpi.value.inactive}</div>
                                    </div>
                                    <div className="hover:bg-muted/50 cursor-pointer p-2 rounded-md" onClick={() => handleKpiClick(kpi.role, kpi.title, 'active')}>
                                        <p className="text-xs text-green-700">Active</p>
                                        <div className="text-2xl font-bold text-green-700">{kpi.value.active}</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="hover:bg-muted/50 cursor-pointer p-2 rounded-md" onClick={() => handleKpiClick(kpi.role, kpi.title, 'withDues')}>
                                        <p className="text-xs text-red-500">With Dues</p>
                                        <div className="text-2xl font-bold text-red-500">{kpi.value.withDues}</div>
                                    </div>
                                    <div className="hover:bg-muted/50 cursor-pointer p-2 rounded-md" onClick={() => handleKpiClick(kpi.role, kpi.title, 'noDues')}>
                                        <p className="text-xs text-green-700">No Dues</p>
                                        <div className="text-2xl font-bold text-green-700">{kpi.value.noDues}</div>
                                    </div>
                                </>
                            )}
                                <div className="hover:bg-muted/50 cursor-pointer p-2 rounded-md" onClick={() => handleKpiClick(kpi.role, kpi.title, 'all')}>
                                <p className="text-xs text-muted-foreground">Total</p>
                                <div className="text-2xl font-bold">{kpi.value.total}</div>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </CardContent>
    </Card>
  );
}
