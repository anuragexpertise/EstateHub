
'use client';
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { users, payments as initialPayments, roleDisplayNames, accounts } from "@/lib/data";
import type { UserRole, Payment, Account } from '@/types';
import { Receipt, Check, PlusCircle, Loader2, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useGlobalStore } from '@/hooks/use-global-store';
import { ChargesAndPaymentHistoryCard } from './charges-payment-history-card';
import { cn } from '@/lib/utils';

const paymentFormSchema = z.object({
  accountId: z.string({ required_error: 'Please select an account.' }),
  userId: z.string().optional(),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
  description: z.string().min(2, 'Description must be at least 2 characters.'),
});

export function PaymentHistoryCard() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const role = searchParams.get('role') as UserRole | null;
    const status = searchParams.get('status');
  
    if(role === 'Apartment') {
        return <ChargesAndPaymentHistoryCard />;
    }

    const user = users.find(u => u.role === role);
  
    const [payments, setPayments] = React.useState<Payment[]>(initialPayments);
    const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  
    if (!user || !role) {
      return <Card><CardContent><p>User role not found.</p></CardContent></Card>;
    }

    const handleVerifyPayment = (paymentId: string) => {
        const paymentIndex = initialPayments.findIndex(p => p.id === paymentId);
        if (paymentIndex > -1) initialPayments[paymentIndex].status = 'Paid';
        setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Paid' } : p));
        toast({ title: "Payment Verified", description: "The payment has been marked as paid." });
    }
    
    const handleRejectPayment = (paymentId: string) => {
        const paymentIndex = initialPayments.findIndex(p => p.id === paymentId);
        if (paymentIndex > -1) initialPayments[paymentIndex].status = 'Rejected';
        setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Rejected' } : p));
        toast({ variant: 'destructive', title: "Payment Rejected", description: "The payment has been marked as rejected." });
    }

    const { filteredPayments, listTitle } = React.useMemo(() => {
        let title = (role === 'Admin' || role === 'Security') ? 'Receipts' : 'Payment History';
        let filtered = payments;

        if (role === 'Admin' || role === 'Security') {
            if (status === 'pending') {
                filtered = payments.filter(p => p.status === 'Pending Verification');
                title = 'Pending Receipts';
            } else if (status === 'verified') {
                filtered = payments.filter(p => p.status === 'Paid');
                title = 'Verified Receipts';
            }
        } else {
            filtered = payments.filter(p => p.userId === user.id);
        }

        return {
            filteredPayments: filtered.sort((a, b) => b.date.getTime() - a.date.getTime()),
            listTitle: title
        };
    }, [payments, role, status, user]);
    
    const userForPayment = (userId: string) => {
        const paymentUser = users.find(u => u.id === userId);
        if (!paymentUser) return 'Unknown';
        return `${paymentUser.name} (${roleDisplayNames[paymentUser.role]})`;
    };
  
    return (
      <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                {status && (
                    <Button variant="outline" size="icon" onClick={() => router.push('/payments?role=Admin')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    {listTitle}
                </CardTitle>
            </div>
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
              {filteredPayments.map((payment, index) => (
                <TableRow key={payment.id} className={cn(index % 2 === 0 && "bg-muted/50")}>
                  {(role === 'Admin' || role === 'Security') && <TableCell className="font-medium">{userForPayment(payment.userId)}</TableCell>}
                  <TableCell className="font-medium">{payment.description}</TableCell>
                  <TableCell>
                    <Badge 
                        variant={payment.status === 'Paid' ? 'secondary' : payment.status === 'Due' || payment.status === 'Overdue' || payment.status === 'Rejected' ? 'destructive' : 'default'}
                        className={cn(payment.status === 'Pending Verification' && 'bg-amber-500 text-white hover:bg-amber-500/80', payment.status === 'Paid' && 'bg-green-600 text-white hover:bg-green-600/80')}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{dateTimeFormatter.format(payment.date).replace(',', '')}</TableCell>
                  <TableCell className="text-right">₹{payment.amount.toLocaleString()}</TableCell>
                  {role === 'Admin' && (
                      <TableCell className="text-center">
                          {payment.status === 'Pending Verification' && (
                              <div className="flex items-center justify-center gap-2">
                                  <Button size="sm" onClick={() => handleVerifyPayment(payment.id)}>
                                      <Check className="mr-2 h-4 w-4" />
                                      Verify
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleRejectPayment(payment.id)}>
                                    <X className="mr-2 h-4 w-4" />
                                    Reject
                                  </Button>
                              </div>
                          )}
                      </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredPayments.length === 0 && (
                <TableRow>
                    <TableCell colSpan={(role === 'Admin' || role === 'Security') ? (role === 'Admin' ? 6 : 5) : 4} className="text-center text-muted-foreground py-4">No payments found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
}

export function PaymentsCard() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const role = searchParams.get('role') as UserRole | null;
    const [payments, setPayments] = React.useState<Payment[]>(initialPayments);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { receiptQrUrl } = useGlobalStore();
    const [selectedAccount, setSelectedAccount] = React.useState<Account | null>(null);
  
    const form = useForm<z.infer<typeof paymentFormSchema>>({
      resolver: zodResolver(paymentFormSchema),
      defaultValues: {
        amount: 0,
        description: '',
      },
    });

    const accountId = form.watch('accountId');

    React.useEffect(() => {
        if(accountId) {
            setSelectedAccount(accounts.find(a => a.id === accountId) || null);
        } else {
            setSelectedAccount(null);
        }
    }, [accountId]);


    const handleAddPayment = (values: z.infer<typeof paymentFormSchema>) => {
        if (selectedAccount?.subAccountOf?.length && !values.userId) {
            toast({
                variant: 'destructive',
                title: "Validation Error",
                description: `Please select an entity for the ${selectedAccount.name} account.`,
            });
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            const newPayment: Payment = {
                id: `pay-${Date.now()}`,
                accountId: values.accountId,
                userId: values.userId || 'system',
                amount: values.amount,
                description: values.description,
                date: new Date(),
                status: role === 'Admin' ? 'Paid' : 'Pending Verification',
            };
    
            setPayments(prev => [newPayment, ...prev]);
            toast({
                title: "Payment Recorded",
                description: `Payment of ₹${values.amount} for ${values.userId ? users.find(u => u.id === values.userId)?.name : 'system'} has been recorded.`,
            });
            form.reset();
            setSelectedAccount(null);
            setIsSubmitting(false);
        }, 1000);
      }
    
    const getSubAccountUsers = () => {
        if (!selectedAccount || !selectedAccount.subAccountOf || selectedAccount.subAccountOf.length === 0) {
            return [];
        }
        return users.filter(u => selectedAccount.subAccountOf!.includes(u.role));
    }
  
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    Enter New Receipt
                </CardTitle>
                <CardDescription>Record a new payment received. Users can scan the QR code to pay.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddPayment)} className="space-y-6">
                             <FormField
                                control={form.control}
                                name="accountId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account</FormLabel>
                                    <Select onValueChange={(value) => {
                                        field.onChange(value);
                                        form.resetField('userId');
                                    }} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a credit account" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {accounts.filter(a => a.type === 'Credit').map((a) => (
                                            <SelectItem key={a.id} value={a.id}>
                                                {a.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            {selectedAccount && selectedAccount.subAccountOf && selectedAccount.subAccountOf.length > 0 && (
                                <FormField
                                    control={form.control}
                                    name="userId"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Entity</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder={`Select a ${roleDisplayNames[selectedAccount.subAccountOf![0]]}`} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {getSubAccountUsers().map((u) => (
                                                <SelectItem key={u.id} value={u.id}>
                                                    {u.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Monthly Maintenance" {...field} />
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
                                Add Receipt
                            </Button>
                        </form>
                    </Form>
                    {receiptQrUrl && (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <Label className="text-center text-muted-foreground">Scan to Pay</Label>
                            <div className="p-4 bg-white rounded-lg shadow-md border">
                                <Image 
                                    src={receiptQrUrl}
                                    alt="Receipt QR Code"
                                    width={200}
                                    height={200}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
