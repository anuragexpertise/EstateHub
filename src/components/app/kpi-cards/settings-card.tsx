
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { useToast } from "@/hooks/use-toast";
import { rates as defaultRates, shifts } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, { message: 'Please enter your current password.' }),
    newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
  });

export function SettingsCard() {
    const { toast } = useToast();

    const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const handlePasswordSubmit = (values: z.infer<typeof passwordFormSchema>) => {
        console.log('Changing password...', values);
        toast({
            title: "Password Updated",
            description: "Your password has been changed successfully."
        });
        passwordForm.reset();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account's password here.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6 max-w-md">
                            <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                            <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                            <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit">Update Password</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export function RateManagementCard() {
    const { toast } = useToast();
    const [rates, setRates] = useState(defaultRates);

    const handleRateChange = (key: keyof typeof rates, value: string) => {
        setRates(prev => ({...prev, [key]: parseFloat(value) || 0 }));
    }

    const handleSaveRates = () => {
        console.log("Saving rates:", rates);
        toast({ title: "Success", description: "Rates have been updated." });
    }
    return (
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
    );
}

export function WorkShiftsCard() {
    return (
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
    );
}
