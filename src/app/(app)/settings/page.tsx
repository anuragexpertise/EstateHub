
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
import { AccountsTableCard } from '@/components/app/kpi-cards/accounts-table-card';
import { CreateAccountCard } from '@/components/app/kpi-cards/create-account-card';

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

const PersonnelSettings = () => (
    <TabsContent value="personnel" className="space-y-4">
        <SettingsCard />
    </TabsContent>
)

const GlobalSettings = () => (
    <TabsContent value="global" className="space-y-4">
        <ApplicationSettingsCard />
    </TabsContent>
)

const AccountSettings = () => (
     <TabsContent value="accounts" className="space-y-6">
        <AccountSettingsCard />
        <CreateAccountCard />
        <AccountsTableCard />
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
  
  const isAdmin = role === 'Admin';

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

        <Tabs defaultValue={isAdmin ? "global" : "personnel"} className="space-y-4">
            <TabsList>
                {isAdmin && <TabsTrigger value="global">Global</TabsTrigger>}
                {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
                {isAdmin && <TabsTrigger value="accounts">Accounts</TabsTrigger>}
                <TabsTrigger value="personnel">Personnel</TabsTrigger>
            </TabsList>
            {isAdmin && <GlobalSettings />}
            {isAdmin && <AdminSettings />}
            {isAdmin && <AccountSettings />}
            <PersonnelSettings />
        </Tabs>
    </div>
  );
}
