
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { users, payments, rates } from "@/lib/data";
import { useGlobalStore } from "@/hooks/use-global-store";
import { eachMonthOfInterval, startOfMonth, endOfMonth, format } from 'date-fns';
import { Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

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
    
    const ledger: { date: Date; description: string; debit: number; credit: number; balance: number }[] = [];
    let runningBalance = 0;

    const startDate = startOfMonth(new Date(calculationStartDate));
    const today = new Date();
    const monthlyCharge = user.details.sqft * rates.apartment['1month'];
    
    const userPayments = payments
        .filter(p => p.userId === user.id && p.description.includes('Maintenance') && p.status === 'Paid')
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    let paymentIndex = 0;

    const monthsToProcess = eachMonthOfInterval({ start: startDate, end: today });

    for (const month of monthsToProcess) {
        // Add monthly charge
        runningBalance += monthlyCharge;
        ledger.push({
            date: startOfMonth(month),
            description: `${format(month, 'MMMM yyyy')} Maintenance`,
            debit: monthlyCharge,
            credit: 0,
            balance: runningBalance
        });

        const endOfMonthForDues = endOfMonth(month);

        // Check for payments made within the month (or for this month)
        while (paymentIndex < userPayments.length) {
            const payment = userPayments[paymentIndex];
            
            // Assuming payments are for the oldest outstanding debt
            const isLate = payment.date > endOfMonthForDues;

            // Apply payment
            runningBalance -= payment.amount;
             ledger.push({
                date: payment.date,
                description: 'Payment Received',
                debit: 0,
                credit: payment.amount,
                balance: runningBalance
            });

            if(isLate && runningBalance + payment.amount > 0) { // Payment was late for a due amount
                runningBalance += rates.fines.latePaymentFee;
                 ledger.push({
                    date: payment.date,
                    description: 'Late Payment Fine',
                    debit: rates.fines.latePaymentFee,
                    credit: 0,
                    balance: runningBalance
                });
            }
            
            paymentIndex++;
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
                                <TableCell className={cn("text-right font-semibold", item.balance > 0 ? "text-destructive" : "text-green-600")}>
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
