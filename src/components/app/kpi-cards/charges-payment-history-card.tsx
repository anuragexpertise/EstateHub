
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { users, payments, rates } from "@/lib/data";
import { useGlobalStore } from "@/hooks/use-global-store";
import { eachMonthOfInterval, startOfMonth, endOfMonth, format, isAfter, addDays } from 'date-fns';
import { Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

type LedgerItem = {
    date: Date;
    description: string;
    debit: number;
    credit: number;
    balance: number;
    type: 'charge' | 'payment' | 'fine';
};

export function ChargesAndPaymentHistoryCard() {
    const { calculationStartDate } = useGlobalStore();
    const user = users.find(u => u.role === 'Apartment');

    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Charges & Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>No apartment user found.</p>
                </CardContent>
            </Card>
        );
    }

    if (!calculationStartDate || !user.details?.sqft) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Charges & Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Arrears calculation start date is not set in global settings, or user has no sqft details.</p>
                </CardContent>
            </Card>
        );
    }
    
    const ledger: LedgerItem[] = [];
    let runningBalance = 0;

    const startDate = startOfMonth(new Date(calculationStartDate));
    const today = new Date();
    const monthlyCharge = user.details.sqft * rates.apartment['1month'];
    
    const userPayments = payments
        .filter(p => p.userId === user.id && p.description.includes('Maintenance') && p.status === 'Paid')
        .map(p => ({ ...p, type: 'payment' as const }));

    const monthlyCharges = eachMonthOfInterval({ start: startDate, end: today }).map(month => ({
        date: startOfMonth(month),
        dueDate: endOfMonth(month),
        amount: monthlyCharge,
        type: 'charge' as const,
        description: `${format(month, 'MMMM yyyy')} Maintenance`,
        month: month
    }));

    const combined = [...userPayments, ...monthlyCharges].sort((a, b) => a.date.getTime() - b.date.getTime());
    const processedFines = new Set<string>(); // To track which months have had a fine applied

    for (const item of combined) {
        // Before processing the current item, check if any previous months are overdue
        for (const charge of monthlyCharges) {
            const fineKey = format(charge.month, 'yyyy-MM');
            if (!processedFines.has(fineKey) && runningBalance < 0 && isAfter(item.date, charge.dueDate)) {
                // Apply one-time late fee
                runningBalance -= rates.fines.latePaymentFee;
                ledger.push({
                    date: addDays(charge.dueDate, 1),
                    description: `Late Fee for ${format(charge.month, 'MMMM yyyy')}`,
                    debit: rates.fines.latePaymentFee,
                    credit: 0,
                    balance: runningBalance,
                    type: 'fine'
                });

                processedFines.add(fineKey); 
            }
        }
        
        if (item.type === 'charge') {
            runningBalance -= item.amount;
            ledger.push({
                date: item.date,
                description: item.description,
                debit: item.amount,
                credit: 0,
                balance: runningBalance,
                type: 'charge'
            });
        } else if (item.type === 'payment') {
            runningBalance += item.amount;
            ledger.push({
                date: item.date,
                description: 'Payment Received',
                debit: 0,
                credit: item.amount,
                balance: runningBalance,
                type: 'payment'
            });
        }
    }
    
     // Final check for any overdue months up to today
    for (const charge of monthlyCharges) {
        const fineKey = format(charge.month, 'yyyy-MM');
        if (!processedFines.has(fineKey) && runningBalance < 0 && isAfter(today, charge.dueDate)) {
            runningBalance -= rates.fines.latePaymentFee;
            ledger.push({
                date: addDays(charge.dueDate, 1),
                description: `Late Fee for ${format(charge.month, 'MMMM yyyy')}`,
                debit: rates.fines.latePaymentFee,
                credit: 0,
                balance: runningBalance,
                type: 'fine'
            });
            processedFines.add(fineKey);
        }
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Charges & Payment History
                </CardTitle>
                <CardDescription>
                    A detailed log of your maintenance charges, fines, and payments.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Charge (Debit)</TableHead>
                            <TableHead className="text-right">Payment (Credit)</TableHead>
                            <TableHead className="text-right">Running Balance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ledger.sort((a,b) => a.date.getTime() - b.date.getTime()).map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{format(item.date, 'dd-MMM-yyyy')}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="text-right">
                                    {item.debit > 0 ? `₹${item.debit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.credit > 0 ? `₹${item.credit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                                </TableCell>
                                <TableCell className={cn("text-right font-semibold", item.balance < 0 ? "text-destructive" : "text-green-600")}>
                                     ₹{item.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                            </TableRow>
                        ))}
                         {ledger.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    No charges or payments recorded yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
