
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { expenses } from "@/lib/data";
import { TrendingDown } from "lucide-react";

export default function ExpensesPage() {
    const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Expenses (Debits)
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
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
