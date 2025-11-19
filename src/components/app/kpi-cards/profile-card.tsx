'use client';
import { useSearchParams } from 'next/navigation';
import { UserProfileCard } from '@/components/app/dashboard/user-profile-card';
import { users } from '@/lib/data';
import type { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProfileCard() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;
  const user = users.find((u) => u.role === role);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User profile not available.</p>
        </CardContent>
      </Card>
    );
  }

  return <UserProfileCard user={user} />;
}
