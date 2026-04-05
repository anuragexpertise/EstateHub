
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { users, events, shifts } from "@/lib/data";
import { useSearchParams, useRouter } from 'next/navigation';
import { Building2, Wrench, Shield, CalendarDays, Clock, ScanLine, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function SecurityDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role');
  const currentUser = users.find(u => u.role === 'Security'); // Simplified for demo
  const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  const { toast } = useToast();
  
  const totalApartments = users.filter(u => u.role === 'Apartment').length;
  const totalContractors = users.filter(u => u.role === 'Contractor').length;
  const totalSecurity = users.filter(u => u.role === 'Security').length;
  
  const currentShift = shifts.find(s => s.personnel === currentUser?.name && s.status === 'Active');
  
  const visibleEvents = role ? events.filter(e => e.audience.includes('Security') && e.status === 'Sent') : [];

  const handleKpiClick = (page: 'users', filter?: string) => {
    if (page === 'users') {
        router.push(`/users?role=${role}&userRoleFilter=${filter}`);
    }
  }

  const kpis = [
    { title: "Apartment Owners", value: totalApartments, icon: Building2, page: 'users', filter: 'Apartment' },
    { title: "Utility Contractors", value: totalContractors, icon: Wrench, page: 'users', filter: 'Contractor' },
    { title: "Security Staff", value: totalSecurity, icon: Shield, page: 'users', filter: 'Security' },
  ];
  
  const handleAttendance = (action: 'in' | 'out') => {
    toast({
        title: `Attendance Logged`,
        description: `You have successfully clocked ${action} at ${new Date().toLocaleTimeString()}.`,
    });
  }
  
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
              <div 
                className={cn("text-2xl font-bold", kpi.page && "cursor-pointer hover:underline")}
                onClick={() => kpi.page && handleKpiClick(kpi.page as any, kpi.filter)}
              >
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="grid gap-6 md:grid-cols-2">
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <ScanLine className="h-5 w-5" />
                    Security Pass Evaluation
                    </CardTitle>
                    <CardDescription>Scan QR codes to verify entry passes for residents and contractors.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center">
                    <Link href={`/scan?role=${role}`} passHref>
                    <Button size="lg">
                        <ScanLine className="mr-2 h-5 w-5" />
                        Scan QR Code
                    </Button>
                    </Link>
                </CardContent>
            </Card>
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Attendance Relay
                    </CardTitle>
                    <CardDescription>Log your incoming and outgoing shifts.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center gap-4">
                    <Button size="lg" variant="outline" onClick={() => handleAttendance('in')}>
                    <ArrowRight className="mr-2 h-5 w-5 text-green-500" />
                    Clock In
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => handleAttendance('out')}>
                    <ArrowRight className="mr-2 h-5 w-5 text-red-500 rotate-180" />
                    Clock Out
                    </Button>
                </CardContent>
            </Card>
        </div>

      <div className="grid gap-6 md:grid-cols-2">
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
    </div>
  );
}
