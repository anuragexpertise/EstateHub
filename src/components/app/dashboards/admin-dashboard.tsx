'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { users, events as initialEvents } from "@/lib/data";
import type { UserRole, Payment, Expense } from '@/types';
import { Building2, Shield, Wrench, IndianRupee, TrendingUp, TrendingDown, CalendarDays, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type ListFilter = 'all' | 'withDues' | 'noDues' | 'pending' | 'verified' | 'paid' | 'drafts' | 'sent';

export function AdminDashboard() {
    const router = useRouter();
    const { toast } = useToast();
    
    const { firestore } = useFirebase();
    const receiptsQuery = useMemoFirebase(() => collection(firestore, 'receipts'), [firestore]);
    const expensesQuery = useMemoFirebase(() => collection(firestore, 'expenses'), [firestore]);

    const { data: initialPayments, isLoading: paymentsLoading } = useCollection<Payment>(receiptsQuery);
    const { data: initialExpenses, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);

    if (paymentsLoading || expensesLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 7 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-1/2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }
    
    const payments = initialPayments || [];
    const expenses = initialExpenses || [];

    // KPI Calculations
    const apartments = users.filter(u => u.role === 'Apartment');
    const apartmentsWithDues = apartments.filter(u => payments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue'))).length;
    
    const contractors = users.filter(u => u.role === 'Contractor');
    const contractorsWithDues = contractors.filter(u => payments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue'))).length;
    
    const security = users.filter(u => u.role === 'Security');
    
    const totalCredits = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const totalDebits = expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
    const balance = totalCredits - totalDebits;
    
    const upcomingEvents = initialEvents.filter(e => e.status === 'Sent' && new Date(e.dateTime) > new Date()).length;
    const draftEvents = initialEvents.filter(e => e.status === 'Draft').length;

    const kpis = [
        { title: "Apartment Owners", icon: Building2, role: 'Apartment', stats: [
            { label: "With Dues", value: apartmentsWithDues, color: "text-destructive", filter: 'withDues' }, 
            { label: "No Dues", value: apartments.length - apartmentsWithDues, color: "text-green-600", filter: 'noDues' }, 
            { label: "Total", value: apartments.length, filter: 'all' }
        ] },
        { title: "Utility Contractors", icon: Wrench, role: 'Contractor', stats: [
            { label: "With Dues", value: contractorsWithDues, color: "text-destructive", filter: 'withDues' }, 
            { label: "No Dues", value: contractors.length - contractorsWithDues, color: "text-green-600", filter: 'noDues' }, 
            { label: "Total", value: contractors.length, filter: 'all' }
        ] },
        { title: "Security Staff", icon: Shield, role: 'Security', stats: [{ label: "Total", value: security.length, filter: 'all' }] },
        { title: "Balance", icon: IndianRupee, role: 'Financials', stats: [
            { label: "Available", value: `₹${balance.toLocaleString()}`, color: balance >= 0 ? "text-green-600" : "text-destructive", filter: 'all' }, 
        ]},
        { title: "Credits (Receipts)", icon: TrendingUp, role: 'Payments', stats: [
            { label: "Pending", value: `${payments.filter(p => p.status === 'Pending Verification').length}`, color: "text-amber-500", filter: 'pending' }, 
            { label: "Verified", value: `${payments.filter(p => p.status === 'Paid').length}`, color: "text-green-600", filter: 'verified' }
        ] },
        { title: "Debits (Expenses)", icon: TrendingDown, role: 'Expenses', stats: [
            { label: "Pending", value: `${expenses.filter(p => p.status === 'Pending').length}`, color: "text-amber-500", filter: 'pending' }, 
            { label: "Paid", value: `${expenses.filter(p => p.status === 'Paid').length}`, color: "text-green-600", filter: 'paid' }
        ] },
        { title: "Events", icon: CalendarDays, role: 'Events', stats: [
            { label: "Upcoming", value: upcomingEvents, filter: 'sent' }, 
            { label: "Drafts", value: draftEvents, color: "text-amber-500", filter: 'drafts' }
        ] },
    ];
    
    const handleKpiClick = (role: string, filter: ListFilter) => {
        const adminRoleQuery = 'role=Admin';
        switch (role) {
            case 'Apartment':
            case 'Contractor':
            case 'Security':
                router.push(`/users?${adminRoleQuery}&userRoleFilter=${role}&statusFilter=${filter}`);
                break;
            case 'Payments':
                router.push(`/payments?${adminRoleQuery}&status=${filter}`);
                break;
            case 'Expenses':
                router.push(`/expenses?${adminRoleQuery}&status=${filter}`);
                break;
            case 'Events':
                router.push(`/events?${adminRoleQuery}&status=${filter}`);
                break;
            case 'Financials':
                router.push(`/cashbook?${adminRoleQuery}`);
                break;
            default:
                toast({ title: 'Info', description: 'This KPI detail view is not yet implemented.' });
                return;
        }
    };

    return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {kpis.map(kpi => (
              <Card key={kpi.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <kpi.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-x-4 gap-y-2 flex-wrap">
                    {kpi.stats.map(stat => (
                      <div key={stat.label} className="hover:bg-muted/50 p-2 -m-2 rounded-md cursor-pointer" onClick={() => handleKpiClick(kpi.role, stat.filter as ListFilter)}>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
}
