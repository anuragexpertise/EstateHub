
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { users, payments as initialPayments, expenses as initialExpenses, events as initialEvents } from "@/lib/data";
import type { UserRole } from '@/types';
import { Building2, Shield, Wrench, IndianRupee, TrendingUp, TrendingDown, CalendarDays } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ListFilter = 'all' | 'withDues' | 'noDues' | 'pending' | 'verified' | 'paid' | 'drafts' | 'sent';

export function AdminDashboard() {
    const router = useRouter();
    const { toast } = useToast();

    // KPI Calculations
    const apartments = users.filter(u => u.role === 'Apartment');
    const apartmentsWithDues = apartments.filter(u => initialPayments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue'))).length;
    
    const contractors = users.filter(u => u.role === 'Contractor');
    const contractorsWithDues = contractors.filter(u => initialPayments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue'))).length;
    
    const security = users.filter(u => u.role === 'Security');
    
    const totalCredits = initialPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const totalDebits = initialExpenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
    const balance = totalCredits - totalDebits;
    const pendingCredits = initialPayments.filter(p => p.status === 'Pending Verification').reduce((sum, p) => sum + p.amount, 0);
    const verifiedCredits = totalCredits;
    const pendingDebits = initialExpenses.filter(e => e.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
    const paidDebits = totalDebits;
    
    const upcomingEvents = initialEvents.filter(e => e.status === 'Sent' && e.dateTime > new Date()).length;
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
            { label: "Credits", value: `₹${totalCredits.toLocaleString()}`, color: "text-green-600", filter: 'all' }, 
            { label: "Debits", value: `₹${totalDebits.toLocaleString()}`, color: "text-destructive", filter: 'all' }
        ]},
        { title: "Credits (Receipts)", icon: TrendingUp, role: 'Payments', stats: [
            { label: "Pending", value: `₹${pendingCredits.toLocaleString()}`, color: "text-amber-500", filter: 'pending' }, 
            { label: "Verified", value: `₹${verifiedCredits.toLocaleString()}`, color: "text-green-600", filter: 'verified' }
        ] },
        { title: "Debits (Expenses)", icon: TrendingDown, role: 'Expenses', stats: [
            { label: "Pending", value: `₹${pendingDebits.toLocaleString()}`, color: "text-amber-500", filter: 'pending' }, 
            { label: "Paid", value: `₹${paidDebits.toLocaleString()}`, color: "text-green-600", filter: 'paid' }
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
