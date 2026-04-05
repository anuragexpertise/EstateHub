
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, UserRole } from "@/types";
import { roleDisplayNames, shifts, rates, roleIcons, roleTextColors } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Building2, Wrench, Shield, Mail, Phone, Hash, Copy, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAvatarStore } from "@/hooks/use-avatar-store";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/hooks/use-global-store";
import { differenceInDays, endOfMonth, format, isAfter, startOfMonth, eachMonthOfInterval } from 'date-fns';
import { useDataStore } from "@/hooks/use-data-store";

interface UserProfileCardProps {
    user: User;
}

const NoticeCard = ({ user }: { user: User }) => {
    const { calculationStartDate } = useGlobalStore();
    const { payments } = useDataStore();

    let title = 'Status';
    let amountDue: number | null = null;
    let validUpto: string | null = null;
    let noticeType: 'due' | 'paid' | 'info' = 'info';

    const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

    if (user.role === 'Apartment') {
        title = 'Maintenance Status';

        if (calculationStartDate && user.details?.sqft) {
            let runningBalance = 0;
            let lastPaidMonth: Date | null = null;

            const startDate = startOfMonth(new Date(calculationStartDate));
            const today = new Date();
            const monthlyChargeAmount = user.details.sqft * rates.apartment['1month'];

            const userPayments = payments
                .filter(p => p.userId === user.id && p.description.includes('Maintenance') && p.status === 'Paid')
                .map(p => ({ date: new Date(p.date), amount: p.amount, type: 'payment' as const }));

            const monthlyCharges = eachMonthOfInterval({ start: startDate, end: today }).map(month => ({
                date: startOfMonth(month),
                amount: monthlyChargeAmount,
                type: 'charge' as const,
                month: month,
            }));

            const combined = [...userPayments, ...monthlyCharges].sort((a, b) => a.date.getTime() - b.date.getTime());
            
            for (const item of combined) {
                if (item.type === 'charge') {
                    runningBalance -= item.amount;
                } else if (item.type === 'payment') {
                    const chargeMonthStart = startOfMonth(item.date);
                    const correspondingCharge = monthlyCharges.find(c => c.month.getTime() === chargeMonthStart.getTime());
                    
                    if (correspondingCharge && isAfter(item.date, correspondingCharge.date)) {
                        // Apply one-time late fee
                        runningBalance -= rates.fines.latePaymentFee;
                        
                        // Apply daily fine
                        const lateDays = differenceInDays(item.date, correspondingCharge.date);
                        if (lateDays > 0) {
                            const dailyFineRate = (correspondingCharge.amount * rates.fines.finePercentPerDay) / 100;
                            const totalDailyFine = lateDays * dailyFineRate;
                            runningBalance -= totalDailyFine;
                        }
                    }
                    runningBalance += item.amount;
                }
            }

            // Determine last paid month after all calculations
            let tempBalance = 0;
            eachMonthOfInterval({ start: startDate, end: today }).forEach(month => {
                // Recalculate balance month by month just for validity check
                tempBalance -= monthlyChargeAmount;

                const paymentForMonth = userPayments.find(p => startOfMonth(p.date).getTime() === month.getTime());
                if (paymentForMonth) {
                    if (isAfter(paymentForMonth.date, month)) {
                        tempBalance -= rates.fines.latePaymentFee;
                        const lateDays = differenceInDays(paymentForMonth.date, month);
                        tempBalance -= lateDays * (monthlyChargeAmount * rates.fines.finePercentPerDay / 100);
                    }
                    tempBalance += paymentForMonth.amount;
                }
                
                if (tempBalance >= 0) {
                    lastPaidMonth = month;
                }
            });


            if (runningBalance < 0) {
                noticeType = 'due';
                amountDue = -runningBalance;
                validUpto = `Payments overdue`;
            } else {
                noticeType = 'paid';
                validUpto = lastPaidMonth ? format(endOfMonth(lastPaidMonth), 'dd-MMM-yyyy') : 'All clear';
            }

        } else {
            noticeType = 'info';
            validUpto = 'Calculation date not set';
        }

    } else if (user.role === 'Contractor') {
        title = 'Pass Status';
        const passPayments = payments.filter(p => p.userId === user.id && p.description.includes('Pass') && p.status === 'Paid');
        const lastPass = passPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        if (lastPass) {
            const expiryDate = new Date(lastPass.date);
            if (lastPass.description.includes('1-Day')) expiryDate.setDate(expiryDate.getDate() + 1);
            else if (lastPass.description.includes('7-Day')) expiryDate.setDate(expiryDate.getDate() + 7);
            else if (lastPass.description.includes('1-Month')) expiryDate.setMonth(expiryDate.getMonth() + 1);
            
            if (expiryDate > new Date()) {
                noticeType = 'paid';
                validUpto = dateTimeFormatter.format(expiryDate).replace(',', ' ');
            } else {
                noticeType = 'due';
                amountDue = rates.contractor['1day'];
                validUpto = `Expired on ${dateTimeFormatter.format(expiryDate).replace(',', ' ')}`;
            }
        } else {
             noticeType = 'due';
             amountDue = rates.contractor['1day'];
        }

    } else if (user.role === 'Security') {
        title = 'Shift Status';
        const userShift = shifts.find(s => s.personnel === user.name);
        if (userShift?.shift.includes('6am - 6pm')) {
            const shiftEnd = new Date();
            shiftEnd.setHours(18, 0, 0, 0); // 6 PM today
            validUpto = dateTimeFormatter.format(shiftEnd).replace(',', ' ');
        } else if (userShift?.shift.includes('6pm - 6am')) {
             const shiftEnd = new Date();
             shiftEnd.setDate(shiftEnd.getDate() + 1);
             shiftEnd.setHours(6, 0, 0, 0); // 6 AM tomorrow
             validUpto = dateTimeFormatter.format(shiftEnd).replace(',', ' ');
        }
        noticeType = 'info';

    } else if (user.role === 'Admin') {
        title = 'Admin Status';
        noticeType = 'info';
        validUpto = 'Not Applicable';
    }


    const isDue = noticeType === 'due';
    const Icon = isDue ? AlertCircle : CheckCircle2;

    return (
         <Card className={cn(
             "mt-4",
             isDue ? "bg-destructive/10 border-destructive/50" : noticeType === 'paid' ? "bg-green-600/10 border-green-600/50" : "bg-muted/50"
         )}>
             <CardHeader>
                 <CardTitle className={cn(
                     "flex items-center gap-2 text-base",
                     isDue ? "text-destructive" : noticeType === 'paid' ? "text-green-700 dark:text-green-500" : "text-foreground"
                 )}>
                     <Icon className="h-5 w-5" />
                     {title}
                 </CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                     <p className="font-medium">Status</p>
                     <p className={cn("font-semibold", isDue ? "text-destructive" : noticeType === 'paid' ? "text-green-700 dark:text-green-500" : "text-muted-foreground")}>
                         {amountDue ? `₹${amountDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Due` : noticeType === 'info' ? 'Not Applicable' : 'No Dues'}
                     </p>
                </div>
                <div>
                     <p className="font-medium">Validity upto</p>
                     <p className="text-muted-foreground">{validUpto || 'Not Applicable'}</p>
                </div>
             </CardContent>
         </Card>
    );
}


