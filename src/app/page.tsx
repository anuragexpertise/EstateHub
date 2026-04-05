'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { LoginForm } from '@/components/app/login-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/logo';
import { useGlobalStore } from '@/hooks/use-global-store';
import { users } from '@/lib/data';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function ReloginForm({ user, onSwitchUser }: { user: User; onSwitchUser: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const userAvatar = PlaceHolderImages.find((img) => img.id === user.avatarId);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // NOTE: This is for demonstration purposes only.
    // In a real application, you would make a secure API call to verify the password.
    setTimeout(() => {
      if (password === 'password') {
        toast({ title: 'Login Successful', description: `Welcome back, ${user.name}!` });
        router.push(`/dashboard?role=${user.role}`);
      } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Incorrect password.' });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar className="h-20 w-20">
          {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user.name} />}
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="text-balance font-semibold">Welcome back, {user.name}!</p>
      </div>
      <form onSubmit={handleLogin} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Log In
        </Button>
      </form>
      <Button variant="link" className="text-sm" onClick={onSwitchUser}>
        Not you? Log in as a different user
      </Button>
    </div>
  );
}


export default function LoginPage() {
  const { societyName, logoUrl } = useGlobalStore();
  const loginHeroPlaceholder = PlaceHolderImages.find((img) => img.id === 'login-hero');
  const [heroImage, setHeroImage] = useState(loginHeroPlaceholder?.imageUrl);
  const [rememberedUser, setRememberedUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const adminUser = users.find(user => user.role === 'Admin');
  const adminPhone = adminUser?.phone;

  useEffect(() => {
    setIsClient(true);
    const persistedState = useGlobalStore.getState();
    const url = persistedState.loginHeroUrl || loginHeroPlaceholder?.imageUrl;
    if (url) {
      setHeroImage(url);
    }
    
    const rememberedUserId = localStorage.getItem('rememberedUserId');
    if (rememberedUserId) {
      const user = users.find(u => u.id === rememberedUserId);
      if (user) {
        setRememberedUser(user);
      }
    }
  }, [loginHeroPlaceholder?.imageUrl]);

  const handleSwitchUser = () => {
    localStorage.removeItem('rememberedUserId');
    setRememberedUser(null);
  };
  
  if (!isClient) {
    // Return null on the server to avoid hydration mismatch with localStorage
    return null;
  }

  return (
    <div className="relative w-full min-h-screen">
      {heroImage && (
          <Image
            src={heroImage}
            alt={loginHeroPlaceholder?.description || 'Login hero image'}
            fill
            className="object-cover dark:brightness-[0.3]"
            data-ai-hint={loginHeroPlaceholder?.imageHint}
          />
        )}
      <div className="relative z-10 flex items-center justify-center w-full min-h-screen p-4">
        <div className="mx-auto grid w-[380px] gap-6 bg-card/80 dark:bg-card/70 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-white/20">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              {logoUrl ? <Image src={logoUrl} alt={societyName} width={64} height={64} className="object-contain" /> : <Logo className="h-16 w-16 text-primary" />}
              <h1 className="text-3xl font-bold font-headline">{societyName}</h1>
            </div>
            { !rememberedUser && (
              <p className="text-balance text-muted-foreground">
                Select your role to access your dashboard
              </p>
            )}
          </div>
          
          {rememberedUser ? <ReloginForm user={rememberedUser} onSwitchUser={handleSwitchUser} /> : <LoginForm />}

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <a href={adminPhone ? `tel:${adminPhone}` : '#'} className="underline">
              Contact Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
