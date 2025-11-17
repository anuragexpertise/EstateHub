'use client';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { users, payments } from "@/lib/data";
import { QrCodeDisplay } from '../qr-code';
import { CreditCard, User, Wrench } from 'lucide-react';

export function ContractorDashboard() {
  const searchParams = useSearchParams();
  const user = users.find(u => u.role === 'Contractor');

  if (!user) {
    return <p>No contractor user found.</p>;
  }

  const userPayments = payments.filter(p => p.userId === user.id).sort((a, b) => b.date.getTime() - a.date.getTime());
  const qrData = { id: user.id, type: user.role, name: user.name };
  const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Welcome, {user.name}!
            </CardTitle>
            <CardDescription>Your contractor portal for EstateHub.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <Wrench className="h-8 w-8 text-primary" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Service Type</p>
                <p className="text-2xl font-semibold text-muted-foreground">{user.details?.service}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.description}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'Paid' ? 'secondary' : 'default'}>{payment.status}</Badge>
                    </TableCell>
                    <TableCell>{dateFormatter.format(payment.date).replace(/ /g, '-')}</TableCell>
                    <TableCell className="text-right">₹{payment.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <QrCodeDisplay
          data={qrData}
          title="Your Vendor Pass"
          description="Present this QR code to security for site access."
        />
      </div>
    </div>
  );
}
