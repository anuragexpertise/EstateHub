
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Book } from "lucide-react";

export default function CashbookPage() {

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
                                <TableRow>
                                    <TableCell colSpan={15} className="text-center text-muted-foreground py-10">
                                        No transactions to display. This is a placeholder for the cashbook functionality.
                                    </TableCell>
                                </TableRow>
                                {/* Example Row - Can be replaced with dynamic data */}
                                <TableRow>
                                    {/* Receipt Data */}
                                    <TableCell>01-Jul-24</TableCell>
                                    <TableCell>Maintenance</TableCell>
                                    <TableCell>J. Doe - Unit 101</TableCell>
                                    <TableCell>001</TableCell>
                                    <TableCell className="text-right">1200.00</TableCell>
                                    <TableCell className="text-right">0.00</TableCell>
                                    <TableCell className="text-right font-semibold">1200.00</TableCell>
                                    
                                    {/* Payment Data */}
                                    <TableCell className="border-l"></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>

                                    {/* Balance */}
                                    <TableCell className="text-right font-semibold border-l">1200.00</TableCell>
                                </TableRow>
                                <TableRow>
                                    {/* Receipt Data */}
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    
                                    {/* Payment Data */}
                                    <TableCell className="border-l">05-Jul-24</TableCell>
                                    <TableCell>Salary</TableCell>
                                    <TableCell>M. Guard - Security</TableCell>
                                    <TableCell>002</TableCell>
                                    <TableCell className="text-right">2500.00</TableCell>
                                    <TableCell className="text-right">0.00</TableCell>
                                    <TableCell className="text-right font-semibold">2500.00</TableCell>

                                    {/* Balance */}
                                    <TableCell className="text-right font-semibold border-l text-red-600">-1300.00</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
