
'use client';
import * as React from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import type { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { EnrollCard } from '@/components/app/kpi-cards/enroll-card';
import { PaymentsCard, PaymentHistoryCard } from '@/components/app/kpi-cards/payments-card';
import { ScanCard } from '@/components/app/kpi-cards/scan-card';
import { PersonnelCard, SalaryHistoryCard } from '@/components/app/kpi-cards/personnel-card';
import { SettingsCard, RateManagementCard, WorkShiftsCard } from '@/components/app/kpi-cards/settings-card';
import { useCardStore } from '@/hooks/use-card-store';
import { InfoCard } from '@/components/app/kpi-cards/info-card';
import { ProfileCard } from '@/components/app/kpi-cards/profile-card';

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
    'Info': <InfoCard />,
    'Profile': <ProfileCard />,
};

function PageSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-96" />
        </div>
    )
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const role = searchParams.get('role') as UserRole | null;
  const { getLayout } = useCardStore();

  const pageKey = pathname.split('/').pop() || 'settings';

  if (!role) {
      return (
          <Card>
              <CardHeader><CardTitle>Welcome to EstateHub</CardTitle></CardHeader>
              <CardContent><p>Please select a role from the login page to continue.</p></CardContent>
          </Card>
      );
  }

  const layoutKey = `${role}-${pageKey}`;
  const layout = getLayout(layoutKey);

  return (
    <React.Suspense fallback={<PageSkeleton />}>
        <div className="space-y-6">
            {layout.map(cardId => (
                <div key={cardId}>
                    {cardComponents[cardId]}
                </div>
            ))}
            {layout.length === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This page is empty. Go to the 'Customize' page to add some cards!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    </React.Suspense>
  );
}
