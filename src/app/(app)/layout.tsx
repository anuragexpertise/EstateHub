
'use client';
import * as React from 'react';
import { SidebarNav } from '@/components/app/sidebar-nav';
import { UserNav } from '@/components/app/user-nav';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { PanelLeft } from 'lucide-react';
import { SidebarNavHeader } from '@/components/app/sidebar-nav-header';
import { DateTimeDisplay } from '@/components/app/date-time-display';
import { useGlobalStore } from '@/hooks/use-global-store';
import Image from 'next/image';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

function GlobalSettingsInitializer() {
  const { firestore, user } = useFirebase();
  const { initializeStore, isLoaded, ...defaults } = useGlobalStore();

  const settingsDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'global') : null, [firestore]);
  const { data: remoteSettings, isLoading } = useDoc(settingsDocRef);

  React.useEffect(() => {
    if (isLoading || isLoaded) return;

    if (remoteSettings) {
      initializeStore(remoteSettings);
    } else if (user && firestore) { 
      const { isLoaded: loaded, initializeStore: init, ...settingsToSave } = defaults;
      const settingsRef = doc(firestore, 'settings', 'global');
      setDoc(settingsRef, settingsToSave)
        .then(() => {
          initializeStore(settingsToSave);
        })
        .catch(err => {
          console.log("Could not initialize global settings, likely due to permissions.");
          initializeStore({});
        });
    } else {
        initializeStore({});
    }
  }, [isLoading, isLoaded, remoteSettings, initializeStore, firestore, user, defaults]);

  return null;
}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const { societyName, logoUrl } = useGlobalStore();

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <GlobalSettingsInitializer />
       <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <a
            href="#"
            className="hidden items-center gap-2 font-bold font-headline sm:flex"
          >
            {logoUrl ? <Image src={logoUrl} alt={societyName} width={24} height={24} className='object-contain' /> : <Logo className="h-6 w-6 text-primary" />}
            <span>{societyName}</span>
          </a>
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <a
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  {logoUrl ? <Image src={logoUrl} alt={societyName} width={20} height={20} className='object-contain' /> : <Logo className="h-5 w-5 transition-all group-hover:scale-110" />}
                  <span className="sr-only">{societyName}</span>
                </a>
                <SidebarNav isMobile={true} onLinkClick={handleLinkClick} />
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex justify-center items-center gap-4">
            <SidebarNavHeader />
            <DateTimeDisplay />
          </div>

          <div className="relative ml-auto flex-none">
            <UserNav />
          </div>
        </header>
        <div className="flex flex-1">
            <aside className="hidden w-60 flex-col border-r bg-background sm:flex">
                <SidebarNav />
            </aside>
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                {children}
            </main>
        </div>
    </div>
  );
}

    