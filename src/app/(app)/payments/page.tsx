
'use client';
import * as React from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import type { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentsCard, PaymentHistoryCard } from '@/components/app/kpi-cards/payments-card';

function PageSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-96" />
        </div>
    )
}

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;
  
  if (!role) {
      return (
          <Card>
              <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
              <CardContent><p>Please select a role from the login page to continue.</p></CardContent>
          </Card>
      );
  }

  const renderContent = () => {
    switch(role) {
        case 'Admin':
            return (
                <div className="space-y-6">
                    <PaymentsCard />
                    <PaymentHistoryCard />
                </div>
            );
        case 'Security':
            return <PaymentsCard />;
        case 'Apartment':
        case 'Contractor':
            return <PaymentHistoryCard />;
        default:
            return <p>No payment information available.</p>;
    }
  }

  return (
    <React.Suspense fallback={<PageSkeleton />}>
        {renderContent()}
    </React.Suspense>
  );
}
