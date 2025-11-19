
'use client';
import { useSearchParams } from 'next/navigation';
import type { UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brush, GripVertical } from 'lucide-react';

import { EnrollCard } from '@/components/app/kpi-cards/enroll-card';
import { PaymentsCard, PaymentHistoryCard } from '@/components/app/kpi-cards/payments-card';
import { ScanCard } from '@/components/app/kpi-cards/scan-card';
import { PersonnelCard, SalaryHistoryCard } from '@/components/app/kpi-cards/personnel-card';
import { SettingsCard, RateManagementCard, WorkShiftsCard } from '@/components/app/kpi-cards/settings-card';
import { AdminDashboard } from '@/components/app/dashboard/admin-dashboard';
import { ApartmentDashboard } from '@/components/app/dashboard/apartment-dashboard';
import { ContractorDashboard } from '@/components/app/dashboard/contractor-dashboard';
import { SecurityDashboard } from '@/components/app/dashboard/security-dashboard';

function DraggableCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="absolute top-4 right-4 text-muted-foreground cursor-move">
        <GripVertical />
      </div>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </div>
  );
}

const cardMapping: { [key: string]: { component: React.ReactNode, roles: UserRole[] } } = {
    'Admin Dashboard': { component: <AdminDashboard />, roles: ['Admin'] },
    'Apartment Dashboard': { component: <ApartmentDashboard />, roles: ['Apartment'] },
    'Contractor Dashboard': { component: <ContractorDashboard />, roles: ['Contractor'] },
    'Security Dashboard': { component: <SecurityDashboard />, roles: ['Security'] },
    'Enrollment': { component: <EnrollCard />, roles: ['Admin'] },
    'Payment History': { component: <PaymentHistoryCard />, roles: ['Admin', 'Apartment', 'Contractor', 'Security'] },
    'New Payment': { component: <PaymentsCard />, roles: ['Admin', 'Security'] },
    'Scan Pass': { component: <ScanCard />, roles: ['Admin', 'Security'] },
    'Work Shift': { component: <PersonnelCard />, roles: ['Security'] },
    'Salary History': { component: <SalaryHistoryCard />, roles: ['Security'] },
    'User Settings': { component: <SettingsCard />, roles: ['Admin', 'Apartment', 'Contractor', 'Security'] },
    'Rate Management': { component: <RateManagementCard />, roles: ['Admin'] },
    'Shift Management': { component: <WorkShiftsCard />, roles: ['Admin'] },
};


export default function CustomizePage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;

  if (!role) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please select a role to see customizable cards.</p>
        </CardContent>
      </Card>
    );
  }
  
  const availableCards = Object.entries(cardMapping).filter(([, { roles }]) => roles.includes(role));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brush className="h-5 w-5" />
            Customize Dashboard
          </CardTitle>
          <CardDescription>
            Drag and drop cards to rearrange your dashboard layout. This feature is coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {availableCards.map(([title, { component }]) => (
                <DraggableCard key={title} title={title}>
                    <div className="pointer-events-none opacity-50">
                        {component}
                    </div>
                </DraggableCard>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
