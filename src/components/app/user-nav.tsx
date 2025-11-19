'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { users } from '@/lib/data';
import type { UserRole } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  LayoutDashboard,
  UserPlus,
  Settings,
  CreditCard,
  ScanLine,
  Users,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
};

const allNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Apartment', 'Contractor', 'Security'] },
  { href: '/payments', label: 'Payments', icon: CreditCard, roles: ['Admin', 'Apartment', 'Contractor', 'Security'] },
  { href: '/enroll', label: 'Enroll Entities', icon: UserPlus, roles: ['Admin'] },
  { href: '/scan', label: 'Evaluate Pass', icon: ScanLine, roles: ['Security', 'Admin'] },
  { href: '/personnel', label: 'Personnel', icon: Users, roles: ['Security'] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Apartment', 'Contractor', 'Security'] },
];

export function UserNav() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;
  const user = users.find((u) => u.role === role);

  if (!user || !role) return null;
  
  const navItems = allNavItems.filter((item) => item.roles.includes(role));
  const avatarImage = PlaceHolderImages.find(img => img.id === user.avatarId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
          <Avatar>
            {avatarImage && (
              <AvatarImage src={avatarImage.imageUrl} alt={user.name} data-ai-hint={avatarImage.imageHint} />
            )}
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="font-medium ">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {navItems.map((item) => (
           <DropdownMenuItem key={item.label} asChild>
              <Link href={`${item.href}?role=${role}`}>
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
              </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
