'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { transactions, users } from "@/lib/data";
import type { User, UserRole } from '@/types';
import { ArrowLeft, ArrowRightLeft, Building2, Shield, Users, Wrench, ScanLine } from "lucide-react";
import { QrCodeDisplay } from "../qr-code";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserProfileCard } from './user-profile-card';

const kpiData: { title: string; value: number; icon: React.ElementType; role: UserRole | 'All' }[] = [
    { title: "Total Apartments", value: users.filter(u => u.role === 'Apartment').length, icon: Building2, role: 'Apartment' },
    { title: "Total Contractors", value: users.filter(u => u.role === 'Contractor').length, icon: Wrench, role: 'Contractor' },
    { title: "Security Staff", value: users.filter(u => u.role === 'Security').length, icon: Shield, role: 'Security' },
    { title: "Total Users", value: users.length, icon: Users, role: 'All' },
];

export function AdminDashboard() {
  const [view, setView] = useState<'dashboard' | 'userList'>('dashboard');
  const [selectedUserList, setSelectedUserList] = useState<User[]>([]);
  const [listTitle, setListTitle] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const recentTransactions = transactions.slice(0, 6);
  const user = users.find(u => u.role === 'Admin');
  const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  if (!user) {
    return <p>Admin user not found.</p>;
  }

  const handleKpiClick = (role: UserRole | 'All', title: string) => {
    const userList = role === 'All' ? users : users.filter(u => u.role === role);
    setSelectedUserList(userList);
    setListTitle(title);
    setSelectedUser(userList[0] || null);
    setView('userList');
  }

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedUserList([]);
    setListTitle('');
    setSelectedUser(null);
  }

  const qrData = { id: user.id, type: user.role, name: user.name };

  if (view === 'userList') {
    return (
      <div>
        <Button variant="outline" onClick={handleBackToDashboard} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{listTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {selectedUserList.map(u => (
                    <Button 
                      key={u.id}
                      variant={selectedUser?.id === u.id ? 'secondary' : 'ghost'} 
                      className="justify-start"
                      onClick={() => setSelectedUser(u)}
                    >
                      {u.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            {selectedUser ? (
              <UserProfileCard user={selectedUser} />
            ) : (
              <Card className="flex items-center justify-center h-full">
                <CardContent className="text-center text-muted-foreground">
                  <p>Select a user to view their profile.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
                          <div className="text-2xl font-bold">{kpi.value}</div>
                          <p className="text-xs text-muted-foreground">managed in the system</p>
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
