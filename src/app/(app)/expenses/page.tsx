
'use client';
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { expenses as initialExpenses } from "@/lib/data";
import { TrendingDown, PlusCircle, Loader2, ArrowLeft, Check, X } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { accounts, users, roleDisplayNames } from '@/lib/data';
import type { Expense, Account } from '@/types';
import { cn } from '@/lib/utils';


const expenseFormSchema = z.object({
  accountId: z.string({ required_error: 'Please select an account.' }),
  userId: z.string().optional(),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
  description: z.string().min(2, 'Description must be at least 2 characters.'),
});

function NewExpenseCard({ onAddExpense }: { onAddExpense: (expense: Expense) => void }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [selectedAccount, setSelectedAccount] = React.useState<Account | null>(null);
  
    const form = useForm<z.infer<typeof expenseFormSchema>>({
      resolver: zodResolver(expenseFormSchema),
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

    const handleAddExpense = (values: z.infer<typeof expenseFormSchema>) => {
        setIsSubmitting(true);
        setTimeout(() => {
            const account = accounts.find(a => a.id === values.accountId);
            if (!account) {
                toast({ variant: 'destructive', title: 'Error', description: 'Selected account not found.' });
                setIsSubmitting(false);
                return;
            }

            const newExpense: Expense = {
                id: `exp-${Date.now()}`,
                accountId: values.accountId,
                userId: values.userId,
                amount: values.amount,
                description: values.description,
                date: new Date(),
                status: 'Pending',
            };
    
            onAddExpense(newExpense);
    
            toast({
                title: "Expense Recorded",
                description: `Expense of ₹${values.amount} for ${values.description} has been recorded as pending.`,
            });
            form.reset();
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
                    Enter New Expense
                </CardTitle>
                <CardDescription>Record a new expense or payment made by the society.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddExpense)} className="space-y-6 max-w-md">
                        <FormField
                            control={form.control}
                            name="accountId"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account</FormLabel>
                                <Select onValueChange={(value) => {
                                    field.onChange(value);
                                    setSelectedAccount(accounts.find(a => a.id === value) || null);
                                    form.resetField('userId');
                                }} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select a debit account" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {accounts.filter(a => a.type === 'Debit').map((a) => (
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
                                <Input placeholder="e.g., Security staff salaries" {...field} />
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
                            Add Expense
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}


export default function ExpensesPage() {
    const [allExpenses, setAllExpenses] = React.useState(initialExpenses);
    const searchParams = useSearchParams();
    const router = useRouter();
    const status = searchParams.get('status');
    const { toast } = useToast();

    const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    const handleAddExpense = (newExpense: Expense) => {
        setAllExpenses(prevExpenses => [newExpense, ...prevExpenses].sort((a, b) => b.date.getTime() - a.date.getTime()));
    }
    
    const accountName = (accountId: string) => accounts.find(a => a.id === accountId)?.name || 'N/A';

    const handleVerifyExpense = (expenseId: string) => {
        const expenseIndex = allExpenses.findIndex(e => e.id === expenseId);
        if (expenseIndex > -1) initialExpenses[expenseIndex].status = 'Paid';
        setAllExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, status: 'Paid' } : e));
        toast({ title: "Expense Verified", description: "The expense has been marked as paid." });
    };

    const handleRejectExpense = (expenseId: string) => {
        const expenseIndex = allExpenses.findIndex(e => e.id === expenseId);
        if (expenseIndex > -1) initialExpenses[expenseIndex].status = 'Rejected';
        setAllExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, status: 'Rejected' } : e));
        toast({ variant: "destructive", title: "Expense Rejected", description: "The expense has been marked as rejected." });
    };

    const {filteredExpenses, listTitle} = React.useMemo(() => {
        let expenses = allExpenses;
        let title = 'Expenses Log';
        if (status === 'pending') {
            expenses = expenses.filter(e => e.status === 'Pending');
            title = 'Pending Expenses';
        } else if (status === 'paid') {
            expenses = expenses.filter(e => e.status === 'Paid');
            title = 'Paid Expenses';
        }
        return {filteredExpenses: expenses, listTitle: title};
    }, [allExpenses, status]);

    return (
        <div className="space-y-6">
            <NewExpenseCard onAddExpense={handleAddExpense} />
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        {status && (
                            <Button variant="outline" size="icon" onClick={() => router.push('/expenses?role=Admin')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5" />
                            {listTitle}
                        </CardTitle>
                    </div>
                    <CardDescription>
                        A log of all payments and expenses made by the society.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredExpenses.map((expense, index) => (
                                <TableRow key={expense.id} className={cn(index % 2 === 0 && "bg-muted/50")}>
                                    <TableCell>{dateTimeFormatter.format(expense.date).replace(',', '')}</TableCell>
                                    <TableCell>{accountName(expense.accountId)}</TableCell>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell>
                                        <Badge variant={expense.status === 'Paid' ? 'secondary' : expense.status === 'Rejected' ? 'destructive' : 'default'} className={cn(expense.status === 'Pending' && 'bg-amber-500 text-white hover:bg-amber-500/80', expense.status === 'Paid' && 'bg-green-600 text-white hover:bg-green-600/80')}>
                                            {expense.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-red-600">₹{expense.amount.toLocaleString()}</TableCell>
                                    <TableCell className="text-center">
                                        {expense.status === 'Pending' && (
                                            <div className="flex items-center justify-center gap-2">
                                                <Button size="sm" onClick={() => handleVerifyExpense(expense.id)}>
                                                    <Check className="mr-2 h-4 w-4" /> Verify
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleRejectExpense(expense.id)}>
                                                    <X className="mr-2 h-4 w-4" /> Reject
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredExpenses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-4">No expenses recorded.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
