
'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { users, events, payments } from "@/lib/data";
import { User, Building2, Wrench, Shield, CalendarDays, TrendingDown, CreditCard, IndianRupee } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ChargesAndPaymentHistoryCard } from "../kpi-cards/charges-payment-history-card";
import { cn } from "@/lib/utils";

export function ApartmentDashboard() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const currentUser = users.find(u => u.role === 'Apartment'); // Simplified for demo
  const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  
  const totalApartments = users.filter(u => u.role === 'Apartment').length;
  const totalContractors = users.filter(u => u.role === 'Contractor').length;
  const totalSecurity = users.filter(u => u.role === 'Security').length;
  
  const userCharges = payments.filter(p => p.userId === currentUser?.id).filter(p => p.status === 'Due' || p.status === 'Overdue').reduce((sum, p) => sum + p.amount, 0);
  const userPayments = payments.filter(p => p.userId === currentUser?.id).filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const userDues = userCharges > 0 ? userCharges - userPayments : 0;
  
  const visibleEvents = role ? events.filter(e => e.audience.includes('Apartment') && e.status === 'Sent') : [];

  const kpis = [
    { title: "Apartment Owners", value: totalApartments, icon: Building2 },
    { title: "Utility Contractors", value: totalContractors, icon: Wrench },
    { title: "Security Staff", value: totalSecurity, icon: Shield },
    { title: "Dues", value: `₹${userDues.toLocaleString()}`, icon: IndianRupee, color: userDues > 0 ? "text-destructive" : "text-green-600" },
    { title: "Total Charges", value: `₹${userCharges.toLocaleString()}`, icon: TrendingDown, color: "text-destructive" },
    { title: "Total Payments", value: `₹${userPayments.toLocaleString()}`, icon: CreditCard, color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map(kpi => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Events & Announcements
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {visibleEvents.length > 0 ? visibleEvents.slice(0, 3).map((event, index) => (
                  <div key={event.id} className={cn("p-4 border rounded-lg", index % 2 !== 0 && "bg-muted/50")}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold">{event.name}</h3>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                        <Badge variant="outline">{dateTimeFormatter.format(event.dateTime)}</Badge>
                    </div>
                </div>
            )) : (
                <p className="text-muted-foreground">No upcoming events.</p>
            )}
        </CardContent>
      </Card>
      <ChargesAndPaymentHistoryCard />
    </div>
  );
}
