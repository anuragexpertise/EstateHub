'use client';

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
      <PopoverContent className="w-auto p-0" align="end">
        <QrCodeDisplay
          data={qrData}
          title={`${user.name}'s Pass`}
          description="Your personal identification QR code."
        />
      </PopoverContent>
    </Popover>
  );
}
