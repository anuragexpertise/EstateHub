
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams } from 'next/navigation';
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
import { rates as defaultRates, shifts, users, findUserByRole } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Upload } from 'lucide-react';


const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, { message: 'Please enter your current password.' }),
    newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
  });

const phoneFormSchema = z.object({
    phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
});

export function SettingsCard() {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') as UserRole | null;
    const user = role ? findUserByRole(role) : null;
    const avatarImage = user ? PlaceHolderImages.find(img => img.id === user.avatarId) : null;

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const avatarInputRef = React.useRef<HTMLInputElement>(null);

    const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
        resolver: zodResolver(phoneFormSchema),
        defaultValues: {
            phone: user?.phone || '',
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

    const handlePhoneSubmit = (values: z.infer<typeof phoneFormSchema>) => {
        console.log('Changing phone number...', values);
        if(user) {
            user.phone = values.phone;
        }
        toast({
            title: "Phone Number Updated",
            description: "Your phone number has been changed successfully."
        });
    }

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    }

    const handleAvatarSave = () => {
        if (!avatarPreview) return;
        console.log("New avatar selected, saving...");
        // In a real app, you'd upload the file and update the user's avatar URL
        toast({
            title: "Avatar Updated",
            description: "Your profile picture has been changed successfully."
        });
        // Here we'd update the user's avatarId in the data, but we'll just log it for now
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Settings</CardTitle>
                <CardDescription>Update your account details and password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Avatar Upload */}
                <div className='space-y-4'>
                    <Label className='text-base font-medium'>Profile Picture</Label>
                    <div className='flex items-center gap-6'>
                         <Avatar className="h-24 w-24">
                            <AvatarImage src={avatarPreview || avatarImage?.imageUrl} alt={user?.name} />
                            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col gap-2'>
                             <Button variant="outline" onClick={() => avatarInputRef.current?.click()}>
                                <Upload className='mr-2 h-4 w-4' />
                                Upload Image
                            </Button>
                            <Input 
                                type="file" 
                                className='hidden' 
                                ref={avatarInputRef} 
                                onChange={handleAvatarChange}
                                accept="image/png, image/jpeg" 
                            />
                            <Button onClick={handleAvatarSave} disabled={!avatarPreview}>Save Avatar</Button>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Phone Number Change */}
                <Form {...phoneForm}>
                    <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4 max-w-md">
                        <Label className='text-base font-medium'>Contact Information</Label>
                        <FormField
                            control={phoneForm.control}
                            name="phone"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                <Input placeholder="+1 (555) 555-5555" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit">Update Phone</Button>
                    </form>
                </Form>

                <Separator />

                {/* Password Change */}
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4 max-w-md">
                        <Label className='text-base font-medium'>Security</Label>
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
            <CardTitle>Shift Management</CardTitle>
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
