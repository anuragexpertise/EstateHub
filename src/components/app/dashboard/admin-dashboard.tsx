'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { transactions, users, payments as initialPayments, rates, shifts } from "@/lib/data";
import type { User, UserRole, Payment } from '@/types';
import { ArrowLeft, ArrowRightLeft, Building2, Shield, Users, Wrench, ScanLine, FileDown, Hourglass, Check } from "lucide-react";
import { QrCodeDisplay } from "../qr-code";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserProfileCard } from './user-profile-card';
import { useToast } from '@/hooks/use-toast';

export function AdminDashboard() {
  const [view, setView] = useState<'dashboard' | 'userList' | 'paymentList'>('dashboard');
  const [selectedUserList, setSelectedUserList] = useState<User[]>([]);
  const [listTitle, setListTitle] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const { toast } = useToast();

  const nonVerifiedPayments = payments.filter(p => p.status === 'Pending Verification');
  const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

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

  const kpiData: { title: string; value: number | { total: number; withDues?: number; noDues?: number; active?: number; inactive?: number; }; icon: React.ElementType; role: UserRole | 'All' | 'Payments' }[] = [
    { title: "Apartments", value: { total: totalApartments, withDues: apartmentsWithDues, noDues: apartmentsNoDues }, icon: Building2, role: 'Apartment' },
    { title: "Contractors", value: { total: totalContractors, withDues: contractorsWithDues, noDues: contractorsNoDues }, icon: Wrench, role: 'Contractor' },
    { title: "Security Staff", value: { total: totalSecurity, active: activeSecurity, inactive: inactiveSecurity }, icon: Shield, role: 'Security' },
    { title: "Non-Verified Payments", value: nonVerifiedPayments.length, icon: Hourglass, role: 'Payments' },
  ];

  const recentTransactions = transactions.slice(0, 6);
  const user = users.find(u => u.role === 'Admin');
  
  if (!user) {
    return <p>Admin user not found.</p>;
  }

  const handleKpiClick = (role: UserRole | 'All' | 'Payments', title: string) => {
    if (role === 'Payments') {
        setListTitle(title);
        setView('paymentList');
    } else {
        const userList = role === 'All' ? users : users.filter(u => u.role === role);
        setSelectedUserList(userList);
        setListTitle(`${title} List`);
        setSelectedUser(null);
        setView('userList');
    }
  }

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedUserList([]);
    setListTitle('');
    setSelectedUser(null);
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
        nonVerifiedPayments.forEach(payment => {
            const paymentUser = users.find(u => u.id === payment.userId);
            const row = [
                payment.id,
                payment.userId,
                paymentUser?.name || 'Unknown',
                payment.description,
                payment.amount,
                payment.date.toISOString(),
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
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Paid' } : p));
    toast({
        title: "Payment Verified",
        description: "The payment has been marked as paid.",
    });
  }

  const handleAddPassPayment = (user: User, passType: '1day' | '7day' | '1month') => {
    const sqft = user.details?.sqft || 0;
    const rate = rates[passType];
    const amount = sqft * rate;
    const description = {
        '1day': '1-Day Pass',
        '7day': '7-Day Pass',
        '1month': '1-Month Pass',
    }[passType];
    
    const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        userId: user.id,
        amount: amount,
        description: description,
        date: new Date(),
        status: 'Paid'
    };

    setPayments(prev => [newPayment, ...prev]);
    toast({
        title: "Pass Issued",
        description: `${description} issued to ${user.name} for ₹${amount.toFixed(2)}.`
    });
  }

  const qrData = { id: user.id, type: user.role, name: user.name };
  
  const userForPayment = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown';

  const checkPassStatus = (userId: string) => {
    const passPayments = payments.filter(p => p.userId === userId && p.description.includes('Pass') && p.status === 'Paid');
    if (passPayments.length === 0) return { active: false, expires: null };

    const sortedPasses = passPayments.sort((a, b) => b.date.getTime() - a.date.getTime());
    const lastPass = sortedPasses[0];

    const expiryDate = new Date(lastPass.date);
    if (lastPass.description.includes('1-Day')) expiryDate.setDate(expiryDate.getDate() + 1);
    else if (lastPass.description.includes('7-Day')) expiryDate.setDate(expiryDate.getDate() + 7);
    else if (lastPass.description.includes('1-Month')) expiryDate.setMonth(expiryDate.getMonth() + 1);

    const isActive = expiryDate > new Date();

    return { active: isActive, expires: expiryDate };
  };

  if (view === 'userList') {
    const isApartmentList = listTitle.includes('Apartments');
    const isContractorList = listTitle.includes('Contractors');

    if (selectedUser) {
        const passStatus = checkPassStatus(selectedUser.id);
        const userQrData = { id: selectedUser.id, type: selectedUser.role, name: selectedUser.name };
        return (
            <div>
                 <Button variant="outline" onClick={handleBackToUserList} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to List
                </Button>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    <UserProfileCard user={selectedUser} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Apartment Pass</CardTitle>
                            <CardDescription>QR code for apartment access and pass management.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <QrCodeDisplay 
                                data={userQrData}
                                title="Apartment Pass"
                                description="QR code for apartment access."
                            />
                            <div className="flex items-center justify-between">
                                <Badge variant={passStatus.active ? 'secondary' : 'outline'} className={passStatus.active ? 'bg-green-500 text-white' : ''}>
                                    {passStatus.active ? `Active (Expires ${dateFormatter.format(passStatus.expires!).replace(/ /g, '-')})` : 'Inactive'}
                                </Badge>
                            </div>
                        </CardContent>
                        <CardFooter className="grid grid-cols-3 gap-2">
                             <Button size="sm" variant="outline" onClick={() => handleAddPassPayment(selectedUser, '1day')}>1-Day Pass</Button>
                             <Button size="sm" variant="outline" onClick={() => handleAddPassPayment(selectedUser, '7day')}>7-Day Pass</Button>
                             <Button size="sm" variant="outline" onClick={() => handleAddPassPayment(selectedUser, '1month')}>1-Month Pass</Button>
                        </CardFooter>
                    </Card>
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
                            {isApartmentList && <TableHead>Pass Status</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedUserList.map(u => {
                            const passStatus = checkPassStatus(u.id);
                            return (
                                <TableRow key={u.id} onClick={() => isApartmentList && setSelectedUser(u)} className={isApartmentList ? "cursor-pointer" : ""}>
                                    <TableCell className="font-medium">{u.id}</TableCell>
                                    <TableCell>{u.name}</TableCell>
                                    {isApartmentList && <TableCell>{u.details?.sqft}</TableCell>}
                                    {isApartmentList && <TableCell>
                                        <Badge variant={passStatus.active ? 'secondary' : 'outline'} className={passStatus.active ? 'bg-green-500 text-white' : ''}>
                                            {passStatus.active ? `Active (Expires ${dateFormatter.format(passStatus.expires!).replace(/ /g, '-')})` : 'Inactive'}
                                        </Badge>
                                    </TableCell>}
                                </TableRow>
                            )
                        })}
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
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nonVerifiedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{userForPayment(payment.userId)}</TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>{dateFormatter.format(payment.date).replace(/ /g, '-')}</TableCell>
                    <TableCell className="text-right">₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" onClick={() => handleVerifyPayment(payment.id)}>
                        <Check className="mr-2 h-4 w-4" />
                        Verify
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {nonVerifiedPayments.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No payments to verify.
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
    <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {kpiData.map((kpi, index) => (
                    <Card key={index} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleKpiClick(kpi.role, kpi.title)}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                          <kpi.icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          {typeof kpi.value === 'number' ? (
                            <>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                <p className="text-xs text-muted-foreground">{kpi.role === 'Payments' ? 'awaiting verification' : 'managed in the system'}</p>
                            </>
                          ) : (
                            <div className="flex items-baseline gap-4">
                                {typeof kpi.value.inactive !== 'undefined' && (
                                    <div>
                                        <p className="text-xs text-red-500">Inactive</p>
                                        <div className="text-2xl font-bold text-red-500">{kpi.value.inactive}</div>
                                    </div>
                                )}
                                {typeof kpi.value.withDues !== 'undefined' && (
                                    <div>
                                        <p className="text-xs text-red-500">With Dues</p>
                                        <div className="text-2xl font-bold text-red-500">{kpi.value.withDues}</div>
                                    </div>
                                )}
                                {typeof kpi.value.active !== 'undefined' && (
                                     <div>
                                        <p className="text-xs text-green-700">Active</p>
                                        <div className="text-2xl font-bold text-green-700">{kpi.value.active}</div>
                                    </div>
                                )}
                                {typeof kpi.value.noDues !== 'undefined' && (
                                     <div>
                                        <p className="text-xs text-green-700">No Dues</p>
                                        <div className="text-2xl font-bold text-green-700">{kpi.value.noDues}</div>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <div className="text-2xl font-bold">{kpi.value.total}</div>
                                </div>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5" />
                    Recent Transactions
                </CardTitle>
                <CardDescription>A log of the most recent financial activities across the estate.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {recentTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                        <TableCell>
                            <div className="font-medium">{transaction.user}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{transaction.method}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            ₹{transaction.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                            {dateFormatter.format(transaction.date).replace(/ /g, '-')}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <QrCodeDisplay
                data={qrData}
                title="Your Admin Pass"
                description="This QR code identifies you as an administrator."
            />
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <ScanLine className="h-5 w-5" />
                    Evaluate Pass
                    </CardTitle>
                    <CardDescription>Scan QR codes to verify entry passes.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                    <Link href={`/scan?role=Admin`} passHref>
                    <Button size="lg">
                        <ScanLine className="mr-2 h-5 w-5" />
                        Scan QR Code
                    </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
