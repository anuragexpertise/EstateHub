
'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  UserPlus,
  Settings,
  CreditCard,
  ScanLine,
  Users,
  type LucideIcon,
  Brush,
} from 'lucide-react';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import * as React from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
};

const allNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Apartment', 'Contractor', 'Security'] },
  { href: '/payments', label: 'Payments', icon: CreditCard, roles: ['Admin', 'Apartment', 'Contractor', 'Security'] },
  { href: '/enroll', label: 'Enroll Entities', icon: UserPlus, roles: [] },
  { href: '/scan', label: 'Evaluate Pass', icon: ScanLine, roles: ['Admin'] },
  { href: '/personnel', label: 'Personnel', icon: Users, roles: [] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Apartment', 'Contractor', 'Security'] },
  { href: '/customize', label: 'Customize', icon: Brush, roles: ['Admin'] },
];


export function SidebarNav({ isMobile = false }: { isMobile?: boolean }) {
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

  return (
    <nav className={cn(
        "flex-1 overflow-auto p-4",
        { "grid items-start": !isMobile, "grid gap-6 text-lg font-medium p-0": isMobile }
    )}>
        {navItems.map((item) => (
            <Link key={item.label} href={`${item.href}?role=${role}`} className={linkClass(item.href)}>
                <item.icon className="h-5 w-5" />
                {item.label}
            </Link>
        ))}
    </nav>
  );
}
