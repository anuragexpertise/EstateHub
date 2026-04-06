'use client';
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, PlusCircle, Loader2, ArrowLeft, Check, X } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { accounts, users, roleDisplayNames } from '@/lib/data';
import type { Expense, Account, UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, Timestamp } from 'firebase/firestore';


const expenseFormSchema = z.object({
  accountId: z.string({ required_error: 'Please select an account.' }),
  userId: z.string().optional(),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
  description: z.string().min(2, 'Description must be at least 2 characters.'),
});

function NewExpenseCard({ role }: { role: UserRole | null }) {
    const { toast } = useToast();
    const { firestore, user, isUserLoading } = useFirebase();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [selectedAccount, setSelectedAccount] = React.useState<Account | null>(null);
    const [selectedRole, setSelectedRole] = React.useState<UserRole | null>(null);
  
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
            const account = accounts.find(a => a.id === accountId) || null;
            setSelectedAccount(account);
            setSelectedRole(null);
            form.resetField('userId');
            if (account?.subAccountOf?.length === 1) {
                setSelectedRole(account.subAccountOf[0]);
            }
        } else {
            setSelectedAccount(null);
            setSelectedRole(null);
            form.resetField('userId');
        }
    }, [accountId, form]);
    
    React.useEffect(() => {
        form.resetField('userId');
    }, [selectedRole, form]);

    const handleAddExpense = (values: z.infer<typeof expenseFormSchema>) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to add an expense.' });
            return;
        }
        setIsSubmitting(true);
        const account = accounts.find(a => a.id === values.accountId);
        if (!account) {
            toast({ variant: 'destructive', title: 'Error', description: 'Selected account not found.' });
            setIsSubmitting(false);
            return;
        }

        if (account?.subAccountOf?.length && !values.userId) {
            toast({
                variant: 'destructive',
                title: "Validation Error",
                description: `Please select an entity for the ${account.name} account.`,
            });
            setIsSubmitting(false);
            return;
        }

        const newExpense = {
            accountId: values.accountId,
            userId: values.userId || 'system',
            amount: values.amount,
            description: values.description,
            date: serverTimestamp(),
            status: role === 'Admin' ? 'Paid' : 'Pending',
        };

        const expensesCol = collection(firestore, 'expenses');
        addDocumentNonBlocking(expensesCol, newExpense);

        toast({
            title: "Expense Recorded",
            description: `Expense of ₹${values.amount} for ${values.description} has been recorded as ${newExpense.status}.`,
        });
        form.reset();
        setSelectedAccount(null);
        setSelectedRole(null);
        setIsSubmitting(false);
      }
      
    const getSubAccountUsers = () => {
        if (!selectedRole) return [];
        return users.filter(u => u.role === selectedRole);
    }

    const debitAccounts = accounts.filter(a => a.type === 'Debit');
    const subAccounts = debitAccounts.filter(a => a.subAccountOf && a.subAccountOf.length > 0);
    const commonAccounts = debitAccounts.filter(a => !a.subAccountOf || a.subAccountOf.length === 0);
  
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
                                    {subAccounts.length > 0 && (
                                        <SelectGroup>
                                            <SelectLabel>Entity-Specific Accounts</SelectLabel>
                                            {subAccounts.map((a) => (
                                                <SelectItem key={a.id} value={a.id}>
                                                    {a.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    )}
                                    {commonAccounts.length > 0 && (
                                        <SelectGroup>
                                            <SelectLabel>Common Accounts</SelectLabel>
                                            {commonAccounts.map((a) => (
                                                <SelectItem key={a.id} value={a.id}>
                                                    {a.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    )}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        {selectedAccount?.subAccountOf && selectedAccount.subAccountOf.length > 1 && (
                             <FormItem>
                                <FormLabel>Entity Role</FormLabel>
                                <Select onValueChange={(value: UserRole) => setSelectedRole(value)} value={selectedRole || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an entity role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {selectedAccount.subAccountOf.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {roleDisplayNames[role]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                        {selectedAccount?.subAccountOf && selectedRole && (
                            <FormField
                                control={form.control}
                                name="userId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Entity</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder={`Select a ${roleDisplayNames[selectedRole]}`} />
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
                        <Button type="submit" disabled={isSubmitting || isUserLoading}>
                            {(isSubmitting || isUserLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Expense
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

function ExpensesPageContent() {
    const { firestore } = useFirebase();
    const { user, isUserLoading: isAuthLoading } = useUser();
    const expensesQuery = useMemoFirebase(() => user ? collection(firestore, 'expenses') : null, [firestore, user]);
    const { data: allExpenses, isLoading } = useCollection<Expense>(expensesQuery);
    
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = searchParams.get('role') as UserRole | null;
    const status = searchParams.get('status');
    const { toast } = useToast();

    const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    const accountName = (accountId: string) => accounts.find(a => a.id === accountId)?.name || 'N/A';

    const handleVerifyExpense = (expenseId: string) => {
        const expenseDoc = doc(firestore, 'expenses', expenseId);
        updateDocumentNonBlocking(expenseDoc, { status: 'Paid' });
        toast({ title: "Expense Verified", description: "The expense has been marked as paid." });
    };

    const handleRejectExpense = (expenseId: string) => {
        const expenseDoc = doc(firestore, 'expenses', expenseId);
        updateDocumentNonBlocking(expenseDoc, { status: 'Rejected' });
        toast({ variant: "destructive", title: "Expense Rejected", description: "The expense has been marked as rejected." });
    };

    const {filteredExpenses, listTitle} = React.useMemo(() => {
        let expenses = allExpenses || [];
        let title = 'Expenses Log';
        if (status === 'pending') {
            expenses = expenses.filter(e => e.status === 'Pending');
            title = 'Pending Expenses';
        } else if (status === 'paid') {
            expenses = expenses.filter(e => e.status === 'Paid');
            title = 'Paid Expenses';
        }
        
        const sorted = expenses.sort((a, b) => {
            const dateA = a.date ? (a.date as Timestamp).toMillis() : 0;
            const dateB = b.date ? (b.date as Timestamp).toMillis() : 0;
            return dateB - dateA;
        });

        return {filteredExpenses: sorted, listTitle: title};
    }, [allExpenses, status]);

    if (!user && !isAuthLoading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be logged in to view this page.</p>
          </CardContent>
        </Card>
      )
    }

    if (isAuthLoading || isLoading) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-6">
            <NewExpenseCard role={role} />
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
                                <TableRow key={expense.id} className={cn("whitespace-normal break-words", index % 2 === 0 && "bg-muted/50")}>
                                    <TableCell>{expense.date ? dateTimeFormatter.format((expense.date as Timestamp).toDate()).replace(',', '') : 'Pending...'}</TableCell>
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

function PageSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
}

export default function ExpensesPage() {
    return (
        <React.Suspense fallback={<PageSkeleton/>}>
            <ExpensesPageContent />
        </React.Suspense>
    );
}
