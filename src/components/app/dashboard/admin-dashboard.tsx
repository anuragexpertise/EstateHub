'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { transactions, users } from "@/lib/data";
import { ArrowRightLeft, Building2, Shield, Users, Wrench, ScanLine } from "lucide-react";
import { QrCodeDisplay } from "../qr-code";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const kpiData = [
    { title: "Total Residents", value: users.filter(u => u.role === 'Apartment').length, icon: Building2 },
    { title: "Total Contractors", value: users.filter(u => u.role === 'Contractor').length, icon: Wrench },
    { title: "Security Staff", value: users.filter(u => u.role === 'Security').length, icon: Shield },
    { title: "Total Users", value: users.length, icon: Users },
]

export function AdminDashboard() {
  const recentTransactions = transactions.slice(0, 6);
  const user = users.find(u => u.role === 'Admin');

  if (!user) {
    return <p>Admin user not found.</p>;
  }

  const qrData = { id: user.id, type: user.role, name: user.name };
  const dateFormatter = new Intl.DateTimeFormat();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {kpiData.map((kpi, index) => (
                    <Card key={index}>
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
                            {dateFormatter.format(transaction.date)}
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
