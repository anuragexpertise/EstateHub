
'use client';
import Image from 'next/image';
import { LoginForm } from '@/components/app/login-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/logo';
import { useGlobalStore } from '@/hooks/use-global-store';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { societyName, logoUrl } = useGlobalStore();
  const loginHeroPlaceholder = PlaceHolderImages.find((img) => img.id === 'login-hero');
  const [heroImage, setHeroImage] = useState(loginHeroPlaceholder?.imageUrl);

  useEffect(() => {
    // Ensure the state is initialized from localStorage before rendering the image
    const persistedState = useGlobalStore.getState();
    const url = persistedState.loginHeroUrl || loginHeroPlaceholder?.imageUrl;
    if (url) {
      setHeroImage(url);
    }
  }, [loginHeroPlaceholder?.imageUrl]);


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
              {logoUrl ? <Image src={logoUrl} alt={societyName} width={32} height={32} className="object-contain" /> : <Logo className="h-8 w-8 text-primary" />}
              <h1 className="text-3xl font-bold font-headline">{societyName}</h1>
            </div>
            <p className="text-balance text-muted-foreground">
              Select your role to access your dashboard
            </p>
          </div>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <a href="#" className="underline">
              Contact Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
