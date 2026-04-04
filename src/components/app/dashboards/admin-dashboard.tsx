'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { users, payments, expenses, events } from "@/lib/data";
import { Building2, Wrench, Shield, TrendingUp, TrendingDown, IndianRupee, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminDashboard() {

  // User KPIs
  const apartments = users.filter(u => u.role === 'Apartment');
  const apartmentsWithDues = apartments.filter(u => payments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue'))).length;
  
  const contractors = users.filter(u => u.role === 'Contractor');
  const contractorsWithDues = contractors.filter(u => payments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue'))).length;
  
  const security = users.filter(u => u.role === 'Security');
  
  // Financial KPIs
  const totalCredits = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const totalDebits = expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalCredits - totalDebits;
  const pendingCredits = payments.filter(p => p.status === 'Pending Verification').reduce((sum, p) => sum + p.amount, 0);
  const pendingDebits = expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);
  
  // Event KPIs
  const upcomingEvents = events.filter(e => e.status === 'Sent' && e.dateTime > new Date()).length;
  const draftEvents = events.filter(e => e.status === 'Draft').length;

  const kpis = [
    { title: "Apartment Owners", icon: Building2, stats: [{ label: "With Dues", value: apartmentsWithDues, color: "text-destructive" }, { label: "No Dues", value: apartments.length - apartmentsWithDues, color: "text-green-600" }, { label: "Total", value: apartments.length }] },
    { title: "Utility Contractors", icon: Wrench, stats: [{ label: "With Dues", value: contractorsWithDues, color: "text-destructive" }, { label: "No Dues", value: contractors.length - contractorsWithDues, color: "text-green-600" }, { label: "Total", value: contractors.length }] },
    { title: "Security Staff", icon: Shield, stats: [{ label: "Total", value: security.length }] },
    { title: "Balance", icon: IndianRupee, stats: [{ label: "Available", value: `₹${balance.toLocaleString()}`, color: balance >= 0 ? "text-green-600" : "text-destructive" }, { label: "Credits", value: `₹${totalCredits.toLocaleString()}`, color: "text-green-600" }, { label: "Debits", value: `₹${totalDebits.toLocaleString()}`, color: "text-destructive" }] },
    { title: "Credits (Receipts)", icon: TrendingUp, stats: [{ label: "Pending", value: `₹${pendingCredits.toLocaleString()}`, color: "text-amber-500" }, { label: "Verified", value: `₹${totalCredits.toLocaleString()}`, color: "text-green-600" }] },
    { title: "Debits (Expenses)", icon: TrendingDown, stats: [{ label: "Pending", value: `₹${pendingDebits.toLocaleString()}`, color: "text-amber-500" }, { label: "Paid", value: `₹${totalDebits.toLocaleString()}`, color: "text-green-600" }] },
    { title: "Events", icon: CalendarDays, stats: [{ label: "Upcoming", value: upcomingEvents }, { label: "Drafts", value: draftEvents, color: "text-amber-500" }] },
  ]

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
                  <div key={stat.label}>
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
