
'use client';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import type { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  SettingsCard,
  ApartmentRateManagementCard,
  UtilityContractorRateManagementCard,
  FineManagementCard,
  WorkShiftsCard
} from '@/components/app/kpi-cards/settings-card';
import { ApplicationSettingsCard } from '@/components/app/kpi-cards/application-settings-card';
import { AccountSettingsCard } from '@/components/app/kpi-cards/account-settings-card';

const AdminSettings = () => (
    <TabsContent value="admin" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ApartmentRateManagementCard />
            <UtilityContractorRateManagementCard />
            <FineManagementCard />
        </div>
        <WorkShiftsCard />
    </TabsContent>
)

const GeneralSettings = () => (
    <TabsContent value="general" className="space-y-4">
        <SettingsCard />
    </TabsContent>
)

const GlobalSettings = () => (
    <TabsContent value="global" className="space-y-4">
        <ApplicationSettingsCard />
    </TabsContent>
)

const AccountSettings = () => (
     <TabsContent value="accounts" className="space-y-4">
        <AccountSettingsCard />
    </TabsContent>
)

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;

  if (!role) {
      return (
          <Card>
              <CardHeader><CardTitle>Welcome</CardTitle></CardHeader>
              <CardContent><p>Please select a role from the login page to continue.</p></CardContent>
          </Card>
      );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and system configurations.
                </p>
            </div>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                {role === 'Admin' && <TabsTrigger value="admin">Admin</TabsTrigger>}
                {role === 'Admin' && <TabsTrigger value="accounts">Accounts</TabsTrigger>}
                {role === 'Admin' && <TabsTrigger value="global">Global</TabsTrigger>}
            </TabsList>
            <GeneralSettings />
            {role === 'Admin' && <AdminSettings />}
            {role === 'Admin' && <AccountSettings />}
            {role === 'Admin' && <GlobalSettings />}
        </Tabs>
    </div>
  );
}
