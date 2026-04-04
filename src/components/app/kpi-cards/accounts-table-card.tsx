
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { accounts, payments, expenses } from "@/lib/data";
import type { Account } from "@/types";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function AccountsTableCard() {
    const { toast } = useToast();

    const handleEdit = (account: Account) => {
        toast({
            title: "Edit Account",
            description: `Editing functionality for ${account.name} is not yet implemented.`,
        });
    };

    const handleDelete = (account: Account) => {
        toast({
            variant: "destructive",
            title: "Delete Account",
            description: `Are you sure you want to delete ${account.name}? This action is not yet implemented.`,
        });
    };

    const calculateCurrentBalance = (account: Account) => {
        const credits = payments
            .filter(p => p.accountId === account.id && p.status === 'Paid')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const debits = expenses
            .filter(e => e.accountId === account.id && e.status === 'Paid')
            .reduce((sum, e) => sum + e.amount, 0);

        if (account.type === 'Credit') {
            return account.balanceForward + credits - debits;
        } else { // Debit
            return account.balanceForward + debits - credits;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Accounts</CardTitle>
                <CardDescription>View, edit, or delete financial accounts.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Account Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Brought Forward</TableHead>
                            <TableHead className="text-right">Current Balance</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.map((account) => {
                            const currentBalance = calculateCurrentBalance(account);
                            return (
                                <TableRow key={account.id}>
                                    <TableCell className="font-medium">{account.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={account.type === 'Credit' ? 'secondary' : 'outline'}>{account.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">₹{account.balanceForward.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-right font-semibold">₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(account)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(account)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
