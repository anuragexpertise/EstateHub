
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { expenses as initialExpenses } from "@/lib/data";
import { TrendingDown, PlusCircle, Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { accounts } from '@/lib/data';
import type { Expense } from '@/types';


const expenseFormSchema = z.object({
  accountId: z.string({ required_error: 'Please select an account.' }),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
  description: z.string().min(2, 'Description must be at least 2 characters.'),
});

function NewExpenseCard({ onAddExpense }: { onAddExpense: (expense: Expense) => void }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const form = useForm<z.infer<typeof expenseFormSchema>>({
      resolver: zodResolver(expenseFormSchema),
      defaultValues: {
        amount: 0,
        description: '',
      },
    });

    const handleAddExpense = (values: z.infer<typeof expenseFormSchema>) => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            const account = accounts.find(a => a.id === values.accountId);
            if (!account) {
                toast({ variant: 'destructive', title: 'Error', description: 'Selected account not found.' });
                setIsSubmitting(false);
                return;
            }

            const newExpense: Expense = {
                id: `exp-${Date.now()}`,
                account: account.name,
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
    const [expenses, setExpenses] = useState(initialExpenses);
    const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const handleAddExpense = (newExpense: Expense) => {
        setExpenses(prevExpenses => [newExpense, ...prevExpenses].sort((a, b) => b.date.getTime() - a.date.getTime()));
    }

    return (
        <div className="space-y-6">
            <NewExpenseCard onAddExpense={handleAddExpense} />
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5" />
                        Expenses Log
                    </CardTitle>
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.map(expense => (
                                <TableRow key={expense.id}>
                                    <TableCell>{dateFormatter.format(expense.date).replace(/ /g, '-')}</TableCell>
                                    <TableCell>{expense.account}</TableCell>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell>
                                        <Badge variant={expense.status === 'Paid' ? 'secondary' : 'destructive'}>{expense.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">₹{expense.amount.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                            {expenses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">No expenses recorded.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
