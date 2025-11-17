'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { users, payments as initialPayments } from "@/lib/data";
import type { UserRole, Payment } from '@/types';
import { CreditCard, ArrowRightLeft, Check, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const paymentFormSchema = z.object({
  userId: z.string({ required_error: 'Please select a user.' }),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
  description: z.string().min(2, 'Description must be at least 2 characters.'),
});

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const role = searchParams.get('role') as UserRole | null;
  const user = users.find(u => u.role === role);

  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dateFormatter = new Intl.DateTimeFormat();

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 0,
      description: '',
    },
  });

  if (!user || !role) {
    return <p>User role not found.</p>;
  }
  
  const handleAddPayment = (values: z.infer<typeof paymentFormSchema>) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        const newPayment: Payment = {
            id: `pay-${Date.now()}`,
            userId: values.userId,
            amount: values.amount,
            description: values.description,
            date: new Date(),
            status: role === 'Admin' ? 'Paid' : 'Pending Verification',
        };

        setPayments(prev => [newPayment, ...prev]);
        toast({
            title: "Payment Recorded",
            description: `Payment of ₹${values.amount} for ${users.find(u => u.id === values.userId)?.name} has been recorded.`,
        });
        form.reset();
        setIsSubmitting(false);
    }, 1000);
  }

  const handleVerifyPayment = (paymentId: string) => {
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Paid' } : p));
    toast({
        title: "Payment Verified",
        description: "The payment has been marked as paid.",
    });
  }

  const userPayments = payments
    .filter(p => {
        if (role === 'Admin' || role === 'Security') return true;
        return p.userId === user.id;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
    
  const userForPayment = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown';
  
  const canEnterPayments = role === 'Admin' || role === 'Security';

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-6">
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
                  {(role === 'Admin' || role === 'Security') && <TableHead>User</TableHead>}
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {role === 'Admin' && <TableHead className="text-center">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {userPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    {(role === 'Admin' || role === 'Security') && <TableCell className="font-medium">{userForPayment(payment.userId)}</TableCell>}
                    <TableCell className="font-medium">{payment.description}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={payment.status === 'Paid' ? 'secondary' : payment.status === 'Due' ? 'outline' : payment.status === 'Pending Verification' ? 'default' : 'destructive'}
                        className={payment.status === 'Pending Verification' ? 'bg-amber-500 text-white' : ''}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{dateFormatter.format(payment.date)}</TableCell>
                    <TableCell className="text-right">₹{payment.amount.toLocaleString()}</TableCell>
                    {role === 'Admin' && (
                        <TableCell className="text-center">
                            {payment.status === 'Pending Verification' && (
                                <Button size="sm" onClick={() => handleVerifyPayment(payment.id)}>
                                    <Check className="mr-2 h-4 w-4" />
                                    Verify
                                </Button>
                            )}
                        </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {canEnterPayments && (
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5" />
                        Enter New Payment
                    </CardTitle>
                    <CardDescription>Record a new payment received.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddPayment)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="userId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a user to bill" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={u.id}>
                                                {u.name} ({u.role})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Monthly Dues" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount (₹)</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Payment
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
