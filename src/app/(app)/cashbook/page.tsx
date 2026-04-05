
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Book } from "lucide-react";
import { users } from "@/lib/data";
import { useSearchParams } from "next/navigation";
import { UserRole } from "@/types";
import { ChargesAndPaymentHistoryCard } from "@/components/app/kpi-cards/charges-payment-history-card";
import { cn } from "@/lib/utils";
import { useDataStore } from "@/hooks/use-data-store";

type LedgerEntry = {
    date: Date;
    receiptAccount?: string;
    receiptDescription?: string;
    receiptFolio?: string;
    receiptCash?: number;
    receiptOther?: number;
    receiptTotal?: number;
    paymentAccount?: string;
    paymentDescription?: string;
    paymentFolio?: string;
    paymentCash?: number;
    paymentOther?: number;
    paymentTotal?: number;
    balance: number;
}

export default function CashbookPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') as UserRole | null;
    const { payments, expenses } = useDataStore();
    const user = users.find(u => u.role === role);

    if (role && role !== 'Admin') {
        return <ChargesAndPaymentHistoryCard />;
    }
    
    const allReceipts = payments.filter(p => p.status === 'Paid').map(p => ({
        type: 'receipt' as const,
        date: p.date,
        account: 'Maintenance', // Simplified for now
        description: p.description,
        folio: p.userId,
        amount: p.amount,
    }));

    const allPayments = expenses.filter(e => e.status === 'Paid').map(e => ({
        type: 'payment' as const,
        date: e.date,
        account: e.accountId,
        description: e.description,
        folio: e.id,
        amount: e.amount,
    }));

    const allTransactions = [...allReceipts, ...allPayments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    const ledger: LedgerEntry[] = allTransactions.map(t => {
        if (t.type === 'receipt') {
            runningBalance += t.amount;
            return {
                date: t.date,
                receiptAccount: t.account,
                receiptDescription: t.description,
                receiptFolio: t.folio,
                receiptCash: t.amount,
                receiptTotal: t.amount,
                balance: runningBalance,
            };
        } else { // payment
            runningBalance -= t.amount;
            return {
                date: t.date,
                paymentAccount: t.account,
                paymentDescription: t.description,
                paymentFolio: t.folio,
                paymentCash: t.amount,
                paymentTotal: t.amount,
                balance: runningBalance,
            };
        }
    });
    
    const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Book className="h-5 w-5" />
                        Cashbook
                    </CardTitle>
                    <CardDescription>
                        A comprehensive ledger of all financial transactions for the application.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table className="min-w-full divide-y divide-gray-200">
                            <TableHeader>
                                <TableRow>
                                    <TableHead colSpan={7} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Receipts</TableHead>
                                    <TableHead colSpan={7} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-l">Payments</TableHead>
                                    <TableHead rowSpan={2} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 align-middle border-l">Running Balance</TableHead>
                                </TableRow>
                                <TableRow>
                                    {/* Receipt Headers */}
                                    <TableHead>Date</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Folio</TableHead>
                                    <TableHead>Cash</TableHead>
                                    <TableHead>Other</TableHead>
                                    <TableHead>Total</TableHead>
                                    
                                    {/* Payment Headers */}
                                    <TableHead className="border-l">Date</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Folio</TableHead>
                                    <TableHead>Cash</TableHead>
                                    <TableHead>Other</TableHead>
                                    <TableHead>Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ledger.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={15} className="text-center text-muted-foreground py-10">
                                            No transactions to display.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ledger.map((entry, index) => (
                                        <TableRow key={index} className={cn(index % 2 === 0 ? "bg-muted/50" : "")}>
                                            {/* Receipt Data */}
                                            <TableCell className="whitespace-normal break-words">{entry.receiptAccount ? dateTimeFormatter.format(new Date(entry.date)).replace(',', '') : ''}</TableCell>
                                            <TableCell className="whitespace-normal break-words">{entry.receiptAccount}</TableCell>
                                            <TableCell className="whitespace-normal break-words">{entry.receiptDescription}</TableCell>
                                            <TableCell className="whitespace-normal break-words">{entry.receiptFolio}</TableCell>
                                            <TableCell className="text-right text-green-600">{entry.receiptCash?.toLocaleString('en-IN')}</TableCell>
                                            <TableCell className="text-right text-green-600">{entry.receiptOther?.toLocaleString('en-IN')}</TableCell>
                                            <TableCell className="text-right font-semibold text-green-700">{entry.receiptTotal?.toLocaleString('en-IN')}</TableCell>
                                            
                                            {/* Payment Data */}
                                            <TableCell className="border-l whitespace-normal break-words">{entry.paymentAccount ? dateTimeFormatter.format(new Date(entry.date)).replace(',', '') : ''}</TableCell>
                                            <TableCell className="whitespace-normal break-words">{entry.paymentAccount}</TableCell>
                                            <TableCell className="whitespace-normal break-words">{entry.paymentDescription}</TableCell>
                                            <TableCell className="whitespace-normal break-words">{entry.paymentFolio}</TableCell>
                                            <TableCell className="text-right text-red-600">{entry.paymentCash?.toLocaleString('en-IN')}</TableCell>
                                            <TableCell className="text-right text-red-600">{entry.paymentOther?.toLocaleString('en-IN')}</TableCell>
                                            <TableCell className="text-right font-semibold text-red-700">{entry.paymentTotal?.toLocaleString('en-IN')}</TableCell>

                                            {/* Balance */}
                                            <TableCell className={cn("text-right font-bold border-l", entry.balance < 0 ? 'text-destructive' : 'text-green-600')}>
                                                {entry.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
