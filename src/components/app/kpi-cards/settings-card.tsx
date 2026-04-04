
'use client';
import * as React from 'react';
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
import { Upload, Mail, Phone } from 'lucide-react';
import { useAvatarStore } from '@/hooks/use-avatar-store';


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
    const { refreshAvatar } = useAvatarStore();
    
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const avatarInputRef = React.useRef<HTMLInputElement>(null);

    const initialAvatar = user ? PlaceHolderImages.find(img => img.id === user.avatarId) : null;
    
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
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast({
                    variant: 'destructive',
                    title: 'Invalid File Type',
                    description: 'Please upload a JPG, PNG, or WEBP image.',
                });
                return;
            }

            if (file.size > 100 * 1024) { // 100 KB
                toast({
                    variant: 'destructive',
                    title: 'File Too Large',
                    description: 'Please upload an image smaller than 100KB.',
                });
                return;
            }
            
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    }

    const handleAvatarSave = () => {
        if (!avatarFile || !avatarPreview || !user) return;
        
        toast({
            title: "Avatar Updated",
            description: "Your profile picture has been changed successfully."
        });
        
        refreshAvatar(avatarPreview, user.avatarId);
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
                            <AvatarImage src={avatarPreview || initialAvatar?.imageUrl} alt={user?.name} />
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
                                accept="image/png, image/jpeg, image/webp" 
                            />
                            <Button onClick={handleAvatarSave} disabled={!avatarFile}>Save Avatar</Button>
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

export function ApartmentRateManagementCard() {
    const { toast } = useToast();
    const [rates, setRates] = useState(defaultRates.apartment);

    const handleRateChange = (key: keyof typeof rates, value: string) => {
        setRates(prev => ({...prev, [key]: parseFloat(value) || 0 }));
    }

    const handleSaveRates = () => {
        console.log("Saving apartment rates:", rates);
        toast({ title: "Success", description: "Apartment maintenance rates have been updated." });
    }
    return (
        <Card>
        <CardHeader>
            <CardTitle>Apartment Rate Management</CardTitle>
            <CardDescription>
            Manage monthly maintenance charge (MMC) rates per square foot.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="1month">1-Month Rate (per sqft)</Label>
                <Input id="1month" type="number" value={rates['1month']} onChange={e => handleRateChange('1month', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="3month">3-Month Rate (per sqft)</Label>
                <Input id="3month" type="number" value={rates['3month']} onChange={e => handleRateChange('3month', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="6month">6-Month Rate (per sqft)</Label>
                <Input id="6month" type="number" value={rates['6month']} onChange={e => handleRateChange('6month', e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="12month">1-Year (AMC) Rate (per sqft)</Label>
                <Input id="12month" type="number" value={rates['12month']} onChange={e => handleRateChange('12month', e.target.value)} />
            </div>
            <Button onClick={handleSaveRates}>Save Rates</Button>
        </CardContent>
        </Card>
    );
}

export function UtilityContractorRateManagementCard() {
    const { toast } = useToast();
    const [rates, setRates] = useState(defaultRates.contractor);

    const handleRateChange = (key: keyof typeof rates, value: string) => {
        setRates(prev => ({...prev, [key]: parseFloat(value) || 0 }));
    }

    const handleSaveRates = () => {
        console.log("Saving contractor rates:", rates);
        toast({ title: "Success", description: "Utility Contractor pass rates have been updated." });
    }
    return (
        <Card>
        <CardHeader>
            <CardTitle>Utility Contractor Rate Management</CardTitle>
            <CardDescription>
            Manage pass rates for utility contractors.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="contractor-1day">1-Day Pass Rate</Label>
                <Input id="contractor-1day" type="number" value={rates['1day']} onChange={e => handleRateChange('1day', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="contractor-7day">7-Day Pass Rate</Label>
                <Input id="contractor-7day" type="number" value={rates['7day']} onChange={e => handleRateChange('7day', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="contractor-1month">1-Month Pass Rate</Label>
                <Input id="contractor-1month" type="number" value={rates['1month']} onChange={e => handleRateChange('1month', e.target.value)} />
            </div>
            <Button onClick={handleSaveRates}>Save Rates</Button>
        </CardContent>
        </Card>
    );
}

export function FineManagementCard() {
    const { toast } = useToast();
    const [rates, setRates] = useState(defaultRates.fines);

    const handleRateChange = (key: keyof typeof rates, value: string) => {
        setRates(prev => ({...prev, [key]: parseFloat(value) || 0 }));
    }

    const handleSaveRates = () => {
        console.log("Saving fine rates:", rates);
        toast({ title: "Success", description: "Fine rates have been updated." });
    }

    return (
        <Card>
        <CardHeader>
            <CardTitle>Fine Management</CardTitle>
            <CardDescription>
            Manage late fees for apartment maintenance charges. No fines for contractors.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="latePaymentFee">Late Payment Fine (Fixed Amount)</Label>
                <Input id="latePaymentFee" type="number" value={rates.latePaymentFee} onChange={e => handleRateChange('latePaymentFee', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="finePercentPerDay">Fine Per Day (Percentage of due amount)</Label>
                <Input id="finePercentPerDay" type="number" value={rates.finePercentPerDay} onChange={e => handleRateChange('finePercentPerDay', e.target.value)} />
            </div>
            <Button onClick={handleSaveRates}>Save Fine Rates</Button>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {shifts.map(shift => {
                    const user = users.find(u => u.name === shift.personnel);
                    return (
                        <TableRow key={shift.id}>
                            <TableCell className="font-medium">{shift.personnel}</TableCell>
                            <TableCell>{shift.shift}</TableCell>
                            <TableCell>
                                <Badge variant={shift.status === 'Active' ? 'default' : 'outline'}>{shift.status}</Badge>
                            </TableCell>
                            <TableCell>
                                {user ? (
                                    <a href={`mailto:${user.email}`} className="flex items-center gap-2 hover:underline text-primary">
                                        <Mail className="h-4 w-4" />
                                        <span>Email</span>
                                    </a>
                                ) : (
                                    <span className="text-muted-foreground">N/A</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {user?.phone ? (
                                    <a href={`tel:${user.phone}`} className="flex items-center gap-2 hover:underline text-primary">
                                        <Phone className="h-4 w-4" />
                                        <span>Call</span>
                                    </a>
                                ) : (
                                    <span className="text-muted-foreground">N/A</span>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    );
}
