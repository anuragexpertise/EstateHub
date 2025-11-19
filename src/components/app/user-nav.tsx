'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { users } from '@/lib/data';
import type { UserRole } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { QrCodeDisplay } from './qr-code';
import { Separator } from '../ui/separator';
import { LogOut } from 'lucide-react';

export function UserNav() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;
  const user = users.find((u) => u.role === role);

  if (!user || !role) return null;

  const avatarImage = PlaceHolderImages.find(img => img.id === user.avatarId);
  const qrData = { id: user.id, type: user.role, name: user.name };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
          <Avatar>
            {avatarImage && (
              <AvatarImage src={avatarImage.imageUrl} alt={user.name} data-ai-hint={avatarImage.imageHint} />
            )}
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="p-4">
            <div className="flex items-center gap-4">
                 <Avatar className="h-12 w-12">
                    {avatarImage && (
                    <AvatarImage src={avatarImage.imageUrl} alt={user.name} data-ai-hint={avatarImage.imageHint} />
                    )}
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.id}</p>
                </div>
            </div>
        </div>
        <Separator />
        <div className="p-2">
            <QrCodeDisplay
                data={qrData}
                title="Your Pass"
                description="Personal identification QR code."
            />
        </div>
        <Separator />
        <div className="p-2">
            <Link href="/" passHref>
                <Button variant="ghost" className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
