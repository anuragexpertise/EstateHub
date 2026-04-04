
'use client';
import { ChargesAndPaymentHistoryCard } from '@/components/app/kpi-cards/charges-payment-history-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import type { UserRole, Payment } from '@/types';
import { TrendingDown } from 'lucide-react';
import { users, payments, rates } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

function ContractorCharges() {
    const user = users.find(u => u.role === 'Contractor');
    if (!user) return null;

    // This is simplified logic. A real app would generate charges based on pass validity.
    const userCharges: Payment[] = [
        { id: 'charge-con-1', userId: user.id, amount: rates.contractor['1day'], date: new Date(), status: 'Due', description: '1-Day Pass Fee' }
    ];
    const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Charges (Debits)
                </CardTitle>
                <CardDescription>Pass fees and other charges.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userCharges.map(charge => (
                             <TableRow key={charge.id}>
                                <TableCell>{dateFormatter.format(charge.date).replace(/ /g, '-')}</TableCell>
                                <TableCell>{charge.description}</TableCell>
                                <TableCell><Badge variant="destructive">{charge.status}</Badge></TableCell>
                                <TableCell className="text-right">₹{charge.amount.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default function ChargesPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') as UserRole | null;
    
    if (role === 'Apartment') {
        return <ChargesAndPaymentHistoryCard />;
    }

    if (role === 'Contractor') {
        return <ContractorCharges />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Charges (Debits)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No charges applicable for your role.</p>
            </CardContent>
        </Card>
    );
}
