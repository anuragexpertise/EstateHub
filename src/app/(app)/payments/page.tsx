'use client';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { users, payments, transactions } from "@/lib/data";
import type { UserRole } from '@/types';
import { CreditCard, ArrowRightLeft } from 'lucide-react';

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;
  const user = users.find(u => u.role === role);

  if (!user || !role) {
    return <p>User role not found.</p>;
  }

  const userPayments = payments
    .filter(p => {
        if (role === 'Admin') return true;
        return p.userId === user.id;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
    
  const userForPayment = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Records
          </CardTitle>
          <CardDescription>
            {role === 'Admin' ? 'A complete log of all payments in the system.' : 'Your personal payment history.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {role === 'Admin' && <TableHead>User</TableHead>}
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userPayments.map((payment) => (
                <TableRow key={payment.id}>
                  {role === 'Admin' && <TableCell className="font-medium">{userForPayment(payment.userId)}</TableCell>}
                  <TableCell className="font-medium">{payment.description}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={payment.status === 'Paid' ? 'secondary' : payment.status === 'Due' ? 'outline' : 'destructive'}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.date.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">₹{payment.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {role === 'Admin' && (
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                All Transactions
            </CardTitle>
            <CardDescription>A detailed log of all financial transactions.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                    <TableCell>
                        <div className="font-medium">{transaction.user}</div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">{transaction.method}</Badge>
                    </TableCell>
                    <TableCell>
                        {transaction.date.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                        ₹{transaction.amount.toLocaleString()}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
