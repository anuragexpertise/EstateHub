
'use client';

import { useSearchParams } from 'next/navigation';
import {
  Shield,
  Building2,
  Wrench,
  UserCog,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types';
import * as React from 'react';
import { roleDisplayNames } from '@/lib/data';

const roleIcons: Record<UserRole, LucideIcon> = {
  Admin: UserCog,
  Apartment: Building2,
  Contractor: Wrench,
  Security: Shield,
};

export function SidebarNavHeader() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;

  if (!role) return null;

  const RoleIcon = roleIcons[role];
  const displayName = roleDisplayNames[role];

  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-primary font-semibold text-base sm:text-lg">
      <RoleIcon className="h-6 w-6" />
      <span>{displayName} Portal</span>
    </div>
  );
}
