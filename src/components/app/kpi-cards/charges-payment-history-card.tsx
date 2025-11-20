
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { users, payments, rates } from "@/lib/data";
import { useGlobalStore } from "@/hooks/use-global-store";
import { eachMonthOfInterval, startOfMonth, format, isAfter, differenceInDays } from 'date-fns';
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
    
    let runningBalance = 0;
    const ledger: LedgerItem[] = [];

    const startDate = startOfMonth(new Date(calculationStartDate));
    const today = new Date();
    const monthlyCharge = user.details.sqft * rates.apartment['1month'];
    
    const userPayments = payments
        .filter(p => p.userId === user.id && p.description.includes('Maintenance') && p.status === 'Paid')
        .map(p => ({ date: p.date, amount: p.amount, type: 'payment' as const, description: 'Payment Received' }));

    const monthlyCharges = eachMonthOfInterval({ start: startDate, end: today }).map(month => ({
        date: startOfMonth(month),
        amount: monthlyCharge,
        type: 'charge' as const,
        description: `${format(month, 'MMMM yyyy')} Maintenance`,
    }));

    const combined = [...userPayments, ...monthlyCharges].sort((a, b) => a.date.getTime() - b.date.getTime());

    let balanceBeforePayment = 0;

    for (const item of combined) {
        if (item.type === 'charge') {
            runningBalance -= item.amount;
            balanceBeforePayment = runningBalance + item.amount; // Balance right before this charge
            
            ledger.push({
                date: item.date,
                description: item.description,
                debit: item.amount,
                credit: 0,
                balance: runningBalance,
                type: 'charge'
            });
        } else if (item.type === 'payment') {
            const chargeMonthStart = startOfMonth(item.date);
            const correspondingCharge = monthlyCharges.find(c => c.date.getTime() === chargeMonthStart.getTime());
            
            // Check if this payment is late
            if (correspondingCharge && isAfter(item.date, correspondingCharge.date)) {
                
                // 1. Add Fixed Late Fee if not already added for this month and balance was negative
                const lateFeeDescription = `Late Fee for ${format(chargeMonthStart, 'MMMM yyyy')}`;
                if (!ledger.some(l => l.description === lateFeeDescription) && balanceBeforePayment < 0) {
                    runningBalance -= rates.fines.latePaymentFee;
                    ledger.push({
                        date: item.date, // Fine applied on payment date
                        description: lateFeeDescription,
                        debit: rates.fines.latePaymentFee,
                        credit: 0,
                        balance: runningBalance,
                        type: 'fine'
                    });
                }
                
                // 2. Add Daily Fine
                const lateDays = differenceInDays(item.date, correspondingCharge.date);
                if (lateDays > 0) {
                    const dailyFineRate = (correspondingCharge.amount * rates.fines.finePercentPerDay) / 100;
                    const totalDailyFine = lateDays * dailyFineRate;
                    runningBalance -= totalDailyFine;
                     ledger.push({
                        date: item.date, // Fine applied on payment date
                        description: `Daily Fine for ${format(chargeMonthStart, 'MMMM yyyy')} (${lateDays} days)`,
                        debit: totalDailyFine,
                        credit: 0,
                        balance: runningBalance,
                        type: 'fine'
                    });
                }
            }

            // Finally, process the payment
            runningBalance += item.amount;
            ledger.push({
                date: item.date,
                description: item.description,
                debit: 0,
                credit: item.amount,
                balance: runningBalance,
                type: 'payment'
            });
             balanceBeforePayment = runningBalance;
        }
    }
    
    const sortedLedger = ledger.sort((a,b) => a.date.getTime() - b.date.getTime());


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
                        {sortedLedger.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{format(item.date, 'dd-MMM-yyyy')}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="text-right text-red-600">
                                    {item.debit > 0 ? `₹${item.debit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                                </TableCell>
                                <TableCell className="text-right text-green-600">
                                    {item.credit > 0 ? `₹${item.credit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                                </TableCell>
                                <TableCell className={cn(
                                    "text-right font-semibold",
                                    item.balance < 0 ? "text-destructive" : "text-green-600"
                                )}>
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
