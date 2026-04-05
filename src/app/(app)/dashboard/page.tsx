'use client';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import type { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminDashboard } from '@/components/app/dashboards/admin-dashboard';
import { ApartmentDashboard } from '@/components/app/dashboards/apartment-dashboard';
import { ContractorDashboard } from '@/components/app/dashboards/contractor-dashboard';
import { SecurityDashboard } from '@/components/app/dashboards/security-dashboard';

function DashboardSkeleton() {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-96" />
        </div>
    )
}

const RoleSpecificDashboard = ({ role }: { role: UserRole }) => {
    switch (role) {
        case 'Admin':
            return <AdminDashboard />;
        case 'Apartment':
            return <ApartmentDashboard />;
        case 'Contractor':
            return <ContractorDashboard />;
        case 'Security':
            return <SecurityDashboard />;
        default:
            return (
                <Card>
                    <CardHeader><CardTitle>Welcome</CardTitle></CardHeader>
                    <CardContent><p>Your dashboard is being set up.</p></CardContent>
                </Card>
            );
    }
}

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;
  
  if (!role) {
      return (
          <Card>
              <CardHeader><CardTitle>Welcome to EstateHub</CardTitle></CardHeader>
              <CardContent><p>Please select a role from the login page to continue.</p></CardContent>
          </Card>
      );
  }

  return <RoleSpecificDashboard role={role} />;
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<DashboardSkeleton />}>
        <DashboardPageContent />
    </React.Suspense>
  );
}
