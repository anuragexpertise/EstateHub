
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, UserRole } from "@/types";
import { roleDisplayNames, payments, shifts, rates } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Building2, Wrench, Shield, Mail, Phone, Hash, Copy, AlertCircle, CheckCircle2, CalendarClock } from 'lucide-react';
import { useAvatarStore } from "@/hooks/use-avatar-store";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/hooks/use-global-store";
import { differenceInMonths, endOfMonth, format, isAfter } from 'date-fns';

interface UserProfileCardProps {
    user: User;
}

const roleIcons: Record<UserRole, React.ElementType> = {
    'Admin': Shield,
    'Apartment': Building2,
    'Contractor': Wrench,
    'Security': Shield,
};

const NoticeCard = ({ user }: { user: User }) => {
    const { calculationStartDate } = useGlobalStore();

    let title = 'Status';
    let amountDue: number | null = null;
    let validUpto: string | null = null;
    let noticeType: 'due' | 'paid' | 'info' = 'info';

    const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

    if (user.role === 'Apartment') {
        title = 'Maintenance Status';

        if (calculationStartDate && user.details?.sqft) {
            const startDate = new Date(calculationStartDate);
            const today = new Date();
            const monthsToCharge = differenceInMonths(today, startDate) + 1;

            const monthlyCharge = user.details.sqft * rates.apartment['1month'];
            const totalCharged = monthsToCharge * monthlyCharge;

            const totalPaid = payments
                .filter(p => p.userId === user.id && p.status === 'Paid' && p.description.includes('Maintenance'))
                .reduce((sum, p) => sum + p.amount, 0);
            
            const balance = totalCharged - totalPaid;
            
            if (balance > 0) {
                noticeType = 'due';
                let totalFine = 0;
                // Check if any payment is overdue to apply fixed late fee
                const hasOverdue = payments.some(p => p.userId === user.id && p.status === 'Overdue');
                if(hasOverdue) {
                    totalFine += rates.fines.latePaymentFee;
                }
                
                // Note: a more complex daily fine calculation would be needed for a real app
                // For this demo, we'll just add the fixed fee if any payment is marked 'Overdue'
                amountDue = balance + totalFine;
                validUpto = `Payments overdue`;
            } else {
                noticeType = 'paid';
                validUpto = format(endOfMonth(today), 'dd-MMM-yyyy');
            }
        } else {
            // Fallback for when calculation start date isn't set
            const duePayment = payments.find(p => p.userId === user.id && (p.status === 'Due' || p.status === 'Overdue'));
             if (duePayment) {
                amountDue = duePayment.amount;
                noticeType = 'due';
            } else {
                noticeType = 'paid';
            }
            validUpto = 'Calculation date not set';
        }


    } else if (user.role === 'Contractor') {
        title = 'Pass Status';
        const passPayments = payments.filter(p => p.userId === user.id && p.description.includes('Pass') && p.status === 'Paid');
        const lastPass = passPayments.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
        
        if (lastPass) {
            const expiryDate = new Date(lastPass.date);
            if (lastPass.description.includes('1-Day')) expiryDate.setDate(expiryDate.getDate() + 1);
            else if (lastPass.description.includes('7-Day')) expiryDate.setDate(expiryDate.getDate() + 7);
            else if (lastPass.description.includes('1-Month')) expiryDate.setMonth(expiryDate.getMonth() + 1);
            
            if (expiryDate > new Date()) {
                noticeType = 'paid';
                validUpto = dateTimeFormatter.format(expiryDate).replace(',', '');
            } else {
                noticeType = 'due';
                amountDue = 50; // Default to 1-day pass
                validUpto = `Expired on ${dateFormatter.format(expiryDate).replace(/ /g, '-')}`;
            }
        } else {
             noticeType = 'due';
             amountDue = rates.contractor['1day'];
        }

    } else if (user.role === 'Security') {
        title = 'Shift Status';
        const userShift = shifts.find(s => s.personnel === user.name);
        if (userShift?.shift.includes('6am - 6pm')) {
            validUpto = `Today, 6:00 PM`;
        } else if (userShift?.shift.includes('6pm - 6am')) {
             validUpto = `Tomorrow, 6:00 AM`;
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
                         {amountDue ? `₹${amountDue.toLocaleString()} Due` : noticeType === 'info' ? 'Not Applicable' : 'No Dues'}
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
                        <CardDescription className="flex items-center gap-2">
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
