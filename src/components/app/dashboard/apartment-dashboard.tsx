
'use client';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { users, payments } from "@/lib/data";
import { QrCodeDisplay } from '../qr-code';
import { CreditCard, User, Building } from 'lucide-react';

export function ApartmentDashboard() {
  const searchParams = useSearchParams();
  // In a real app, you'd get the user ID from the session.
  // Here we'll just find the first apartment user.
  const user = users.find(u => u.role === 'Apartment');

  if (!user) {
    return <p>No apartment user found.</p>;
  }

  const userPayments = payments.filter(p => p.userId === user.id).sort((a, b) => b.date.getTime() - a.date.getTime());
  const qrData = { id: user.id, type: user.role, name: user.name };
  const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const nextPaymentDate = userPayments.find(p => p.status === 'Due')?.date;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Welcome, {user.name}!
            </CardTitle>
            <CardDescription>Your personal dashboard for EstateHub.</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <Building className="h-8 w-8 text-primary" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Apartment Unit</p>
                <p className="text-2xl font-semibold text-muted-foreground">{user.details?.unit}</p>
              </div>
            </div>
             <div className="flex items-center space-x-4 rounded-md border p-4">
              <CreditCard className="h-8 w-8 text-primary" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Next Maintenance Due</p>
                <p className="text-2xl font-semibold text-muted-foreground">
                  {nextPaymentDate ? dateFormatter.format(nextPaymentDate).replace(/ /g, '-') : 'N/A'}
                </p>
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
                      <Badge variant={payment.status === 'Paid' ? 'secondary' : 'destructive'}>{payment.status}</Badge>
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
          title="Your Identity Pass"
          description="Present this QR code to security for verification."
        />
      </div>
    </div>
  );
}
