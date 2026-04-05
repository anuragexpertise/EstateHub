
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { payments, users, shifts } from "@/lib/data";
import { CreditCard, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function PersonnelCard() {
    const user = users.find(u => u.role === 'Security');

    if (!user) {
        return <p>No security user found.</p>;
    }

    const userShift = shifts.find(s => s.personnel === user.name);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Work Shift
                </CardTitle>
                <CardDescription>
                    Your assigned work shift details.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {userShift ? (
                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{userShift.personnel}</p>
                            <p className="text-lg text-muted-foreground">{userShift.shift}</p>
                        </div>
                            <Badge variant={userShift.status === 'Active' ? 'default' : 'outline'}>{userShift.status}</Badge>
                    </div>
                ) : (
                    <p>No shift information available.</p>
                )}
            </CardContent>
        </Card>
    );
}

export function SalaryHistoryCard() {
    const user = users.find(u => u.role === 'Security');

    if (!user) {
        return null;
    }
    const userPayments = payments.filter(p => p.userId === user.id);
    const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Salary History
                </CardTitle>
                <CardDescription>Record of payments made to you by the admin.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {userPayments.map((payment, index) => (
                    <TableRow key={payment.id} className={cn(index % 2 === 0 && "bg-muted/50")}>
                    <TableCell className="font-medium whitespace-normal break-words">{payment.description}</TableCell>
                    <TableCell>{dateTimeFormatter.format(payment.date).replace(',', '')}</TableCell>
                    <TableCell className="text-right text-green-600">₹{payment.amount.toLocaleString()}</TableCell>
                    </TableRow>
                ))}
                    {userPayments.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center">No payment history found.</TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    );
}
