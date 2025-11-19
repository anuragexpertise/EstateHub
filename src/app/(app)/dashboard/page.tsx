
'use client';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import type { UserRole } from '@/types';
import { AdminDashboard } from '@/components/app/dashboard/admin-dashboard';
import { ApartmentDashboard } from '@/components/app/dashboard/apartment-dashboard';
import { ContractorDashboard } from '@/components/app/dashboard/contractor-dashboard';
import { SecurityDashboard } from '@/components/app/dashboard/security-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { EnrollCard } from '@/components/app/kpi-cards/enroll-card';
import { PaymentsCard, PaymentHistoryCard } from '@/components/app/kpi-cards/payments-card';
import { ScanCard } from '@/components/app/kpi-cards/scan-card';
import { PersonnelCard, SalaryHistoryCard } from '@/components/app/kpi-cards/personnel-card';
import { SettingsCard, RateManagementCard, WorkShiftsCard } from '@/components/app/kpi-cards/settings-card';
import { CustomizationPlaceholder } from '@/components/app/kpi-cards/customization-card';
import { usePathname } from 'next/navigation';
import CustomizePage from '../customize/page';

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

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const role = searchParams.get('role') as UserRole | null;

  const renderDashboard = () => {
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
            <CardHeader>
              <CardTitle>Welcome to EstateHub</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please select a role from the login page to continue.</p>
            </CardContent>
          </Card>
        );
    }
  };

  const renderCardsForPath = () => {
    switch (pathname) {
        case '/dashboard':
            return renderDashboard();
        case '/enroll':
            return <div className="grid gap-6"><EnrollCard /></div>;
        case '/payments':
            return (
              <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3"><PaymentHistoryCard /></div>
                {(role === 'Admin' || role === 'Security') && <div className="lg:col-span-2"><PaymentsCard /></div>}
              </div>
            );
        case '/scan':
            return <div className="grid gap-6"><ScanCard /></div>;
        case '/personnel':
            return (
              <div className="grid gap-6">
                <PersonnelCard />
                <SalaryHistoryCard />
              </div>
            )
        case '/settings':
            return (
                <div className="grid gap-6 md:grid-cols-2">
                    <SettingsCard />
                    {role === 'Admin' && <RateManagementCard />}
                    {role === 'Admin' && <WorkShiftsCard />}
                </div>
            )
        case '/customize':
            return <CustomizePage />;
        default:
            return renderDashboard();
    }
  }

  return (
    <React.Suspense fallback={<DashboardSkeleton />}>
      {renderCardsForPath()}
    </React.Suspense>
  );
}
