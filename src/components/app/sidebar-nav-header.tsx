
'use client';

import { useSearchParams } from 'next/navigation';
import type { UserRole } from '@/types';
import * as React from 'react';
import { roleDisplayNames, roleIcons, roleTextColors } from '@/lib/data';
import { cn } from '@/lib/utils';

export function SidebarNavHeader() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;

  if (!role) return null;

  const RoleIcon = roleIcons[role];
  const displayName = roleDisplayNames[role];
  const textColor = roleTextColors[role];

  return (
    <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2 font-semibold text-base sm:text-lg", textColor)}>
      <RoleIcon className="h-6 w-6" />
      <span>{displayName} Portal</span>
    </div>
  );
}
