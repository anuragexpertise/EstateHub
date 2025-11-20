
'use client';
import Image from 'next/image';
import { LoginForm } from '@/components/app/login-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/logo';
import { useGlobalStore } from '@/hooks/use-global-store';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { societyName, loginHeroUrl, updateLoginHeroUrl } = useGlobalStore();
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
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Logo className="h-8 w-8 text-primary" />
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
      <div className="hidden bg-muted lg:block relative">
        {heroImage && (
          <Image
            src={heroImage}
            alt={loginHeroPlaceholder?.description || 'Login hero image'}
            fill
            className="object-cover dark:brightness-[0.3]"
            data-ai-hint={loginHeroPlaceholder?.imageHint}
          />
        )}
      </div>
    </div>
  );
}
