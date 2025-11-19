
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
import { useCardStore } from '@/hooks/use-card-store';
import CustomizePage from '../customize/page';

const cardComponents: { [key: string]: React.ReactNode } = {
    'Enrollment': <EnrollCard />,
    'Payment History': <PaymentHistoryCard />,
    'New Payment': <PaymentsCard />,
    'Scan Pass': <ScanCard />,
    'Work Shift': <PersonnelCard />,
    'Salary History': <SalaryHistoryCard />,
    'User Settings': <SettingsCard />,
    'Rate Management': <RateManagementCard />,
    'Shift Management': <WorkShiftsCard />,
};

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
  const role = searchParams.get('role') as UserRole | null;
  const { getLayout } = useCardStore();

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
  
  if (!role) {
      return (
          <Card>
              <CardHeader><CardTitle>Welcome to EstateHub</CardTitle></CardHeader>
              <CardContent><p>Please select a role from the login page to continue.</p></CardContent>
          </Card>
      );
  }

  const layout = getLayout(role);

  return (
    <React.Suspense fallback={<DashboardSkeleton />}>
        {role ? (
            <div className="grid gap-6">
                {layout.map(cardId => (
                    <div key={cardId}>
                        {cardComponents[cardId]}
                    </div>
                ))}
                {layout.length === 0 && renderDashboard()}
            </div>
        ) : renderDashboard() }
    </React.Suspense>
  );
}
