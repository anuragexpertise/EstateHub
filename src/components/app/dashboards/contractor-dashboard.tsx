'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { users, events } from "@/lib/data";
import { useSearchParams, useRouter } from 'next/navigation';
import { Building2, CalendarDays, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Payment } from '@/types';

function DashboardSkeleton() {
  return (
      <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
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
          <Skeleton className="h-64 w-full" />
      </div>
  )
}

export function ContractorDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role');
  const currentUser = users.find(u => u.role === 'Contractor'); // Simplified for demo
  const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  
  const { firestore } = useFirebase();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const receiptsQuery = useMemoFirebase(() => user ? collection(firestore, 'receipts') : null, [firestore, user]);
  const { data: paymentsData, isLoading } = useCollection<Payment>(receiptsQuery);

  if (isAuthLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  const payments = paymentsData || [];
  
  const totalApartments = users.filter(u => u.role === 'Apartment').length;
  const userPayments = payments.filter(p => p.userId === currentUser?.id).filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const visibleEvents = role ? events.filter(e => e.audience.includes('Contractor') && e.status === 'Sent' && new Date(e.dateTime) > new Date()) : [];

  const handleKpiClick = (page: 'payments' | 'users', filter?: string) => {
    if (page === 'users') {
        router.push(`/users?role=${role}&userRoleFilter=${filter}`);
    } else {
        router.push(`/${page}?role=${role}`);
    }
  }

  const kpis = [
    { title: "Apartment Owners", value: totalApartments, icon: Building2, page: 'users', filter: 'Apartment' },
    { title: "Total Payments", value: `₹${userPayments.toLocaleString()}`, icon: CreditCard, color: "text-green-600", page: 'payments' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {kpis.map(kpi => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div 
                className={cn("text-2xl font-bold", kpi.color, kpi.page && "cursor-pointer hover:underline")}
                onClick={() => kpi.page && handleKpiClick(kpi.page as any, kpi.filter)}
              >
                {kpi.value}
              </div>
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
                        <Badge variant="outline">{dateTimeFormatter.format(new Date(event.dateTime))}</Badge>
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
