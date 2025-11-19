
'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { allNavItems } from '@/lib/data';

export function SidebarNav({ isMobile = false, onLinkClick }: { isMobile?: boolean, onLinkClick?: () => void }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const role = searchParams.get('role') as UserRole | null;

  if (!role) return null;

  const navItems = allNavItems.filter((item) => item.roles.includes(role));
  
  const linkClass = (href: string) => cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground",
    { "bg-muted text-primary": pathname === href },
    { "gap-4 px-2.5": isMobile }
  );

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (onLinkClick) {
      onLinkClick();
    }
  }

  return (
    <nav className={cn(
        "flex-1 overflow-auto p-4",
        { "grid items-start": !isMobile, "grid gap-6 text-lg font-medium p-0": isMobile }
    )}>
        {navItems.map((item) => (
            <Link 
              key={item.label} 
              href={`${item.href}?role=${role}`} 
              className={linkClass(item.href)}
              onClick={handleLinkClick}
            >
                <item.icon className="h-5 w-5" />
                {item.label}
            </Link>
        ))}
    </nav>
  );
}
