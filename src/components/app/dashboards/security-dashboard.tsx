
'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { users, events, shifts } from "@/lib/data";
import { useSearchParams } from 'next/navigation';
import { Building2, Wrench, Shield, CalendarDays, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SecurityDashboard() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const currentUser = users.find(u => u.role === 'Security'); // Simplified for demo
  const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  
  const totalApartments = users.filter(u => u.role === 'Apartment').length;
  const totalContractors = users.filter(u => u.role === 'Contractor').length;
  const totalSecurity = users.filter(u => u.role === 'Security').length;
  
  const currentShift = shifts.find(s => s.personnel === currentUser?.name && s.status === 'Active');
  
  const visibleEvents = role ? events.filter(e => e.audience.includes('Security') && e.status === 'Sent') : [];

  const kpis = [
    { title: "Apartment Owners", value: totalApartments, icon: Building2 },
    { title: "Utility Contractors", value: totalContractors, icon: Wrench },
    { title: "Security Staff", value: totalSecurity, icon: Shield },
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
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Shift Information
            </CardTitle>
        </CardHeader>
        <CardContent>
            {currentShift ? (
                 <div className="text-lg">
                    <span className="font-semibold">Current Shift: </span>
                    <span className="text-muted-foreground">{currentShift.shift}</span>
                 </div>
            ) : (
                <p className="text-muted-foreground">No active shift.</p>
            )}
        </CardContent>
      </Card>
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
    </div>
  );
}
