'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/types';
import { Shield, Building2, Wrench, UserCog } from 'lucide-react';
import * as React from 'react';

const roles: { role: UserRole; icon: React.ElementType }[] = [
  { role: 'Admin', icon: UserCog },
  { role: 'Apartment', icon: Building2 },
  { role: 'Contractor', icon: Wrench },
  { role: 'Security', icon: Shield },
];

export function LoginForm() {
  const router = useRouter();

  const handleLogin = (role: UserRole) => {
    router.push(`/dashboard?role=${role}`);
  };

  return (
    <div className="grid gap-4">
      {roles.map(({ role, icon: Icon }) => (
        <Button
          key={role}
          variant="outline"
          className="w-full justify-start text-base py-6"
          onClick={() => handleLogin(role)}
        >
          <Icon className="mr-2 h-5 w-5" />
          Login as {role}
        </Button>
      ))}
    </div>
  );
}
