'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast";
import { rates as defaultRates, shifts, payments } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { summarizePaymentHistory } from '@/ai/flows/summarize-payment-history';
import { Bot, Loader2 } from 'lucide-react';


export default function SettingsPage() {
    const { toast } = useToast();
    const [rates, setRates] = useState(defaultRates);
    const [summary, setSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleRateChange = (key: keyof typeof rates, value: string) => {
        setRates(prev => ({...prev, [key]: parseFloat(value) || 0 }));
    }

    const handleSaveRates = () => {
        // In a real app, this would save to a database.
        console.log("Saving rates:", rates);
        toast({ title: "Success", description: "Rates have been updated." });
    }

    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        setSummary('');
        try {
            const paymentDataString = JSON.stringify(payments, null, 2);
            const result = await summarizePaymentHistory({ paymentHistory: paymentDataString });
            setSummary(result.summary);
        } catch(e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Error", description: "Failed to generate summary." });
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <Tabs defaultValue="rates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rates">Rate Management</TabsTrigger>
            <TabsTrigger value="overview">Payment Overview</TabsTrigger>
            <TabsTrigger value="shifts">Work Shifts</TabsTrigger>
        </TabsList>
        <TabsContent value="rates">
            <Card>
            <CardHeader>
                <CardTitle>Rate Management</CardTitle>
                <CardDescription>
                Manage the rates for various passes and services.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Rates for Apartment Passes (per sqft)</p>
                <div className="space-y-2">
                    <Label htmlFor="1day">1-Day Pass Rate</Label>
                    <Input id="1day" type="number" value={rates['1day']} onChange={e => handleRateChange('1day', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="7day">7-Day Pass Rate</Label>
                    <Input id="7day" type="number" value={rates['7day']} onChange={e => handleRateChange('7day', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="1month">1-Month Pass Rate</Label>
                    <Input id="1month" type="number" value={rates['1month']} onChange={e => handleRateChange('1month', e.target.value)} />
                </div>
                <Button onClick={handleSaveRates}>Save Rates</Button>
            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="overview">
            <Card>
            <CardHeader>
                <CardTitle>AI-Generated Payment Overview</CardTitle>
                <CardDescription>
                    Get a quick, intelligent summary of the entire payment history.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Button onClick={handleGenerateSummary} disabled={isGenerating}>
                    {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Bot className="mr-2 h-4 w-4" />
                    )}
                    Generate Summary
                </Button>
                {(isGenerating || summary) && (
                    <div className="p-4 bg-muted/50 rounded-lg border">
                        {isGenerating && <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Analyzing payment data...</div>}
                        {summary && <p className="text-sm whitespace-pre-wrap">{summary}</p>}
                    </div>
                )}
            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="shifts">
            <Card>
            <CardHeader>
                <CardTitle>Security Work Shifts</CardTitle>
                <CardDescription>
                Manage and view the work shifts for all security personnel.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Personnel</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {shifts.map(shift => (
                        <TableRow key={shift.id}>
                            <TableCell className="font-medium">{shift.personnel}</TableCell>
                            <TableCell>{shift.shift}</TableCell>
                            <TableCell>
                                <Badge variant={shift.status === 'Active' ? 'default' : 'outline'}>{shift.status}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
        </TabsContent>
        </Tabs>
    )
}