export function UserProfileCard({ user }: UserProfileCardProps) {
    const { version, newAvatarUrl, lastUpdatedAvatarId } = useAvatarStore();
    const initialAvatar = PlaceHolderImages.find(img => img.id === user.avatarId);
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(initialAvatar?.imageUrl);
    const { toast } = useToast();
    
    useEffect(() => {
        if (lastUpdatedAvatarId === user.avatarId && newAvatarUrl) {
            setCurrentAvatarUrl(newAvatarUrl);
        } else {
            const originalAvatar = PlaceHolderImages.find(img => img.id === user.avatarId);
            setCurrentAvatarUrl(originalAvatar?.imageUrl);
        }
    }, [version, newAvatarUrl, lastUpdatedAvatarId, user.avatarId]);

    const RoleIcon = roleIcons[user.role];
    const textColor = roleTextColors[user.role];
    
    const handleCopyId = () => {
        navigator.clipboard.writeText(user.id);
        toast({
        title: 'ID Copied',
        description: `${user.id} has been copied to your clipboard.`,
        });
    }

    const renderDetails = () => {
        switch (user.role) {
            case 'Apartment':
                return (
                    <>
                        <div className="flex items-center gap-3">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span>Unit: {user.details?.unit || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>Size: {user.details?.sqft ? `${user.details.sqft} sqft` : 'N/A'}</span>
                        </div>
                    </>
                );
            case 'Contractor':
                return (
                    <div className="flex items-center gap-3">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <span>Service: {user.details?.service || 'N/A'}</span>
                    </div>
                );
            case 'Security':
                 return (
                    <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span>Shift: {user.details?.shift || 'N/A'}</span>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        {currentAvatarUrl && <AvatarImage src={currentAvatarUrl} alt={user.name} />}
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{user.name}</CardTitle>
                        <CardDescription className={cn("flex items-center gap-2", textColor)}>
                           <RoleIcon className="h-4 w-4" /> {roleDisplayNames[user.role]}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2 text-sm text-foreground">
                    <div className="flex w-full items-center justify-between">
                        <p className="text-sm text-muted-foreground">Entity ID</p>
                        <Button size="sm" variant="ghost" className="h-7 gap-2" onClick={handleCopyId}>
                            <code className="text-sm font-mono">{user.id}</code>
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                    </div>
                    {user.phone && (
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{user.phone}</span>
                        </div>
                    )}
                     {renderDetails()}
                </div>
                <NoticeCard user={user} />
            </CardContent>
        </Card>
    );
}
