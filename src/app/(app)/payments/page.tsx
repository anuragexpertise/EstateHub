'use client';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import type { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentsCard, PaymentHistoryCard } from '@/components/app/kpi-cards/payments-card';
import { ChargesAndPaymentHistoryCard } from '@/components/app/kpi-cards/charges-payment-history-card';

// Role-specific view components to ensure consistent hook calls

function AdminPaymentsView() {
  return (
    <div className="space-y-6">
      <PaymentsCard />
      <PaymentHistoryCard />
    </div>
  );
}

function SecurityPaymentsView() {
  return <PaymentsCard />;
}

function ApartmentPaymentsView() {
  return <ChargesAndPaymentHistoryCard />;
}

function ContractorPaymentsView() {
  return <PaymentHistoryCard />;
}


function PageSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-96" />
        </div>
    )
}

function PaymentsPageContent() {
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

  // This switch is now safe because each case returns a distinct component
  // with its own consistent set of hooks, and this component (`PaymentsPageContent`)
  // has a consistent hook count itself (only `useSearchParams`).
  switch(role) {
    case 'Admin':
      return <AdminPaymentsView />;
    case 'Security':
      return <SecurityPaymentsView />;
    case 'Apartment':
      return <ApartmentPaymentsView />;
    case 'Contractor':
      return <ContractorPaymentsView />;
    default:
      return <p>No payment information available.</p>;
  }
}

export default function PaymentsPage() {
  return (
    <React.Suspense fallback={<PageSkeleton />}>
        <PaymentsPageContent />
    </React.Suspense>
  );
}
